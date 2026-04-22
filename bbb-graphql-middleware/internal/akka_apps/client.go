package akka_apps

import (
	"bbb-graphql-middleware/config"
	"encoding/json"
	"fmt"
	log "github.com/sirupsen/logrus"
	"io/ioutil"
	"net/http"
	"strings"
)

var sessionVarsHookUrl = config.GetConfig().SessionVarsHook.Url

var internalError = fmt.Errorf("server internal error")
var internalErrorId = "internal_error"

func AkkaAppsGetSessionVariablesFrom(browserConnectionId string, sessionToken string, clientSessionUUID string) (map[string]string, error, string) {
	logger := log.WithField("_routine", "AkkaAppsClient").
		WithField("browserConnectionId", browserConnectionId).
		WithField("sessionToken", sessionToken).
		WithField("clientSessionUUID", clientSessionUUID)

	logger.Debug("Starting AkkaAppsClient")
	defer logger.Debug("Finished AkkaAppsClient")

	// Create a new HTTP client with a cookie jar.
	client := &http.Client{}

	// Check if the session_vars hook URL is set.
	if sessionVarsHookUrl == "" {
		log.Error("Config session_vars_hook.url not set")
		return nil, internalError, internalErrorId
	}

	log.Trace("Get user session vars from: " + sessionVarsHookUrl + "?sessionToken=" + sessionToken)

	// Create a new HTTP request to the session_vars hook URL.
	req, err := http.NewRequest("GET", sessionVarsHookUrl, nil)
	if err != nil {
		log.Error(err)
		return nil, internalError, internalErrorId
	}

	// Execute the HTTP request to obtain user session variables (like X-Hasura-Role)
	req.Header.Set("x-session-token", sessionToken)
	req.Header.Set("User-Agent", "bbb-graphql-middleware")
	resp, err := client.Do(req)
	if err != nil {
		return nil, internalError, internalErrorId
	}
	defer resp.Body.Close()

	respBody, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, internalError, internalErrorId
	}

	var respBodyAsMap map[string]string
	if err := json.Unmarshal(respBody, &respBodyAsMap); err != nil {
		return nil, internalError, internalErrorId
	}

	// Check the response status.
	response, ok := respBodyAsMap["response"]
	message, _ := respBodyAsMap["message"]
	messageId, _ := respBodyAsMap["message_id"]
	if !ok {
		log.Error("response key not found in the parsed object")
		return nil, internalError, internalErrorId
	}
	if response != "authorized" {
		logger.Errorf("not authorized: Response: %s, Message: %s, MessageId: %s", response, message, messageId)
		return nil, fmt.Errorf(message), messageId
	}

	// Normalize the response header keys.
	normalizedResponse := make(map[string]string)
	for key, value := range respBodyAsMap {
		if strings.HasPrefix(strings.ToLower(key), "x-hasura") {
			normalizedResponse[strings.ToLower(key)] = value
		}
	}

	return normalizedResponse, nil, ""
}
