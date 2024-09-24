package writer

import (
	"bbb-graphql-middleware/config"
	"bbb-graphql-middleware/internal/common"
	"context"
	"encoding/json"
	"errors"
	"github.com/prometheus/client_golang/prometheus"
	"nhooyr.io/websocket"
	"strings"
	"sync"
)

var allowedSubscriptions []string
var deniedSubscriptions []string
var jsonPatchDisabled = config.GetConfig().Server.JsonPatchDisabled

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

	//Send authentication (init) message at first
	//It will not use the channel (fromBrowserToHasuraChannel) because this msg must bypass ChannelFreeze
	if initMessage == nil {
		hc.BrowserConn.Logger.Errorf("it can't start Hasura Connection because initMessage is null")
		return
	}

	//Send init connection message to Hasura to start
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

				//var fromBrowserMessageAsMap = fromBrowserMessage.(map[string]interface{})

				var browserMessage common.BrowserSubscribeMessage
				err := json.Unmarshal(fromBrowserMessage, &browserMessage)
				if err != nil {
					hc.BrowserConn.Logger.Errorf("failed to unmarshal message: %v", err)
					return
				}

				if browserMessage.Type == "subscribe" {
					var queryId = browserMessage.ID

					//Identify type based on query string
					messageType := common.Query
					var lastReceivedDataChecksum uint32
					streamCursorField := ""
					streamCursorVariableName := ""
					var streamCursorInitialValue interface{}

					query := browserMessage.Payload.Query
					if query != "" {
						if strings.HasPrefix(query, "subscription") {
							//Validate if subscription is allowed
							if len(allowedSubscriptions) > 0 {
								subscriptionAllowed := false
								for _, s := range allowedSubscriptions {
									if s == browserMessage.Payload.OperationName {
										subscriptionAllowed = true
										break
									}
								}

								if !subscriptionAllowed {
									hc.BrowserConn.Logger.Infof("Subscription %s not allowed!", browserMessage.Payload.OperationName)
									continue
								}
							}

							//Validate if subscription is allowed
							if len(deniedSubscriptions) > 0 {
								subscriptionAllowed := true
								for _, s := range deniedSubscriptions {
									if s == browserMessage.Payload.OperationName {
										subscriptionAllowed = false
										break
									}
								}

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

									//It's necessary to assure the cursor field will return in the result of the query
									//To be able to store the last received cursor value
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

					//Identify if the client that requested this subscription expects to receive json-patch
					//Client append `Patched_` to the query operationName to indicate that it supports
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

					//Add Prometheus Metrics
					common.GqlSubscribeCounter.
						With(prometheus.Labels{
							"type":          string(messageType),
							"operationName": browserMessage.Payload.OperationName}).
						Inc()

					//Dump of all subscriptions for analysis purpose
					//queryCounter++
					//saveItToFile(fmt.Sprintf("%02d-%s-%s", queryCounter, string(messageType), browserMessage.Payload.OperationName), fromBrowserMessage)
					//saveItToFile(fmt.Sprintf("%s-%s-%02s", string(messageType), operationName, queryId), fromBrowserMessage)
				}

				if browserMessage.Type == "complete" {
					browserConnection.ActiveSubscriptionsMutex.RLock()
					//Remove subscriptions from ActivitiesOverview here once Hasura-Reader will ignore "complete" msg for them

					browserConnection.ActiveSubscriptionsMutex.RUnlock()
					browserConnection.ActiveSubscriptionsMutex.Lock()
					delete(browserConnection.ActiveSubscriptions, browserMessage.ID)
					// hc.BrowserConn.Logger.Tracef("Current queries: %v", browserConnection.ActiveSubscriptions)
					browserConnection.ActiveSubscriptionsMutex.Unlock()
				}

				if browserMessage.Type == "connection_init" {
					//browserConnection.ConnectionInitMessage = fromBrowserMessageAsMap
					//Skip message once it is handled by ConnInitHandler already
					continue
				}

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
