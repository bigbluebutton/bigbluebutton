package gql_actions

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"sync/atomic"
	"testing"
	"time"

	"bbb-graphql-middleware/internal/common"
	"bbb-graphql-middleware/internal/metricstest"

	"golang.org/x/time/rate"
)

var leadingIgnored = map[string]string{
	"none":    "",
	"space":   " ",
	"newline": "\n",
	"comment": "# a comment\n",
	"comma":   ",",
}

func (c *runningClient) send(t *testing.T, query string) string {
	t.Helper()
	message, _ := json.Marshal(map[string]interface{}{
		"id":      "m1",
		"type":    "subscribe",
		"payload": map[string]interface{}{"operationName": "userSetMuted", "query": query},
	})
	c.browser.FromBrowserToGqlActionsChannel.SendWait(context.Background(), common.DecodeBrowserMessage(message).Decide())
	select {
	case reply := <-c.browser.FromHasuraToBrowserChannel.ReceiveChannel():
		var received struct {
			Type string `json:"type"`
		}
		json.Unmarshal(reply, &received)
		<-c.browser.FromHasuraToBrowserChannel.ReceiveChannel() // its complete
		return received.Type
	case <-time.After(5 * time.Second):
		t.Fatal("no reply to the mutation")
	}
	return ""
}

// A mutation after characters GraphQL ignores is sent to bbb-graphql-actions, and goes through
// max_mutation_length and the mutation rate limiter, like any other.
func TestAMutationAfterIgnoredCharactersIsSentAndLimited(t *testing.T) {
	for name, prefix := range leadingIgnored {
		t.Run(name, func(t *testing.T) {
			c := startClient(t, rate.NewLimiter(0, 1)) // one mutation, no refill
			var requests atomic.Int32
			actions := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) { requests.Add(1) }))
			graphqlActionsUrl = actions.URL
			t.Cleanup(actions.Close)
			mutation := prefix + "mutation userSetMuted { userSetMuted(muted: true) }"

			if reply := c.send(t, mutation); reply != "next" || requests.Load() != 1 {
				t.Fatalf("answered %q after %d requests to bbb-graphql-actions, want next after 1", reply, requests.Load())
			}

			exceeded := metricstest.Value(common.GqlMutationRateLimitExceededCounter)
			if reply := c.send(t, mutation); reply != "error" || requests.Load() != 1 {
				t.Errorf("over the rate limit: answered %q after %d requests, want an error and no request", reply, requests.Load())
			}
			if got := metricstest.Value(common.GqlMutationRateLimitExceededCounter); got != exceeded+1 {
				t.Errorf("gql_mutation_rate_limit_exceeded_total: %v -> %v, want +1", exceeded, got)
			}

			tooLong := metricstest.Value(common.GqlQueryRejectedCounter.WithLabelValues(common.QueryRejectedMaxMutationLength))
			if reply := c.send(t, mutation+strings.Repeat(" ", 10001)); reply != "error" || requests.Load() != 1 {
				t.Errorf("over max_mutation_length: answered %q after %d requests, want an error and no request", reply, requests.Load())
			}
			if got := metricstest.Value(common.GqlQueryRejectedCounter.WithLabelValues(common.QueryRejectedMaxMutationLength)); got != tooLong+1 {
				t.Errorf("max_mutation_length rejections: %v -> %v, want +1", tooLong, got)
			}
		})
	}
}

// An operation that reaches this client without being a mutation (a message the reader routed on
// its text) is refused, and not answered as done.
func TestAnOperationThatIsNotAMutationIsRefused(t *testing.T) {
	c := startClient(t, rate.NewLimiter(rate.Inf, 1))
	var requests atomic.Int32
	actions := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) { requests.Add(1) }))
	graphqlActionsUrl = actions.URL
	t.Cleanup(actions.Close)

	message := []byte(`{"id":"m1","type":"subscribe","payload":{"operationName":"Broken","query":"subscription Broken {","extensions":{"query":"mutation"}}}`)
	c.browser.FromBrowserToGqlActionsChannel.SendWait(context.Background(), common.DecodeBrowserMessage(message).Decide())
	for _, want := range []string{"error", "complete"} {
		select {
		case reply := <-c.browser.FromHasuraToBrowserChannel.ReceiveChannel():
			var received struct{ Type string }
			json.Unmarshal(reply, &received)
			if received.Type != want {
				t.Errorf("the browser received %s, want a %s", reply, want)
			}
		case <-time.After(5 * time.Second):
			t.Fatalf("the browser received no %s", want)
		}
	}
	if requests.Load() != 0 {
		t.Errorf("%d requests to bbb-graphql-actions, want none", requests.Load())
	}
}
