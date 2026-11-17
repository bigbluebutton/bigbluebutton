package gql_actions

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"bbb-graphql-middleware/internal/common"

	"github.com/sirupsen/logrus"
	"golang.org/x/time/rate"
)

// runningClient is a GraphqlActionsClient for a browser connection, whose mutations go to a fake
// bbb-graphql-actions that accepts them.
type runningClient struct {
	browser *common.BrowserConnection
}

func startClient(t *testing.T, limiter *rate.Limiter) *runningClient {
	t.Helper()
	actions := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {}))
	saved := graphqlActionsUrl
	graphqlActionsUrl = actions.URL

	ctx, cancel := context.WithCancel(context.Background())
	browser := &common.BrowserConnection{
		Context:                            ctx,
		GraphqlActionsContext:              ctx,
		FromBrowserToGqlActionsChannel:     common.NewSafeChannelByte(10),
		FromBrowserToGqlActionsRateLimiter: limiter,
		FromHasuraToBrowserChannel:         common.NewSafeChannelByte(10),
		Logger:                             logrus.NewEntry(logrus.New()),
	}
	done := make(chan struct{})
	go func() {
		defer close(done)
		GraphqlActionsClient(browser)
	}()
	t.Cleanup(func() {
		cancel()
		<-done
		actions.Close()
		graphqlActionsUrl = saved
	})
	return &runningClient{browser: browser}
}

// mutate sends a mutation as the browser reader does, and returns the type of the first message
// the browser receives for it.
func (c *runningClient) mutate(t *testing.T, operationName string) string {
	t.Helper()
	message, _ := json.Marshal(map[string]interface{}{
		"id":   "m1",
		"type": "subscribe",
		"payload": map[string]interface{}{
			"operationName": operationName,
			"query":         `mutation ` + "M" + ` { userSetMuted(muted: true) }`,
		},
	})
	c.browser.FromBrowserToGqlActionsChannel.SendWait(context.Background(), message)
	select {
	case reply := <-c.browser.FromHasuraToBrowserChannel.ReceiveChannel():
		var received struct {
			Type string `json:"type"`
		}
		json.Unmarshal(reply, &received)
		return received.Type
	case <-time.After(5 * time.Second):
		t.Fatal("no reply to the mutation")
	}
	return ""
}
