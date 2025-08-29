package gql_actions

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"regexp"
	"strings"
	"time"

	"bbb-graphql-middleware/config"
	"bbb-graphql-middleware/internal/common"

	"github.com/prometheus/client_golang/prometheus"
	log "github.com/sirupsen/logrus"
)

var graphqlActionsUrl = config.GetConfig().GraphqlActions.Url

func GraphqlActionsClient(
	browserConnection *common.BrowserConnection,
) error {
	browserConnection.Logger.Debug("Starting GraphqlActionsClient")
	defer browserConnection.Logger.Debug("Finished GraphqlActionsClient")

RangeLoop:
	for {
		select {
		case <-browserConnection.Context.Done():
			break RangeLoop
		case <-browserConnection.GraphqlActionsContext.Done():
			browserConnection.Logger.Debug("GraphqlActionsContext cancelled!")
			break RangeLoop
		case fromBrowserMessage := <-browserConnection.FromBrowserToGqlActionsChannel.ReceiveChannel():
			{
				if fromBrowserMessage == nil {
					continue
				}

				var browserMessage common.BrowserSubscribeMessage
				err := json.Unmarshal(fromBrowserMessage, &browserMessage)
				if err != nil {
					browserConnection.Logger.Errorf("failed to unmarshal message: %v", err)
					continue
				}

				if browserMessage.Type == "subscribe" {
					var mutationFuncName string

					if config.GetConfig().Server.MaxMutationLength > 0 {
						mutationLength := len(browserMessage.Payload.Query)
						if mutationLength > config.GetConfig().Server.MaxMutationLength {
							sendErrorMessage(
								browserConnection,
								browserMessage.ID,
								fmt.Sprintf(
									"Mutation %s is not valid with length %d and the max allowed is %d",
									browserMessage.Payload.OperationName,
									mutationLength, config.GetConfig().Server.MaxMutationLength))
							continue
						}
					}

					// Rate limiter from config max_connection_mutations_per_minute
					ctxRateLimiter, _ := context.WithTimeout(browserConnection.Context, 30*time.Second)
					if err := browserConnection.FromBrowserToGqlActionsRateLimiter.Wait(ctxRateLimiter); err != nil {
						sendErrorMessage(
							browserConnection,
							browserMessage.ID,
							fmt.Sprintf("Rate limit exceeded: Maximum %d mutations per minute allowed. Please try again later.", config.GetConfig().Server.MaxConnectionMutationsPerMinute),
						)

						continue
					}

					if strings.HasPrefix(browserMessage.Payload.Query, "mutation") {
						if funcName, inputs, err := parseGraphQLMutation(browserMessage.Payload.Query, browserMessage.Payload.Variables); err == nil {
							mutationFuncName = funcName
							if err = SendGqlActionsRequest(funcName, inputs, browserConnection.BBBWebSessionVariables, browserConnection.Logger); err == nil {
								// Add Prometheus Metrics
								common.GqlMutationsCounter.With(prometheus.Labels{"operationName": browserMessage.Payload.OperationName}).Inc()
							} else {
								sendErrorMessage(browserConnection, browserMessage.ID, fmt.Sprintf("It was not able to send the request to Graphql Actions: %s", err.Error()))
								continue
							}
						} else {
							sendErrorMessage(browserConnection, browserMessage.ID, fmt.Sprintf("It was not able to parse graphQL query: %s", err.Error()))
							continue
						}
					}

					// Action sent successfully, return data msg to client
					browserResponseData := map[string]interface{}{
						"id":   browserMessage.ID,
						"type": "next",
						"payload": map[string]interface{}{
							"data": map[string]interface{}{
								mutationFuncName: true,
							},
						},
					}
					jsonDataNext, _ := json.Marshal(browserResponseData)
					browserConnection.FromHasuraToBrowserChannel.Send(jsonDataNext)

					// Return complete msg to client
					browserResponseComplete := map[string]interface{}{
						"id":   browserMessage.ID,
						"type": "complete",
					}
					jsonDataComplete, _ := json.Marshal(browserResponseComplete)
					browserConnection.FromHasuraToBrowserChannel.Send(jsonDataComplete)
				}

				// Fallback to Hasura was disabled (keeping the code temporarily)
				// fromBrowserToHasuraChannel.Send(fromBrowserMessage)
			}
		}
	}

	return nil
}

func SendGqlActionsRequest(funcName string, inputs map[string]interface{}, sessionVariables map[string]string, bcLogger *log.Entry) error {
	logger := bcLogger.WithField("funcName", funcName).WithField("inputs", inputs)

	data := GqlActionsRequestBody{
		Action: GqlActionsAction{
			Name: funcName,
		},
		Input:            inputs,
		SessionVariables: sessionVariables,
	}

	if funcName == "userSetConnectionAlive" {
		if traceLog, traceLogExists := inputs["traceLog"]; traceLogExists && traceLog != "" {
			meetingId := sessionVariables["x-hasura-meetingid"]
			userId := sessionVariables["x-hasura-userid"]
			logger.Infof("Received %s meetingId=%s userId=%s", traceLog, meetingId, userId)

			now := time.Now().UTC()
			data.Input["traceLog"] = fmt.Sprintf("%s@gqlmiddleware|%s", traceLog, now.Format("2006-01-02T15:04:05.000Z"))
		}
	}

	jsonData, err := json.Marshal(data)
	if err != nil {
		return err
	}

	if graphqlActionsUrl == "" {
		return fmt.Errorf("No Graphql Actions Url (BBB_GRAPHQL_MIDDLEWARE_GRAPHQL_ACTIONS_URL) set, aborting")
	}

	startedAt := time.Now()

	response, err := http.Post(graphqlActionsUrl, "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		return err
	}
	defer response.Body.Close()

	totalDurationMillis := time.Since(startedAt).Milliseconds()
	logger = logger.WithField("duration", fmt.Sprintf("%v ms", totalDurationMillis)).WithField("statusCode", response.StatusCode)

	logger.Tracef("Executed!")
	if totalDurationMillis > 100 {
		logger.Infof("Took too long to execute!")
	}

	if response.StatusCode != 200 {
		body, err := ioutil.ReadAll(response.Body)
		if err != nil {
			fmt.Println("Error reading response body:", err)
		}

		var result map[string]interface{}
		err = json.Unmarshal(body, &result)
		if err == nil {
			if message, ok := result["message"].(string); ok {
				logger.Errorf(string(jsonData), message, err)
				return fmt.Errorf("graphql actions request failed: %s", message)
			}
		}

		return fmt.Errorf("graphql actions request failed: %s", response.Status)
	}

	return nil
}

type GqlActionsRequestBody struct {
	Action           GqlActionsAction       `json:"action"`
	Input            map[string]interface{} `json:"input"`
	SessionVariables map[string]string      `json:"session_variables"`
}

type GqlActionsAction struct {
	Name string `json:"name"`
}

func parseGraphQLMutation(query string, variables map[string]interface{}) (string, map[string]interface{}, error) {
	// Extract the function name from the query
	reFuncName := regexp.MustCompile(`\{\s*(\w+)`)
	funcNameMatch := reFuncName.FindStringSubmatch(query)
	if len(funcNameMatch) < 2 {
		return "", nil, fmt.Errorf("failed to extract function name from query")
	}
	funcName := funcNameMatch[1]

	// Prepare to extract and parse parameters
	queryParams := make(map[string]interface{})
	reParams := regexp.MustCompile(`\{[^(]+\(([^)]+)\)`)
	paramsMatch := reParams.FindStringSubmatch(query)
	if len(paramsMatch) >= 2 {
		paramSplitRegex := regexp.MustCompile("[,\n]")
		params := paramSplitRegex.Split(paramsMatch[1], -1)

		for _, param := range params {
			cleanedParam := strings.ReplaceAll(param, " ", "")
			if cleanedParam == "" {
				continue
			}
			paramParts := strings.Split(cleanedParam, ":")
			if len(paramParts) != 2 {
				continue // Skip invalid params
			}
			paramName, paramValue := strings.Trim(paramParts[0], " \t"), paramParts[1]

			// Handle variable substitution
			if strings.HasPrefix(paramValue, "$") {
				varName := strings.TrimPrefix(paramValue, "$")
				if value, ok := variables[varName]; ok {
					queryParams[paramName] = value
				}
			} else {
				queryParams[paramName] = paramValue
			}
		}
	}

	return funcName, queryParams, nil
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
	browserConnection.FromHasuraToBrowserChannel.Send(jsonDataError)

	// Return complete msg to client
	browserResponseComplete := map[string]interface{}{
		"id":   messageId,
		"type": "complete",
	}
	jsonDataComplete, _ := json.Marshal(browserResponseComplete)
	browserConnection.FromHasuraToBrowserChannel.Send(jsonDataComplete)
}
