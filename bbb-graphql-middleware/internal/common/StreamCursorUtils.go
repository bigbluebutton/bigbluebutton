package common

import (
	"encoding/json"
	"fmt"
	log "github.com/sirupsen/logrus"
	"hash/crc32"
	"regexp"
	"strconv"
	"strings"
)

func GetStreamCursorPropsFromBrowserMessage(browserMessage BrowserSubscribeMessage) (string, string, interface{}) {
	streamCursorField := ""
	streamCursorVariableName := ""
	var streamCursorInitialValue interface{}

	cursorInitialValueRePattern := regexp.MustCompile(`cursor:\s*\{\s*initial_value\s*:\s*\{\s*([^:]+):\s*([^}]+)\s*}\s*}`)
	matches := cursorInitialValueRePattern.FindStringSubmatch(browserMessage.Payload.Query)
	if matches != nil {
		streamCursorField = matches[1]
		if strings.HasPrefix(matches[2], "$") {
			streamCursorVariableName, _ = strings.CutPrefix(matches[2], "$")
			if targetVariableValue, okTargetVariableValue := browserMessage.Payload.Variables[streamCursorVariableName]; okTargetVariableValue {
				streamCursorInitialValue = targetVariableValue
			}
		} else {
			streamCursorInitialValue = matches[2]
		}
	}

	return streamCursorField, streamCursorVariableName, streamCursorInitialValue
}

func GetLastStreamCursorValueFromReceivedMessage(message []byte, streamCursorField string) interface{} {
	dataChecksum := crc32.ChecksumIEEE(message)
	GlobalCacheLocks.Lock(dataChecksum)

	if streamCursorValueCache, streamCursorValueCacheExists := GetStreamCursorValueCache(dataChecksum); streamCursorValueCacheExists {
		//Unlock immediately once the cache was already created by other routine
		GlobalCacheLocks.Unlock(dataChecksum)
		return streamCursorValueCache
	} else {
		//It will create the cache and then Unlock (others will wait to benefit from this cache)
		defer GlobalCacheLocks.Unlock(dataChecksum)
	}

	var lastStreamCursorValue interface{}

	var messageAsMap map[string]interface{}
	err := json.Unmarshal(message, &messageAsMap)
	if err != nil {
		log.Errorf("failed to unmarshal message: %v", err)
		//return
	}

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

	StoreStreamCursorValueCache(dataChecksum, lastStreamCursorValue)
	return lastStreamCursorValue
}

func PatchQueryIncludingCursorField(originalQuery string, cursorField string) string {
	if cursorField == "" {
		return originalQuery
	}

	lastIndexOfTypename := LastButOneIndex(originalQuery, "}")
	if lastIndexOfTypename == -1 {
		return originalQuery
	}

	// It will include the cursorField at the end of the list of fields
	// It's not a problem if the field be duplicated in the list, Hasura just ignore the second occurrence
	return originalQuery[:lastIndexOfTypename] + "  " + cursorField + "\n  " + originalQuery[lastIndexOfTypename:]
}

func PatchQuerySettingLastCursorValue(subscription GraphQlSubscription) []byte {
	var browserMessage BrowserSubscribeMessage
	err := json.Unmarshal(subscription.Message, &browserMessage)
	if err != nil {
		log.Errorf("failed to unmarshal message: %v", err)
		return subscription.Message
	}

	if subscription.StreamCursorVariableName != "" {
		/**** This stream has its cursor value set through variables ****/
		if browserMessage.Payload.Variables[subscription.StreamCursorVariableName] == subscription.StreamCursorCurrValue {
			return subscription.Message
		}
		browserMessage.Payload.Variables[subscription.StreamCursorVariableName] = subscription.StreamCursorCurrValue
	} else {
		/**** This stream has its cursor value set through inline value (not variables) ****/
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

		newQuery := cursorInitialValueRePattern.ReplaceAllStringFunc(browserMessage.Payload.Query, replaceInitialValueFunc)
		if browserMessage.Payload.Query == newQuery {
			return subscription.Message
		}

		browserMessage.Payload.Query = newQuery
	}

	newMessageJson, _ := json.Marshal(browserMessage)

	return newMessageJson
}

func LastButOneIndex(s, substr string) int {
	last := strings.LastIndex(s, substr)
	if last == -1 {
		return -1
	}

	return strings.LastIndex(s[:last], substr)
}
