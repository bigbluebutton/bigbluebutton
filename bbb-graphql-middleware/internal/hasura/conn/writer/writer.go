package writer

import (
	"bbb-graphql-middleware/internal/common"
	"bbb-graphql-middleware/internal/msgpatch"
	"context"
	"encoding/json"
	"errors"
	"github.com/prometheus/client_golang/prometheus"
	log "github.com/sirupsen/logrus"
	"nhooyr.io/websocket"
	"os"
	"strings"
	"sync"
)

var ()

func init() {

}

// HasuraConnectionWriter
// process messages (middleware to hasura)
func HasuraConnectionWriter(hc *common.HasuraConnection, wg *sync.WaitGroup, initMessage []byte) {
	log := log.WithField("_routine", "HasuraConnectionWriter")

	browserConnection := hc.BrowserConn

	log = log.WithField("browserConnectionId", browserConnection.Id).WithField("hasuraConnectionId", hc.Id)

	defer wg.Done()
	defer hc.ContextCancelFunc()
	defer log.Debugf("finished")

	//Send authentication (init) message at first
	//It will not use the channel (fromBrowserToHasuraChannel) because this msg must bypass ChannelFreeze
	if initMessage == nil {
		log.Errorf("it can't start Hasura Connection because initMessage is null")
		return
	}

	//Send init connection message to Hasura to start
	err := hc.Websocket.Write(hc.Context, websocket.MessageText, initMessage)
	if err != nil {
		log.Errorf("error on write authentication (init) message (we're disconnected from hasura): %v", err)
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
					log.Errorf("failed to unmarshal message: %v", err)
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
							if allowedSubscriptions := os.Getenv("BBB_GRAPHQL_MIDDLEWARE_ALLOWED_SUBSCRIPTIONS"); allowedSubscriptions != "" {
								allowedSubscriptionsSlice := strings.Split(allowedSubscriptions, ",")
								subscriptionAllowed := false
								for _, s := range allowedSubscriptionsSlice {
									if s == browserMessage.Payload.OperationName {
										subscriptionAllowed = true
										break
									}
								}

								if !subscriptionAllowed {
									log.Infof("Subscription %s not allowed!", browserMessage.Payload.OperationName)
									continue
								}
							}

							//Validate if subscription is allowed
							if deniedSubscriptions := os.Getenv("BBB_GRAPHQL_MIDDLEWARE_DENIED_SUBSCRIPTIONS"); deniedSubscriptions != "" {
								deniedSubscriptionsSlice := strings.Split(deniedSubscriptions, ",")
								subscriptionAllowed := true
								for _, s := range deniedSubscriptionsSlice {
									if s == browserMessage.Payload.OperationName {
										subscriptionAllowed = false
										break
									}
								}

								if !subscriptionAllowed {
									log.Infof("Subscription %s not allowed!", browserMessage.Payload.OperationName)
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
					if strings.HasPrefix(browserMessage.Payload.OperationName, "Patched_") {
						jsonPatchSupported = true
					}
					if jsonPatchDisabled := os.Getenv("BBB_GRAPHQL_MIDDLEWARE_JSON_PATCH_DISABLED"); jsonPatchDisabled != "" {
						jsonPatchSupported = false
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
					// log.Tracef("Current queries: %v", browserConnection.ActiveSubscriptions)
					browserConnection.ActiveSubscriptionsMutex.Unlock()

					common.ActivitiesOverviewStarted(string(messageType) + "-" + browserMessage.Payload.OperationName)
					common.ActivitiesOverviewStarted("_Sum-" + string(messageType))

					//Add Prometheus Metrics
					if messageType == common.Subscription {
						common.GqlSubscriptionCounter.With(prometheus.Labels{"operationName": browserMessage.Payload.OperationName}).Inc()
					} else if messageType == common.Streaming {
						common.GqlSubscriptionStreamingCounter.With(prometheus.Labels{"operationName": browserMessage.Payload.OperationName}).Inc()
					} else if messageType == common.Query {
						common.GqlQueriesCounter.With(prometheus.Labels{"operationName": browserMessage.Payload.OperationName}).Inc()
					}

					//Dump of all subscriptions for analysis purpose
					//queryCounter++
					//saveItToFile(fmt.Sprintf("%02d-%s-%s", queryCounter, string(messageType), browserMessage.Payload.OperationName), fromBrowserMessage)
					//saveItToFile(fmt.Sprintf("%s-%s-%02s", string(messageType), operationName, queryId), fromBrowserMessage)
				}

				if browserMessage.Type == "complete" {
					browserConnection.ActiveSubscriptionsMutex.RLock()
					jsonPatchSupported := browserConnection.ActiveSubscriptions[browserMessage.ID].JsonPatchSupported

					//Remove subscriptions from ActivitiesOverview here once Hasura-Reader will ignore "complete" msg for them
					common.ActivitiesOverviewCompleted(string(browserConnection.ActiveSubscriptions[browserMessage.ID].Type) + "-" + browserConnection.ActiveSubscriptions[browserMessage.ID].OperationName)
					common.ActivitiesOverviewCompleted("_Sum-" + string(browserConnection.ActiveSubscriptions[browserMessage.ID].Type))

					browserConnection.ActiveSubscriptionsMutex.RUnlock()
					if jsonPatchSupported {
						msgpatch.RemoveConnSubscriptionCacheFile(browserConnection.Id, browserConnection.SessionToken, browserMessage.ID)
					}
					browserConnection.ActiveSubscriptionsMutex.Lock()
					delete(browserConnection.ActiveSubscriptions, browserMessage.ID)
					// log.Tracef("Current queries: %v", browserConnection.ActiveSubscriptions)
					browserConnection.ActiveSubscriptionsMutex.Unlock()
				}

				if browserMessage.Type == "connection_init" {
					//browserConnection.ConnectionInitMessage = fromBrowserMessageAsMap
					//Skip message once it is handled by ConnInitHandler already
					continue
				}

				log.Tracef("sending to hasura: %s", string(fromBrowserMessage))
				errWrite := hc.Websocket.Write(hc.Context, websocket.MessageText, fromBrowserMessage)
				if errWrite != nil {
					if !errors.Is(errWrite, context.Canceled) {
						log.Errorf("error on write (we're disconnected from hasura): %v", errWrite)
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
