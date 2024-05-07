package gql_actions

import (
	"bytes"
	"encoding/json"
	"fmt"
	"github.com/iMDT/bbb-graphql-middleware/internal/bbb_web"
	"github.com/iMDT/bbb-graphql-middleware/internal/common"
	log "github.com/sirupsen/logrus"
	"net/http"
	"os"
	"regexp"
	"strings"
)

var graphqlActionsUrl = os.Getenv("BBB_GRAPHQL_MIDDLEWARE_GRAPHQL_ACTIONS_URL")

func GraphqlActionsClient(
	browserConnection *common.BrowserConnection,
	cookies []*http.Cookie,
	fromBrowserToGqlActionsChannel *common.SafeChannel,
	fromBrowserToHasuraChannel *common.SafeChannel,
	fromHasuraToBrowserChannel *common.SafeChannel) error {

	log := log.WithField("_routine", "GraphqlActionsClient").WithField("browserConnectionId", browserConnection.Id)
	log.Debug("Starting GraphqlActionsClient")
	defer log.Debug("Finished GraphqlActionsClient")

	sessionVariables, err := bbb_web.BBBWebClient(browserConnection, cookies)
	if err != nil {
		log.Error("It was not able to load session variables from AuthHook", err)
		return nil
	}

RangeLoop:
	for {
		select {
		case <-browserConnection.Context.Done():
			break RangeLoop
		case <-browserConnection.GraphqlActionsContext.Done():
			log.Debug("GraphqlActionsContext cancelled!")
			break RangeLoop
		case fromBrowserMessage := <-fromBrowserToGqlActionsChannel.ReceiveChannel():
			{
				if fromBrowserMessage == nil {
					continue
				}

				var fromBrowserMessageAsMap = fromBrowserMessage.(map[string]interface{})

				if fromBrowserMessageAsMap["type"] == "start" {
					queryId := fromBrowserMessageAsMap["id"].(string)
					payload := fromBrowserMessageAsMap["payload"].(map[string]interface{})

					query, okQuery := payload["query"].(string)
					variables, okVariables := payload["variables"].(map[string]interface{})
					if okQuery && okVariables && strings.HasPrefix(query, "mutation") {
						if funcName, inputs, err := parseGraphQLMutation(query, variables); err == nil {
							if err = SendGqlActionsRequest(funcName, inputs, sessionVariables); err == nil {
								//Action sent successfully, return data msg to client
								browserResponseData := map[string]interface{}{
									"id":   queryId,
									"type": "data",
									"payload": map[string]interface{}{
										"data": map[string]interface{}{
											funcName: true,
										},
									},
								}
								fromHasuraToBrowserChannel.Send(browserResponseData)

								//Return complete msg to client
								browserResponseComplete := map[string]interface{}{
									"id":   queryId,
									"type": "complete",
								}
								fromHasuraToBrowserChannel.Send(browserResponseComplete)

								continue
							} else {
								log.Error("It was not able to send the request to Graphql Actions", err)
							}
						} else {
							log.Error("It was not able to parse graphQL query", err)
						}
					}
				}
				//Something went wrong, forward message to Hasura (maybe it will be able to handle)
				log.Error("It was not able to parse a Mutation, forwarding it to Hasura", fromBrowserMessage)
				fromBrowserToHasuraChannel.Send(fromBrowserMessage)
			}
		}
	}

	return nil
}

func SendGqlActionsRequest(funcName string, inputs map[string]interface{}, sessionVariables map[string]string) error {
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

	response, err := http.Post(graphqlActionsUrl, "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		return err
	}
	defer response.Body.Close()

	if response.StatusCode != 200 {
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
			paramName, paramValue := paramParts[0], paramParts[1]

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
