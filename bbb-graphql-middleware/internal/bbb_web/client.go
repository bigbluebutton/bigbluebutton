package bbb_web

import (
	"fmt"
	log "github.com/sirupsen/logrus"
	"io/ioutil"
	"net/http"
	"net/http/cookiejar"
	"os"
)

// authHookUrl is the authentication hook URL obtained from an environment variable.
var authHookUrl = os.Getenv("BBB_GRAPHQL_MIDDLEWARE_AUTH_HOOK_URL")

func BBBWebClient(browserConnectionId string, sessionToken string, cookies []*http.Cookie) (string, string, error) {
	logger := log.WithField("_routine", "BBBWebClient").WithField("browserConnectionId", browserConnectionId)
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
		return "", "", fmt.Errorf("BBB_GRAPHQL_MIDDLEWARE_AUTH_HOOK_URL not set")
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
	req.Header.Set("x-original-uri", authHookUrl+"?sessionToken="+sessionToken)
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

	var respBodyAsString = string(respBody)

	if respBodyAsString != "authorized" {
		return "", "", fmt.Errorf("auth token not authorized")
	}

	var userId string
	var meetingId string

	//Get userId and meetingId from response Header
	for key, values := range resp.Header {
		for _, value := range values {
			log.Debug("%s: %s\n", key, value)

			if key == "User-Id" {
				userId = value
			}

			if key == "Meeting-Id" {
				meetingId = value
			}
		}
	}

	return meetingId, userId, nil
}
