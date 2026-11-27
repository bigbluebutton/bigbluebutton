package writer

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"slices"
	"strings"
	"sync"
	"time"

	"bbb-graphql-middleware/config"
	"bbb-graphql-middleware/internal/common"
	"bbb-graphql-middleware/internal/subscriptionlimit"

	"github.com/coder/websocket"
	"github.com/graphql-go/graphql/language/ast"
	"github.com/prometheus/client_golang/prometheus"
)

var (
	allowedSubscriptions    []string
	deniedSubscriptions     []string
	jsonPatchDisabled       = config.GetConfig().Server.JsonPatchDisabled
	dumpQueriesDir          = ""
	dumpQueriesCounter      = make(map[string]int)
	dumpQueriesCounterMutex sync.RWMutex
)

func init() {
	if config.GetConfig().Server.SubscriptionAllowedList != "" {
		allowedSubscriptions = strings.Split(config.GetConfig().Server.SubscriptionAllowedList, ",")
	}

	if config.GetConfig().Server.SubscriptionsDeniedList != "" {
		deniedSubscriptions = strings.Split(config.GetConfig().Server.SubscriptionsDeniedList, ",")
	}
	if config.GetConfig().DumpQueriesDir != "" {
		dumpQueriesDir = config.GetConfig().DumpQueriesDir
	}
}

// HasuraConnectionWriter
// process messages (middleware to hasura)
func HasuraConnectionWriter(hc *common.HasuraConnection, wg *sync.WaitGroup, initMessage []byte) {
	browserConnection := hc.BrowserConn

	defer wg.Done()
	defer hc.ContextCancelFunc()
	defer hc.BrowserConn.Logger.Debugf("finished")

	// Send authentication (init) message at first
	// It will not use the channel (fromBrowserToHasuraChannel) because this msg must bypass ChannelFreeze
	if initMessage == nil {
		hc.BrowserConn.Logger.Errorf("it can't start Hasura Connection because initMessage is null")
		return
	}

	// Send init connection message to Hasura to start
	err := hc.Websocket.Write(hc.Context, websocket.MessageText, initMessage)
	if err != nil {
		hc.BrowserConn.Logger.Errorf("error on write authentication (init) message (we're disconnected from hasura): %v", err)
		hc.SetCloseReason(common.ReconnectionHasuraWriteError)
		return
	}

RangeLoop:
	for {
		select {
		case <-hc.Context.Done():
			break RangeLoop
		case received := <-hc.BrowserConn.FromBrowserToHasuraChannel.ReceiveChannel():
			{
				if received == nil {
					continue
				}
				fromBrowserMessage := received.Raw

				// The reader decodes the messages it reads; a resend, or a message it could not
				// decode, is decoded here.
				browserMessage := received.Subscribe
				if browserMessage == nil {
					browserMessage = &common.BrowserSubscribeMessage{}
					err := json.Unmarshal(fromBrowserMessage, browserMessage)
					if err != nil {
						hc.BrowserConn.Logger.Errorf("failed to unmarshal message: %v", err)
						hc.SetCloseReason(common.ReconnectionInvalidBrowserMessage)
						return
					}
				}

				// The name of the operation: the name decided from the document, or the operationName
				// field of the message when there is none. The lists, the metric labels and the entry
				// use it, so a client cannot leave the field out to pass a named operation through them.
				operationName := browserMessage.Payload.OperationName

				if browserMessage.Type == "subscribe" {
					queryId := browserMessage.ID

					// Rate limiter from config max_connection_queries_per_minute
					ctxRateLimiter, cancelRateLimiter := context.WithTimeout(hc.Context, 30*time.Second)
					errRateLimiter := common.WaitForRateLimiter(ctxRateLimiter, hc.BrowserConn.FromBrowserToHasuraRateLimiter, common.GqlQueryRateLimitWait, common.GqlQueryRateLimitExceededCounter)
					cancelRateLimiter()
					if errRateLimiter != nil {
						sendErrorMessage(
							browserConnection,
							queryId,
							fmt.Sprintf("Rate limit exceeded: Maximum %d queries per minute allowed. Please try again later.", config.GetConfig().Server.MaxConnectionQueriesPerMinute),
						)

						continue
					}

					// The reader decides the operation of what it reads, and the retransmitter passes
					// on the type stored with a resend. A subscribe read before the connection was
					// authorized was not decided by the reader, and is decided here.
					operation := received.Operation
					if operation == nil {
						operation = common.DecideOperation(browserMessage.Payload.Query, browserMessage.Payload.OperationName)
					}
					operationName = operation.NameOr(browserMessage.Payload.OperationName)

					messageType := common.Query
					var lastReceivedDataChecksum uint32
					var lastReceivedData common.HasuraMessage
					streamCursorField := ""
					streamCursorVariableName := ""
					var streamCursorInitialValue interface{}
					queryIdExists := false
					var existingSubscriptionData common.GraphQlSubscription

					query := browserMessage.Payload.Query

					if config.GetConfig().Server.MaxQueryLength > 0 {
						queryLength := len(query)
						if queryLength > config.GetConfig().Server.MaxQueryLength {
							common.RecordQueryRejection(common.QueryRejectedMaxQueryLength)
							sendErrorMessage(
								browserConnection,
								queryId,
								fmt.Sprintf("Query %s is not valid with length %d and the max allowed is %d", operationName, queryLength, config.GetConfig().Server.MaxQueryLength))
							continue
						}
					}

					// Before anything parses the query, and whatever max_query_depth is.
					if tokens := common.CountNestingTokens(query); tokens > common.MaxNestingTokens {
						common.RecordQueryRejection(common.QueryRejectedMaxQueryNesting)
						sendErrorMessage(browserConnection, queryId, nestingLimitMessage(operationName, tokens))
						continue
					}

					if config.GetConfig().Server.MaxQueryDepth > 0 {
						if refusal := queryDepthRefusal(operation, query, operationName, config.GetConfig().Server.MaxQueryDepth); refusal != "" {
							// The nesting bound is checked above, so this refusal is on the depth.
							common.RecordQueryRejection(common.QueryRejectedMaxQueryDepth)
							sendErrorMessage(browserConnection, queryId, refusal)
							continue
						}
					}

					if len(browserMessage.Payload.Variables) > 0 {
						variablesLength, variablesErr := validateOperationVariablesLength(
							operation,
							browserMessage.Payload.Variables,
							config.GetConfig().Server.MaxQueryVariablesLength,
						)
						if variablesErr != nil {
							common.RecordQueryRejection(common.QueryRejectedMaxQueryVariablesLength)
							sendErrorMessage(
								browserConnection,
								queryId,
								fmt.Sprintf(
									"Query %s is not valid with variables length %d and the max allowed is %d",
									operationName,
									variablesLength,
									config.GetConfig().Server.MaxQueryVariablesLength,
								),
							)
							continue
						}
					}

					// The per-connection limit counts every entry the connection holds, queries and
					// mutations in flight included, whatever their type, and refuses only a
					// subscription. The id is looked up before the limit is checked, so a resend is
					// not counted as a new subscription.
					browserConnection.ActiveSubscriptionsMutex.RLock()
					existingEntry, entryExists := browserConnection.ActiveSubscriptions[queryId]
					heldEntries := len(browserConnection.ActiveSubscriptions)
					browserConnection.ActiveSubscriptionsMutex.RUnlock()

					if query != "" &&
						operation.Type.IsSubscription() &&
						config.GetConfig().Server.MaxConnectionConcurrentSubscriptions > 0 &&
						heldEntries >= config.GetConfig().Server.MaxConnectionConcurrentSubscriptions &&
						!isResend(existingEntry, entryExists, hc.Id) {
						// Log what is holding the slots once per connection, so the cause can be
						// identified without flooding the log on every rejected subscription.
						if browserConnection.SubscriptionLimitLogged.CompareAndSwap(false, true) {
							browserConnection.ActiveSubscriptionsMutex.RLock()
							operationNames := make([]string, 0, len(browserConnection.ActiveSubscriptions))
							for _, subscription := range browserConnection.ActiveSubscriptions {
								operationNames = append(operationNames, subscription.OperationName)
							}
							browserConnection.ActiveSubscriptionsMutex.RUnlock()

							browserConnection.Logger.
								WithField("rejectedOperation", subscriptionlimit.TruncateName(operationName)).
								WithField("activeSubscriptions", len(operationNames)).
								WithField("activeSubscriptionsByOperation", subscriptionlimit.SummarizeByOperation(operationNames)).
								Warn("Concurrent subscription limit reached")
						}

						recordSubscriptionLimitRejection(operation.Type, operationName)
						sendErrorMessage(
							browserConnection,
							queryId,
							fmt.Sprintf("Limit exceeded: Maximum %d concurrent subscriptions allowed.", config.GetConfig().Server.MaxConnectionConcurrentSubscriptions),
						)

						continue
					}

					if query != "" {
						if operation.Type.IsSubscription() {
							existingSubscriptionData, queryIdExists = existingEntry, entryExists

							// Validate if subscription is allowed
							if len(allowedSubscriptions) > 0 {
								subscriptionAllowed := slices.Contains(allowedSubscriptions, operationName)

								if !subscriptionAllowed {
									hc.BrowserConn.Logger.Infof("Subscription %s not allowed!", operationName)
									common.RecordQueryRejection(common.QueryRejectedSubscriptionsAllowed)
									continue
								}
							}

							// Validate if subscription is allowed
							if len(deniedSubscriptions) > 0 {
								subscriptionAllowed := !slices.Contains(deniedSubscriptions, operationName)

								if !subscriptionAllowed {
									hc.BrowserConn.Logger.Infof("Subscription %s not allowed!", operationName)
									common.RecordQueryRejection(common.QueryRejectedSubscriptionsDenied)
									continue
								}
							}

							messageType = operation.Type

							if queryIdExists {
								lastReceivedDataChecksum = existingSubscriptionData.LastReceivedDataChecksum
								lastReceivedData = existingSubscriptionData.LastReceivedData
								streamCursorField = existingSubscriptionData.StreamCursorField
								streamCursorVariableName = existingSubscriptionData.StreamCursorVariableName
								streamCursorInitialValue = existingSubscriptionData.StreamCursorCurrValue
							}

							if operation.Streaming {
								if !queryIdExists {
									streamCursorField, streamCursorVariableName, streamCursorInitialValue = common.GetStreamCursorPropsFromBrowserMessage(*browserMessage)

									// It's necessary to assure the cursor field will return in the result of the query
									// To be able to store the last received cursor value
									browserMessage.Payload.Query = common.PatchQueryIncludingCursorField(query, streamCursorField)

									newMessageJson, _ := json.Marshal(browserMessage)
									fromBrowserMessage = newMessageJson
								}
							}
						}

						if operation.Type == common.Mutation {
							messageType = common.Mutation
						}
					}

					// Identify if the client that requested this subscription expects to receive json-patch
					// Client append `Patched_` to the query operationName to indicate that it supports
					jsonPatchSupported := false
					if !jsonPatchDisabled && strings.HasPrefix(browserMessage.Payload.OperationName, "Patched_") {
						jsonPatchSupported = true
					}

					operationNameLabel := common.MetricOperationName(operationName)

					stored, alreadyActive := storeEntry(browserConnection, common.GraphQlSubscription{
						Id:                         queryId,
						Message:                    fromBrowserMessage,
						OperationName:              operationName,
						OperationNameLabel:         operationNameLabel,
						StreamCursorField:          streamCursorField,
						StreamCursorVariableName:   streamCursorVariableName,
						StreamCursorCurrValue:      streamCursorInitialValue,
						LastSeenOnHasuraConnection: hc.Id,
						JsonPatchSupported:         jsonPatchSupported,
						Type:                       messageType,
						LastReceivedDataChecksum:   lastReceivedDataChecksum,
						LastReceivedData:           lastReceivedData,
					})
					if !stored {
						// The browser connection closed while this message was handled, and its
						// subscriptions were already removed and counted: nothing would remove this one.
						continue
					}

					if messageType != common.Query && messageType != common.Mutation && config.GetConfig().Server.MaxConnectionConcurrentSubscriptions > 0 {
						logOnTwoThirdsOfLimit(browserConnection, config.GetConfig().Server.MaxConnectionConcurrentSubscriptions)
					}

					// Add Prometheus Metrics
					recordSubscriptionStart(messageType, operationNameLabel, alreadyActive)

					// Dump of all subscriptions for analysis purpose
					if dumpQueriesDir != "" {
						dumpQueriesCounterMutex.Lock()
						if _, exists := dumpQueriesCounter[browserConnection.Id]; !exists {
							dumpQueriesCounter[browserConnection.Id] = 1
						} else {
							dumpQueriesCounter[browserConnection.Id]++
						}
						counterValue := dumpQueriesCounter[browserConnection.Id]
						dumpQueriesCounterMutex.Unlock()

						if errSavingQueryDump := saveContentToFile(
							fmt.Sprintf("/%s/%s", common.GetUniqueID(), browserConnection.Id),
							fmt.Sprintf("%02d-%s-%s", counterValue, string(messageType), strings.ReplaceAll(operationName, "/", "_")),
							fromBrowserMessage,
						); errSavingQueryDump != nil {
							hc.BrowserConn.Logger.Error(errSavingQueryDump)
						}
					}
				}

				if browserMessage.Type == "complete" {
					// Remove subscriptions from ActivitiesOverview here once Hasura-Reader will ignore "complete" msg for them
					if subscription, removed := browserConnection.RemoveActiveSubscription(browserMessage.ID); removed {
						common.RecordSubscriptionRemoved(subscription, common.RemovedByClient)
					}

					// Iterate the canonical list rather than naming the streams here, so a stream
					// cannot be added to the list and missed in this teardown.
					browserConnection.ActiveStreamingsMutex.Lock()
					for _, streamName := range config.StreamingSubscriptionsManagedByMiddleware {
						if removed, newActiveStreamings := removeValueFromSlice(browserConnection.ActiveStreamings, streamName, browserMessage.ID); removed {
							browserConnection.ActiveStreamings = newActiveStreamings
						}
					}
					browserConnection.ActiveStreamingsMutex.Unlock()
				}

				if browserMessage.Type == "connection_init" {
					// browserConnection.ConnectionInitMessage = fromBrowserMessageAsMap
					// Skip message once it is handled by ConnInitHandler already
					continue
				}

				if !hc.BrowserConn.IsCurrentlyInMeeting() && // avoid sending to Hasura subscriptions that user doesn't have permission
					browserMessage.Type == "subscribe" &&
					!slices.Contains(config.AllowedSubscriptionsForNotInMeetingUsers, operationName) {
					hc.BrowserConn.Logger.Debugf("Not sending to Hasura %s because the user is not in meeting", operationName)
					continue
				} else {
					// Sending to Hasura
					if browserMessage.Type == "subscribe" {
						startFirstDataWait(browserConnection, browserMessage.ID)
					}
					hc.BrowserConn.Logger.Tracef("sending to hasura: %s", string(fromBrowserMessage))
					errWrite := hc.Websocket.Write(hc.Context, websocket.MessageText, fromBrowserMessage)
					if errWrite != nil {
						if !errors.Is(errWrite, context.Canceled) {
							hc.BrowserConn.Logger.Errorf("error on write (we're disconnected from hasura): %v", errWrite)
							hc.SetCloseReason(common.ReconnectionHasuraWriteError)
						}
						return
					}
				}
			}
		}
	}
}

func validateQueryVariablesLength(variables map[string]interface{}, maxLength int) (int, error) {
	encoded, err := json.Marshal(variables)
	if err != nil {
		return 0, fmt.Errorf("failed to encode variables: %w", err)
	}

	length := len(encoded)
	if maxLength > 0 && length > maxLength {
		return length, fmt.Errorf("variables length %d exceeds maximum %d", length, maxLength)
	}

	return length, nil
}

// validateOperationVariablesLength checks the variables of any operation but a mutation decided
// from the document. A mutation whose type comes from its text has its variables checked, as before.
func validateOperationVariablesLength(operation *common.Operation, variables map[string]interface{}, maxLength int) (int, error) {
	if operation.FromDocument && operation.Type == common.Mutation {
		return 0, nil
	}

	return validateQueryVariablesLength(variables, maxLength)
}

func saveContentToFile(subDir string, filename string, contentInBytes []byte) error {
	fileDir := fmt.Sprintf("%s/%s", dumpQueriesDir, subDir)
	filePath := fmt.Sprintf("%s/%s.txt", fileDir, filename)

	if _, err := os.Stat(fileDir); os.IsNotExist(err) {
		// Create directory (and parents if needed)
		err := os.MkdirAll(fileDir, 0o755)
		if err != nil {
			return fmt.Errorf("error creating directory: %v", err)
		}
	} else if err != nil {
		return fmt.Errorf("error checking directory: %v", err)
	}

	file, err := os.Create(filePath)
	if err != nil {
		return fmt.Errorf("error creating query dump: %v", err)
	}
	defer file.Close()

	_, err = file.Write(contentInBytes)
	if err != nil {
		return fmt.Errorf("error writing query dump: %v", err)
	}

	return nil
}

func nestingLimitMessage(operationName string, tokens int) string {
	return fmt.Sprintf("Query %s is not valid with %d braces and brackets and the max allowed is %d", operationName, tokens, common.MaxNestingTokens)
}

// queryDepthRefusal returns the message refusing a query on its depth, or "" to let it through. A
// query past the nesting bound is refused with the bound's message, so the refusal does not depend
// on that check running first in the loop. A query that does not parse keeps depth 0 and goes on,
// as before. The depth is read from the document the reader parsed; a resend, which carries no
// document, is parsed here, as the checks apply to it again.
func queryDepthRefusal(operation *common.Operation, query string, operationName string, maxDepth int) string {
	document, err := operation.Document, operation.ParseError
	if document == nil && err == nil {
		document, err = common.ParseQuery(query)
	}
	if errors.Is(err, common.ErrTooManyNestingTokens) {
		return nestingLimitMessage(operationName, common.CountNestingTokens(query))
	}
	if err != nil {
		return ""
	}
	if queryDepth := documentDepth(document); queryDepth > maxDepth {
		return fmt.Sprintf("Query %s is not valid with depth %d and the max allowed is %d", operationName, queryDepth, maxDepth)
	}

	return ""
}

func documentDepth(astDoc *ast.Document) int {
	maxDepth := 0
	for _, def := range astDoc.Definitions {
		if op, ok := def.(*ast.OperationDefinition); ok {
			depth := traverseSelectionSet(op.SelectionSet, 0)
			if depth > maxDepth {
				maxDepth = depth
			}
		}
	}

	return maxDepth
}

func traverseSelectionSet(selectionSet *ast.SelectionSet, currentDepth int) int {
	if selectionSet == nil {
		return currentDepth
	}

	currentDepth++
	maxDepth := currentDepth

	for _, selection := range selectionSet.Selections {
		var depth int
		switch sel := selection.(type) {
		case *ast.Field:
			depth = traverseSelectionSet(sel.SelectionSet, currentDepth)
		case *ast.InlineFragment:
			depth = traverseSelectionSet(sel.SelectionSet, currentDepth)
		case *ast.FragmentSpread:
			// Without a schema, we cannot resolve fragment spreads
			continue
		}
		if depth > maxDepth {
			maxDepth = depth
		}
	}

	return maxDepth
}

// isResend reports whether a subscribe repeats a subscription this browser connection already holds:
// the id is stored as a subscription, and the entry was last stored for another Hasura connection.
// A query, a mutation, or a subscription already stored for this Hasura connection is not a resend.
func isResend(existing common.GraphQlSubscription, exists bool, hasuraConnectionId string) bool {
	if !exists || existing.LastSeenOnHasuraConnection == hasuraConnectionId {
		return false
	}
	switch existing.Type {
	case common.Subscription, common.Streaming, common.SubscriptionAggregate:
		return true
	}
	return false
}

func sendErrorMessage(browserConnection *common.BrowserConnection, messageId string, errorMessage string) {
	browserConnection.Logger.Error(errorMessage)

	// Error on sending action, return error msg to client
	browserResponseData := map[string]interface{}{
		"id":   messageId,
		"type": "error",
		"payload": []interface{}{
			map[string]interface{}{
				"message": errorMessage,
			},
		},
	}
	jsonDataError, _ := json.Marshal(browserResponseData)
	browserConnection.FromHasuraToBrowserChannel.SendWait(browserConnection.Context, jsonDataError)

	// Return complete msg to client
	browserResponseComplete := map[string]interface{}{
		"id":   messageId,
		"type": "complete",
	}
	jsonDataComplete, _ := json.Marshal(browserResponseComplete)
	browserConnection.FromHasuraToBrowserChannel.SendWait(browserConnection.Context, jsonDataComplete)
}

func removeValueFromSlice(mapWithSlices map[string][]string, key string, value string) (bool, map[string][]string) {
	removed := false
	if slice, ok := mapWithSlices[key]; ok {
		if i := slices.Index(slice, value); i >= 0 {
			slice = slices.Delete(slice, i, i+1)
			if len(slice) == 0 {
				delete(mapWithSlices, key)
			} else {
				mapWithSlices[key] = slice
			}
			removed = true
		}
	}

	return removed, mapWithSlices
}

// recordSubscriptionStart counts an operation the browser started. A message whose id is already
// active is not counted: a resend after a reconnection to Hasura, which the retransmitter counts,
// or a subscribe the client repeats for an id it holds, which no counter counts.
func recordSubscriptionStart(messageType common.QueryType, operationNameLabel string, alreadyActive bool) {
	if alreadyActive {
		return
	}
	common.GqlSubscribeCounter.
		With(prometheus.Labels{
			"type":          string(messageType),
			"operationName": operationNameLabel,
		}).
		Inc()
}

// storeEntry stores the entry of a subscribe, unless the browser connection has closed, and reports
// whether it stored it and whether the id was already active. A record of the id, whatever its
// type, makes the message a resend. A subscription keeps whether its first data arrived, read in
// the same lock as the entry is written: the first data can arrive after the id was looked up for
// the limit, and a value from that earlier read would start the wait for it again.
func storeEntry(browserConnection *common.BrowserConnection, entry common.GraphQlSubscription) (stored bool, alreadyActive bool) {
	browserConnection.ActiveSubscriptionsMutex.Lock()
	defer browserConnection.ActiveSubscriptionsMutex.Unlock()
	if browserConnection.ActiveSubscriptionsClosed {
		return false, false
	}
	current, alreadyActive := browserConnection.ActiveSubscriptions[entry.Id]
	if entry.Type.IsSubscription() {
		entry.FirstDataReceived = current.FirstDataReceived
	}
	browserConnection.ActiveSubscriptions[entry.Id] = entry
	browserConnection.NoteActiveSubscriptionsLocked()
	return true, alreadyActive
}

// startFirstDataWait starts the wait for a subscription's first data each time it is forwarded
// to Hasura, until that data arrives. A record is written without a start, so a subscription
// held while the user is not in the meeting does not wait meanwhile, and a retransmission after
// a reconnection waits from the resend.
func startFirstDataWait(browserConnection *common.BrowserConnection, queryId string) {
	browserConnection.ActiveSubscriptionsMutex.Lock()
	defer browserConnection.ActiveSubscriptionsMutex.Unlock()
	subscription, ok := browserConnection.ActiveSubscriptions[queryId]
	if !ok || subscription.FirstDataReceived {
		return
	}
	subscription.FirstDataPendingSince = time.Now()
	browserConnection.ActiveSubscriptions[queryId] = subscription
}

// recordSubscriptionLimitRejection counts a subscription rejected by the per-connection limit of
// concurrent subscriptions.
func recordSubscriptionLimitRejection(messageType common.QueryType, operationName string) {
	common.GqlSubscriptionLimitRejectedCounter.
		WithLabelValues(string(messageType), common.MetricOperationName(operationName)).
		Inc()
}

// logOnTwoThirdsOfLimit logs, once per connection, what holds a connection's subscriptions when
// their number reaches two thirds of the limit: early enough to see a leak before subscriptions
// are rejected.
func logOnTwoThirdsOfLimit(browserConnection *common.BrowserConnection, limit int) {
	// The count and the names are read in one lock, so the warning, written once per connection,
	// shows the subscriptions that reached the threshold, not what is left of them a moment later.
	browserConnection.ActiveSubscriptionsMutex.RLock()
	reached := len(browserConnection.ActiveSubscriptions) >= limit*2/3 && !browserConnection.SubscriptionTwoThirdsLogged.Load()
	var operationNames []string
	if reached {
		operationNames = make([]string, 0, len(browserConnection.ActiveSubscriptions))
		for _, subscription := range browserConnection.ActiveSubscriptions {
			operationNames = append(operationNames, subscription.OperationName)
		}
	}
	browserConnection.ActiveSubscriptionsMutex.RUnlock()

	if !reached || !browserConnection.SubscriptionTwoThirdsLogged.CompareAndSwap(false, true) {
		return
	}

	browserConnection.Logger.
		WithField("activeSubscriptions", len(operationNames)).
		WithField("limit", limit).
		WithField("activeSubscriptionsByOperation", subscriptionlimit.SummarizeByOperation(operationNames)).
		Warn("Concurrent subscription count reached two thirds of the limit")
}
