package bbb_web

import (
	"encoding/json"
	"fmt"
	"github.com/iMDT/bbb-graphql-middleware/internal/common"
	log "github.com/sirupsen/logrus"
	"io/ioutil"
	"net/http"
	"net/http/cookiejar"
	"os"
	"strings"
	"time"
)

var authHookUrl = os.Getenv("BBB_GRAPHQL_MIDDLEWARE_AUTH_HOOK_URL")

func BBBWebClient(browserConnection *common.BrowserConnection, cookies []*http.Cookie) (map[string]string, error) {
	log := log.WithField("_routine", "BBBWebClient").WithField("browserConnectionId", browserConnection.Id)
	log.Debug("Starting BBBWebClient")
	defer log.Debug("Finished BBBWebClient")

	jar, _ := cookiejar.New(nil)
	client := &http.Client{
		Jar: jar,
	}

	if authHookUrl == "" {
		return nil, fmt.Errorf("No auth hook url (BBB_GRAPHQL_MIDDLEWARE_AUTH_HOOK_URL) set, aborting")
	}

	req, err := http.NewRequest("GET", authHookUrl, nil)
	if err != nil {
		return nil, err
	}

	for _, cookie := range cookies {
		req.AddCookie(cookie)
	}

	//Wait until SessionToken was provided
	for {
		if browserConnection.SessionToken != "" {
			break
		}
		time.Sleep(150 * time.Millisecond)
	}

	req.Header.Set("x-session-token", browserConnection.SessionToken)
	req.Header.Set("User-Agent", "hasura-graphql-engine")

	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	//defer respJoin.Body.Close()
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	var objJoinResponse map[string]string
	errJoinXmlParse := json.Unmarshal(body, &objJoinResponse)
	if errJoinXmlParse != nil {
		return nil, errJoinXmlParse
	}

	response, ok := objJoinResponse["response"]
	if !ok {
		return nil, fmt.Errorf("Response not found")
	}
	if response != "authorized" {
		return nil, fmt.Errorf("Authtoken not authorized")
	}
	log.Debug("Created successfully.")

	//var newObjResponse map[string]string
	normalizedObjReponse := make(map[string]string)

	for i, a := range objJoinResponse {
		if strings.HasPrefix(strings.ToLower(i), "x-hasura") {
			normalizedObjReponse[strings.ToLower(i)] = a
		}
	}

	return normalizedObjReponse, nil

}
