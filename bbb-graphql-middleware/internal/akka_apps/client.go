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

// sessionVarsHookUrl is the authentication hook URL obtained from an environment variable.
var sessionVarsHookUrl = config.GetConfig().SessionVarsHook.Url

func AkkaAppsGetSessionVariablesFrom(browserConnectionId string, sessionToken string) (map[string]string, error) {
	logger := log.WithField("_routine", "AkkaAppsClient").
		WithField("browserConnectionId", browserConnectionId).
		WithField("sessionToken", sessionToken)

	logger.Debug("Starting AkkaAppsClient")
	defer logger.Debug("Finished AkkaAppsClient")

	// Create a new HTTP client with a cookie jar.
	client := &http.Client{}

	// Check if the authentication hook URL is set.
	if sessionVarsHookUrl == "" {
		return nil, fmt.Errorf("BBB_GRAPHQL_MIDDLEWARE_SESSION_VARS_HOOK_URL not set")
	}

	log.Trace("Get user session vars from: " + sessionVarsHookUrl + "?sessionToken=" + sessionToken)

	// Create a new HTTP request to the authentication hook URL.
	req, err := http.NewRequest("GET", sessionVarsHookUrl, nil)
	if err != nil {
		return nil, err
	}

	// Execute the HTTP request to obtain user session variables (like X-Hasura-Role)
	req.Header.Set("x-session-token", sessionToken)
	req.Header.Set("User-Agent", "bbb-graphql-middleware")
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	respBody, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	var respBodyAsMap map[string]string
	if err := json.Unmarshal(respBody, &respBodyAsMap); err != nil {
		return nil, err
	}

	// Check the response status.
	response, ok := respBodyAsMap["response"]
	if !ok {
		return nil, fmt.Errorf("response key not found in the parsed object")
	}
	if response != "authorized" {
		logger.Error(response)
		return nil, fmt.Errorf("user not authorized")
	}

	// Normalize the response header keys.
	normalizedResponse := make(map[string]string)
	for key, value := range respBodyAsMap {
		if strings.HasPrefix(strings.ToLower(key), "x-hasura") {
			normalizedResponse[strings.ToLower(key)] = value
		}
	}

	return normalizedResponse, nil
}
