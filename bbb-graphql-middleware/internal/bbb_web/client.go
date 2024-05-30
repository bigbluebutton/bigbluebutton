package bbb_web

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"net/http/cookiejar"
	"os"
	"strings"
	"time"

	log "github.com/sirupsen/logrus"
)

// authHookUrl is the authentication hook URL obtained from an environment variable.
var authHookUrl = os.Getenv("BBB_GRAPHQL_MIDDLEWARE_AUTH_HOOK_URL")

// BBBWebClient handles the web requests for authentication and returns a map of response headers.
func BBBWebClient(browserConnectionId string, sessionToken string, cookies []*http.Cookie) (map[string]string, error) {
	logger := log.WithField("_routine", "BBBWebClient").WithField("browserConnectionId", browserConnectionId)
	logger.Debug("Starting BBBWebClient")
	defer logger.Debug("Finished BBBWebClient")

	// Create a new HTTP client with a cookie jar.
	jar, err := cookiejar.New(nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create cookie jar: %v", err)
	}
	client := &http.Client{Jar: jar}

	// Check if the authentication hook URL is set.
	if authHookUrl == "" {
		return nil, fmt.Errorf("BBB_GRAPHQL_MIDDLEWARE_AUTH_HOOK_URL not set")
	}

	// Create a new HTTP request to the authentication hook URL.
	req, err := http.NewRequest("GET", authHookUrl, nil)
	if err != nil {
		return nil, err
	}

	// Add cookies to the request.
	for _, cookie := range cookies {
		req.AddCookie(cookie)
	}

	// Wait for SessionToken to be provided.
	for sessionToken == "" {
		time.Sleep(150 * time.Millisecond)
	}

	// Execute the HTTP request to obtain user session variables (like X-Hasura-Role)
	req.Header.Set("x-session-token", sessionToken)
	req.Header.Set("User-Agent", "hasura-graphql-engine")
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
		return nil, fmt.Errorf("auth token not authorized")
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
