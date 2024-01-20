package common

import (
	"fmt"
	"regexp"
	"strconv"
	"strings"
)

func GetStreamCursorPropsFromQuery(payload map[string]interface{}, query string) (string, string, interface{}) {
	streamCursorKey := ""
	streamCursorVariable := ""
	var streamCursorInitialValue interface{}

	regexPattern := `cursor:\s*\{\s*initial_value\s*:\s*\{\s*([^\:]+):\s*([^}]+)\s*\}\s*\}`
	re := regexp.MustCompile(regexPattern)
	matches := re.FindStringSubmatch(query)
	if matches != nil {
		streamCursorKey = matches[1]
		if strings.HasPrefix(matches[2], "$") {
			//Variable
			streamCursorVariable, _ = strings.CutPrefix(matches[2], "$")
			variables, ok := payload["variables"].(map[string]interface{})
			if ok {
				for varKey, varValue := range variables {
					if varKey == streamCursorVariable {
						streamCursorInitialValue = varValue
					}
				}
			}
		} else {
			streamCursorInitialValue = matches[2]
		}
	}

	return streamCursorKey, streamCursorVariable, streamCursorInitialValue
}

func GetLastStreamCursorValueFromReceivedMessage(messageAsMap map[string]interface{}, streamCursorKey string) interface{} {
	var lastStreamCursorValue interface{}

	if payload, okPayload := messageAsMap["payload"].(map[string]interface{}); okPayload {
		if data, okData := payload["data"].(map[string]interface{}); okData {
			//Data will have only one prop, `range` because its name is unknown
			for _, dataItem := range data {
				currentDataProp, okCurrentDataProp := dataItem.([]interface{})
				if okCurrentDataProp && len(currentDataProp) > 0 {
					// Get the last item directly (once it will contain the last cursor value)
					lastItemOfMessage := currentDataProp[len(currentDataProp)-1]
					if lastItemOfMessageAsMap, currDataOk := lastItemOfMessage.(map[string]interface{}); currDataOk {
						if lastItemValue, okLastItemValue := lastItemOfMessageAsMap[streamCursorKey]; okLastItemValue {
							lastStreamCursorValue = lastItemValue
							//fmt.Println("Descobriu ultimo valor: " + lastStreamCursorValue.(string))
						}
					}
				}
			}
		}
	}

	return lastStreamCursorValue
}

func ReplaceMessageWithLastCursorValue(subscription GraphQlSubscription) interface{} {
	var message = subscription.Message.(map[string]interface{})
	payload, okPayload := message["payload"].(map[string]interface{})

	if okPayload {
		if subscription.StreamCursorVariable != "" {
			/**** This stream has its cursor value set through variables ****/
			if variables, okVariables := payload["variables"].(map[string]interface{}); okVariables {
				if variables[subscription.StreamCursorVariable] != subscription.StreamCursorCurrValue {
					variables[subscription.StreamCursorVariable] = subscription.StreamCursorCurrValue
					payload["variables"] = variables
					message["payload"] = payload
				}
			}
		} else {
			/**** This stream has its cursor value set through inline value (not variables) ****/
			query, okQuery := payload["query"].(string)
			if okQuery {
				pattern := `cursor:\s*\{\s*initial_value\s*:\s*\{\s*([^\:]+:\s*[^}]+)\s*\}\s*\}`
				re := regexp.MustCompile(pattern)

				newValue := ""

				replaceInitialValueFunc := func(match string) string {
					switch v := subscription.StreamCursorCurrValue.(type) {
					case string:
						newValue = v

						//Append quotes if it is missing
						if !strings.HasPrefix(v, "\"") {
							newValue = "\"" + newValue
						}
						if !strings.HasSuffix(v, "\"") {
							newValue = newValue + "\""
						}
					case int:
						newValue = strconv.Itoa(v)
					case float32:
						myFloat64 := float64(v)
						newValue = strconv.FormatFloat(myFloat64, 'f', -1, 32)
					case float64:
						newValue = strconv.FormatFloat(v, 'f', -1, 64)
					default:
						newValue = ""
					}

					if newValue != "" {
						replacement := subscription.StreamCursorKey + ": " + newValue
						return fmt.Sprintf("cursor: {initial_value: {%s}}", replacement)
					} else {
						return match
					}
				}

				newQuery := re.ReplaceAllStringFunc(query, replaceInitialValueFunc)
				if query != newQuery {
					payload["query"] = newQuery
					message["payload"] = payload
				}
			}
		}
	}

	return message
}
