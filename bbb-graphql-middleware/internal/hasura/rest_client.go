package hasura

import (
	"context"
	"crypto/tls"
	"io"
	"net/http"
	"os"
	"time"

	"bbb-graphql-middleware/config"
	"bbb-graphql-middleware/internal/common"

	log "github.com/sirupsen/logrus"
)

func PreLoadMeetingStaticDataCache(receivedMessage common.RedisMessage) {
	secret := os.Getenv("HASURA_GRAPHQL_ADMIN_SECRET")
	if secret == "" {
		log.Debug("Hasura admin password not found, skiping meetingStaticDataInternal cache")
		return
	}

	props, ok := receivedMessage.Core.Body["props"].(map[string]any)
	if !ok {
		return
	}
	meetingProp, ok := props["meetingProp"].(map[string]any)
	if !ok {
		return
	}
	meetingId, ok := meetingProp["intId"].(string)
	if !ok {
		return
	}

	// wait for database inserts
	time.Sleep(1500 * time.Millisecond)

	targetURL := config.GetConfig().Hasura.MeetingStaticDataInternalUrl + "/" + meetingId

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, targetURL, nil)
	if err != nil {
		log.Errorf("Error creating request for meetingStaticDataInternal cache (%s): %v", targetURL, err)
		return
	}

	// Hasura admin header
	req.Header.Set("x-hasura-admin-secret", secret)

	client := &http.Client{
		Timeout: 10 * time.Second,
		Transport: &http.Transport{
			TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
		},
	}

	resp, err := client.Do(req)
	if err != nil {
		log.Errorf("Error doing request for meetingStaticDataInternal cache (%s): %v", targetURL, err)
		return
	} else {
		log.Infof("Cache meetingStaticDataInternal created successfully (%s).", targetURL)
	}
	defer resp.Body.Close()

	if log.IsLevelEnabled(log.DebugLevel) {
		body, _ := io.ReadAll(resp.Body)
		log.Debugf("Status (%s): %s", targetURL, resp.Status)
		log.Debugf("Body (%s):%s", targetURL, string(body))
	} else {
		io.Copy(io.Discard, resp.Body)
	}
}
