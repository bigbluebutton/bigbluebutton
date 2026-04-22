package bbb_web

import (
	"bbb-graphql-middleware/config"
	"encoding/json"
	"fmt"
	log "github.com/sirupsen/logrus"
	"io/ioutil"
	"net/http"
	"net/http/cookiejar"
	"strings"
)

// authHookUrl is the authentication hook URL obtained from config file.
var authHookUrl = config.GetConfig().AuthHook.Url

func BBBWebCheckAuthorization(browserConnectionId string, sessionToken string, clientSessionUUID string, cookies []*http.Cookie) (string, string, error) {
	logger := log.WithField("_routine", "BBBWebClient").
		WithField("browserConnectionId", browserConnectionId).
		WithField("sessionToken", sessionToken).
		WithField("clientSessionUUID", clientSessionUUID)

	logger.Debug("Starting BBBWebClient")
	defer logger.Debug("Finished BBBWebClient")

	// Create a new HTTP client with a cookie jar.
	jar, err := cookiejar.New(nil)
	if err != nil {
		return "", "", fmt.Errorf("failed to create cookie jar: %v", err)
	}
	client := &http.Client{Jar: jar}

	// Check if the authentication hook URL is set.
	if authHookUrl == "" {
		return "", "", fmt.Errorf("Config auth_hook.url not set")
	}

	// Create a new HTTP request to the authentication hook URL.
	req, err := http.NewRequest("GET", authHookUrl, nil)
	if err != nil {
		return "", "", err
	}

	// Add cookies to the request.
	for _, cookie := range cookies {
		req.AddCookie(cookie)
	}

	// Execute the HTTP request to obtain user session variables (like X-Hasura-Role)
	//req.Header.Set("x-original-uri", authHookUrl+"?sessionToken="+sessionToken)
	req.Header.Set("x-session-token", sessionToken)
	//req.Header.Set("User-Agent", "hasura-graphql-engine")
	resp, err := client.Do(req)
	if err != nil {
		return "", "", err
	}
	defer resp.Body.Close()

	respBody, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return "", "", err
	}

	log.Trace(string(respBody))

	var respBodyAsMap map[string]string
	if err := json.Unmarshal(respBody, &respBodyAsMap); err != nil {
		return "", "", err
	}

	// Check the response status.
	response, ok := respBodyAsMap["response"]
	if !ok {
		return "", "", fmt.Errorf("response key not found in the parsed object")
	}
	if response != "authorized" {
		logger.Error(response)
		return "", "", fmt.Errorf("user not authorized")
	}

	// Normalize the response header keys.
	normalizedResponse := make(map[string]string)
	for key, value := range respBodyAsMap {
		if strings.HasPrefix(strings.ToLower(key), "x-") {
			normalizedResponse[strings.ToLower(key)] = value
		}
	}

	var userId string
	var meetingId string

	//Get userId and meetingId from response Header
	for key, value := range normalizedResponse {
		log.Debug("%s: %s\n", key, value)

		if key == "x-userid" {
			userId = value
		}

		if key == "x-meetingid" {
			meetingId = value
		}
	}

	return meetingId, userId, nil
}
