package writer

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"slices"
	"strings"
	"sync"
	"time"

	"bbb-graphql-middleware/config"
	"bbb-graphql-middleware/internal/common"

	"github.com/coder/websocket"
	"github.com/graphql-go/graphql/language/ast"
	"github.com/graphql-go/graphql/language/parser"
	"github.com/graphql-go/graphql/language/source"
	"github.com/prometheus/client_golang/prometheus"
)

var (
	allowedSubscriptions []string
	deniedSubscriptions  []string
	jsonPatchDisabled    = config.GetConfig().Server.JsonPatchDisabled
)

func init() {
	if config.GetConfig().Server.SubscriptionAllowedList != "" {
		allowedSubscriptions = strings.Split(config.GetConfig().Server.SubscriptionAllowedList, ",")
	}

	if config.GetConfig().Server.SubscriptionsDeniedList != "" {
		deniedSubscriptions = strings.Split(config.GetConfig().Server.SubscriptionsDeniedList, ",")
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
		return
	}

RangeLoop:
	for {
		select {
		case <-hc.Context.Done():
			break RangeLoop
		case fromBrowserMessage := <-hc.BrowserConn.FromBrowserToHasuraChannel.ReceiveChannel():
			{
				if fromBrowserMessage == nil {
					continue
				}

				// var fromBrowserMessageAsMap = fromBrowserMessage.(map[string]interface{})

				var browserMessage common.BrowserSubscribeMessage
				err := json.Unmarshal(fromBrowserMessage, &browserMessage)
				if err != nil {
					hc.BrowserConn.Logger.Errorf("failed to unmarshal message: %v", err)
					return
				}

				if browserMessage.Type == "subscribe" {
					queryId := browserMessage.ID

					// Rate limiter from config max_connection_queries_per_minute
					ctxRateLimiter, _ := context.WithTimeout(hc.Context, 30*time.Second)
					if err := hc.BrowserConn.FromBrowserToHasuraRateLimiter.Wait(ctxRateLimiter); err != nil {
						sendErrorMessage(
							browserConnection,
							queryId,
							fmt.Sprintf("Rate limit exceeded: Maximum %d queries per minute allowed. Please try again later.", config.GetConfig().Server.MaxConnectionQueriesPerMinute),
						)

						continue
					}

					// Identify type based on query string
					messageType := common.Query
					var lastReceivedDataChecksum uint32
					streamCursorField := ""
					streamCursorVariableName := ""
					var streamCursorInitialValue interface{}

					query := browserMessage.Payload.Query

					if config.GetConfig().Server.MaxQueryDepth > 0 {
						queryDepth, _ := calculateQueryDepth(query)
						if queryDepth > config.GetConfig().Server.MaxQueryDepth {
							sendErrorMessage(
								browserConnection,
								queryId,
								fmt.Sprintf("Query %s is not valid with depth %d and the max allowed is %d", browserMessage.Payload.OperationName, queryDepth, config.GetConfig().Server.MaxQueryDepth))
							continue
						}
					}

					if config.GetConfig().Server.MaxQueryLength > 0 {
						queryLength := len(query)
						if queryLength > config.GetConfig().Server.MaxQueryLength {
							sendErrorMessage(
								browserConnection,
								queryId,
								fmt.Sprintf("Query %s is not valid with length %d and the max allowed is %d", browserMessage.Payload.OperationName, queryLength, config.GetConfig().Server.MaxQueryLength))
							continue
						}
					}

					if query != "" {
						if strings.HasPrefix(query, "subscription") {
							if config.GetConfig().Server.MaxConnectionConcurrentSubscriptions > 0 {
								browserConnection.ActiveSubscriptionsMutex.RLock()
								totalOfActiveSubscriptions := len(browserConnection.ActiveSubscriptions)
								browserConnection.ActiveSubscriptionsMutex.RUnlock()

								if totalOfActiveSubscriptions >= config.GetConfig().Server.MaxConnectionConcurrentSubscriptions {
									sendErrorMessage(
										browserConnection,
										queryId,
										fmt.Sprintf("Limit exceeded: Maximum %d concurrent subscriptions allowed.", config.GetConfig().Server.MaxConnectionConcurrentSubscriptions),
									)

									continue
								}
							}

							// Validate if subscription is allowed
							if len(allowedSubscriptions) > 0 {
								subscriptionAllowed := slices.Contains(allowedSubscriptions, browserMessage.Payload.OperationName)

								if !subscriptionAllowed {
									hc.BrowserConn.Logger.Infof("Subscription %s not allowed!", browserMessage.Payload.OperationName)
									continue
								}
							}

							// Validate if subscription is allowed
							if len(deniedSubscriptions) > 0 {
								subscriptionAllowed := !slices.Contains(deniedSubscriptions, browserMessage.Payload.OperationName)

								if !subscriptionAllowed {
									hc.BrowserConn.Logger.Infof("Subscription %s not allowed!", browserMessage.Payload.OperationName)
									continue
								}
							}

							messageType = common.Subscription

							browserConnection.ActiveSubscriptionsMutex.RLock()
							existingSubscriptionData, queryIdExists := browserConnection.ActiveSubscriptions[queryId]
							browserConnection.ActiveSubscriptionsMutex.RUnlock()
							if queryIdExists {
								lastReceivedDataChecksum = existingSubscriptionData.LastReceivedDataChecksum
								streamCursorField = existingSubscriptionData.StreamCursorField
								streamCursorVariableName = existingSubscriptionData.StreamCursorVariableName
								streamCursorInitialValue = existingSubscriptionData.StreamCursorCurrValue
							}

							if strings.Contains(query, "_stream(") && strings.Contains(query, "cursor: {") {
								messageType = common.Streaming
								if !queryIdExists {
									streamCursorField, streamCursorVariableName, streamCursorInitialValue = common.GetStreamCursorPropsFromBrowserMessage(browserMessage)

									// It's necessary to assure the cursor field will return in the result of the query
									// To be able to store the last received cursor value
									browserMessage.Payload.Query = common.PatchQueryIncludingCursorField(query, streamCursorField)

									newMessageJson, _ := json.Marshal(browserMessage)
									fromBrowserMessage = newMessageJson
								}
							}

							if strings.Contains(query, "_aggregate") && strings.Contains(query, "aggregate {") {
								messageType = common.SubscriptionAggregate
							}
						}

						if strings.HasPrefix(query, "mutation") {
							messageType = common.Mutation
						}
					}

					// Identify if the client that requested this subscription expects to receive json-patch
					// Client append `Patched_` to the query operationName to indicate that it supports
					jsonPatchSupported := false
					if !jsonPatchDisabled && strings.HasPrefix(browserMessage.Payload.OperationName, "Patched_") {
						jsonPatchSupported = true
					}

					browserConnection.ActiveSubscriptionsMutex.Lock()
					browserConnection.ActiveSubscriptions[queryId] = common.GraphQlSubscription{
						Id:                         queryId,
						Message:                    fromBrowserMessage,
						OperationName:              browserMessage.Payload.OperationName,
						StreamCursorField:          streamCursorField,
						StreamCursorVariableName:   streamCursorVariableName,
						StreamCursorCurrValue:      streamCursorInitialValue,
						LastSeenOnHasuraConnection: hc.Id,
						JsonPatchSupported:         jsonPatchSupported,
						Type:                       messageType,
						LastReceivedDataChecksum:   lastReceivedDataChecksum,
					}
					// hc.BrowserConn.Logger.Tracef("Current queries: %v", browserConnection.ActiveSubscriptions)
					browserConnection.ActiveSubscriptionsMutex.Unlock()

					// Add Prometheus Metrics
					common.GqlSubscribeCounter.
						With(prometheus.Labels{
							"type":          string(messageType),
							"operationName": browserMessage.Payload.OperationName,
						}).
						Inc()

					// Dump of all subscriptions for analysis purpose
					// queryCounter++
					// saveItToFile(fmt.Sprintf("%02d-%s-%s", queryCounter, string(messageType), browserMessage.Payload.OperationName), fromBrowserMessage)
					// saveItToFile(fmt.Sprintf("%s-%s-%02s", string(messageType), operationName, queryId), fromBrowserMessage)
				}

				if browserMessage.Type == "complete" {
					// Remove subscriptions from ActivitiesOverview here once Hasura-Reader will ignore "complete" msg for them
					browserConnection.ActiveSubscriptionsMutex.Lock()
					delete(browserConnection.ActiveSubscriptions, browserMessage.ID)
					// hc.BrowserConn.Logger.Tracef("Current queries: %v", browserConnection.ActiveSubscriptions)
					browserConnection.ActiveSubscriptionsMutex.Unlock()

					browserConnection.ActiveStreamingsMutex.Lock()
					if browserConnection.ActiveStreamings["getCursorCoordinatesStream"] == browserMessage.ID {
						delete(browserConnection.ActiveStreamings, "getCursorCoordinatesStream")
					}
					browserConnection.ActiveStreamingsMutex.Unlock()
				}

				if browserMessage.Type == "connection_init" {
					// browserConnection.ConnectionInitMessage = fromBrowserMessageAsMap
					// Skip message once it is handled by ConnInitHandler already
					continue
				}

				if !hc.BrowserConn.CurrentlyInMeeting && // avoid sending to Hasura subscriptions that user doesn't have permission
					browserMessage.Type == "subscribe" &&
					!slices.Contains(config.AllowedSubscriptionsForNotInMeetingUsers, browserMessage.Payload.OperationName) {
					hc.BrowserConn.Logger.Debugf("Not sending to Hasura %s because the user is not in meeting", browserMessage.Payload.OperationName)
					continue
				} else {
					// Sending to Hasura
					hc.BrowserConn.Logger.Tracef("sending to hasura: %s", string(fromBrowserMessage))
					errWrite := hc.Websocket.Write(hc.Context, websocket.MessageText, fromBrowserMessage)
					if errWrite != nil {
						if !errors.Is(errWrite, context.Canceled) {
							hc.BrowserConn.Logger.Errorf("error on write (we're disconnected from hasura): %v", errWrite)
						}
						return
					}
				}
			}
		}
	}
}

//
//var queryCounter = 0
//
//func saveItToFile(filename string, contentInBytes []byte) {
//	filePath := fmt.Sprintf("/tmp/%s.txt", filename)
//	//message, err := json.Marshal(contentInBytes)
//
//	fmt.Printf("Saving %s\n", filePath)
//
//	file, err := os.Create(filePath)
//	if err != nil {
//		panic(err)
//	}
//	defer file.Close()
//
//	_, err = file.Write(contentInBytes)
//	if err != nil {
//		panic(err)
//	}
//}

func calculateQueryDepth(query string) (int, error) {
	src := source.NewSource(&source.Source{
		Body: []byte(query),
		Name: "GraphQL query",
	})
	astDoc, err := parser.Parse(parser.ParseParams{
		Source: src,
	})
	if err != nil {
		return 0, fmt.Errorf("failed to parse query: %v", err)
	}

	maxDepth := 0
	for _, def := range astDoc.Definitions {
		if op, ok := def.(*ast.OperationDefinition); ok {
			depth := traverseSelectionSet(op.SelectionSet, 0)
			if depth > maxDepth {
				maxDepth = depth
			}
		}
	}

	return maxDepth, nil
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

func sendErrorMessage(browserConnection *common.BrowserConnection, messageId string, errorMessage string) {
	browserConnection.Logger.Errorf(errorMessage)

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
