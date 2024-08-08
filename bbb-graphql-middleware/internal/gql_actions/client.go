package gql_actions

import (
	"bytes"
	"encoding/json"
	"fmt"
	"github.com/iMDT/bbb-graphql-middleware/internal/common"
	"github.com/prometheus/client_golang/prometheus"
	log "github.com/sirupsen/logrus"
	"io/ioutil"
	"net/http"
	"os"
	"regexp"
	"strings"
	"time"
)

var ()

func init() {
}

var graphqlActionsUrl = os.Getenv("BBB_GRAPHQL_MIDDLEWARE_GRAPHQL_ACTIONS_URL")

func GraphqlActionsClient(
	browserConnection *common.BrowserConnection) error {

	log := log.WithField("_routine", "GraphqlActionsClient").WithField("browserConnectionId", browserConnection.Id)
	log.Debug("Starting GraphqlActionsClient")
	defer log.Debug("Finished GraphqlActionsClient")

RangeLoop:
	for {
		select {
		case <-browserConnection.Context.Done():
			break RangeLoop
		case <-browserConnection.GraphqlActionsContext.Done():
			log.Debug("GraphqlActionsContext cancelled!")
			break RangeLoop
		case fromBrowserMessage := <-browserConnection.FromBrowserToGqlActionsChannel.ReceiveChannel():
			{
				if fromBrowserMessage == nil {
					continue
				}

				var browserMessage common.BrowserSubscribeMessage
				err := json.Unmarshal(fromBrowserMessage, &browserMessage)
				if err != nil {
					log.Errorf("failed to unmarshal message: %v", err)
					continue
				}

				if browserMessage.Type == "subscribe" {
					var errorMessage string
					var mutationFuncName string

					if strings.HasPrefix(browserMessage.Payload.Query, "mutation") {
						if funcName, inputs, err := parseGraphQLMutation(browserMessage.Payload.Query, browserMessage.Payload.Variables); err == nil {
							mutationFuncName = funcName
							if err = SendGqlActionsRequest(funcName, inputs, browserConnection.BBBWebSessionVariables, log); err == nil {
								//Add Prometheus Metrics
								common.GqlMutationsCounter.With(prometheus.Labels{"operationName": browserMessage.Payload.OperationName}).Inc()
							} else {
								errorMessage = err.Error()
								log.Error("It was not able to send the request to Graphql Actions", err)
							}
						} else {
							errorMessage = "It was not able to parse graphQL query"
							log.Error("It was not able to parse graphQL query", err)
						}
					}

					if errorMessage != "" {
						//Error on sending action, return error msg to client
						browserResponseData := map[string]interface{}{
							"id":   browserMessage.ID,
							"type": "error",
							"payload": []interface{}{
								map[string]interface{}{
									"message": errorMessage,
								},
							},
						}
						jsonData, _ := json.Marshal(browserResponseData)
						browserConnection.FromHasuraToBrowserChannel.Send(jsonData)
					} else {
						//Action sent successfully, return data msg to client
						browserResponseData := map[string]interface{}{
							"id":   browserMessage.ID,
							"type": "next",
							"payload": map[string]interface{}{
								"data": map[string]interface{}{
									mutationFuncName: true,
								},
							},
						}
						jsonData, _ := json.Marshal(browserResponseData)
						browserConnection.FromHasuraToBrowserChannel.Send(jsonData)
					}

					//Return complete msg to client
					browserResponseComplete := map[string]interface{}{
						"id":   browserMessage.ID,
						"type": "complete",
					}
					jsonData, _ := json.Marshal(browserResponseComplete)
					browserConnection.FromHasuraToBrowserChannel.Send(jsonData)
				}

				//Fallback to Hasura was disabled (keeping the code temporarily)
				//fromBrowserToHasuraChannel.Send(fromBrowserMessage)
			}
		}
	}

	return nil
}

func SendGqlActionsRequest(funcName string, inputs map[string]interface{}, sessionVariables map[string]string, logger *log.Entry) error {
	logger = logger.WithField("funcName", funcName).WithField("inputs", inputs)

	data := GqlActionsRequestBody{
		Action: GqlActionsAction{
			Name: funcName,
		},
		Input:            inputs,
		SessionVariables: sessionVariables,
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
