package common

import (
	"fmt"
	"regexp"
	"strconv"
	"strings"
)

func GetStreamCursorPropsFromQuery(payload map[string]interface{}, query string) (string, string, interface{}) {
	streamCursorField := ""
	streamCursorVariableName := ""
	var streamCursorInitialValue interface{}

	cursorInitialValueRePattern := regexp.MustCompile(`cursor:\s*\{\s*initial_value\s*:\s*\{\s*([^:]+):\s*([^}]+)\s*}\s*}`)
	matches := cursorInitialValueRePattern.FindStringSubmatch(query)
	if matches != nil {
		streamCursorField = matches[1]
		if strings.HasPrefix(matches[2], "$") {
			streamCursorVariableName, _ = strings.CutPrefix(matches[2], "$")
			if variables, okVariables := payload["variables"].(map[string]interface{}); okVariables {
				if targetVariableValue, okTargetVariableValue := variables[streamCursorVariableName]; okTargetVariableValue {
					streamCursorInitialValue = targetVariableValue
				}
			}
		} else {
			streamCursorInitialValue = matches[2]
		}
	}

	return streamCursorField, streamCursorVariableName, streamCursorInitialValue
}

func GetLastStreamCursorValueFromReceivedMessage(messageAsMap map[string]interface{}, streamCursorField string) interface{} {
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
						if lastItemValue, okLastItemValue := lastItemOfMessageAsMap[streamCursorField]; okLastItemValue {
							lastStreamCursorValue = lastItemValue
						}
					}
				}
			}
		}
	}

	return lastStreamCursorValue
}

func PatchQueryIncludingCursorField(originalQuery string, cursorField string) string {
	if cursorField == "" {
		return originalQuery
	}

	lastIndex := strings.LastIndex(originalQuery, "{")
	if lastIndex == -1 {
		return originalQuery
	}

	// It will include the cursorField at the beginning of the list of fields
	// It's not a problem if the field be duplicated in the list, Hasura just ignore the second occurrence
	return originalQuery[:lastIndex+1] + "\n    " + cursorField + originalQuery[lastIndex+1:]
}

func PatchQuerySettingLastCursorValue(subscription GraphQlSubscription) interface{} {
	message := subscription.Message
	payload, okPayload := message["payload"].(map[string]interface{})

	if okPayload {
		if subscription.StreamCursorVariableName != "" {
			/**** This stream has its cursor value set through variables ****/
			if variables, okVariables := payload["variables"].(map[string]interface{}); okVariables {
				if variables[subscription.StreamCursorVariableName] != subscription.StreamCursorCurrValue {
					variables[subscription.StreamCursorVariableName] = subscription.StreamCursorCurrValue
					payload["variables"] = variables
					message["payload"] = payload
				}
			}
		} else {
			/**** This stream has its cursor value set through inline value (not variables) ****/
			query, okQuery := payload["query"].(string)
			if okQuery {
				cursorInitialValueRePattern := regexp.MustCompile(`cursor:\s*\{\s*initial_value\s*:\s*\{\s*([^:]+:\s*[^}]+)\s*}\s*}`)
				newValue := ""

				replaceInitialValueFunc := func(match string) string {
					switch v := subscription.StreamCursorCurrValue.(type) {
					case string:
						newValue = v

						//Append quotes if it is missing, it will be necessary when appending to the query
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
						replacement := subscription.StreamCursorField + ": " + newValue
						return fmt.Sprintf("cursor: {initial_value: {%s}}", replacement)
					} else {
						return match
					}
				}

				newQuery := cursorInitialValueRePattern.ReplaceAllStringFunc(query, replaceInitialValueFunc)
				if query != newQuery {
					payload["query"] = newQuery
					message["payload"] = payload
				}
			}
		}
	}

	return message
}
