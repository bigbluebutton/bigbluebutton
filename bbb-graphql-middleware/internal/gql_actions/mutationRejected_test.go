package gql_actions

import (
	"context"
	"encoding/json"
	"strings"
	"testing"
	"time"

	"bbb-graphql-middleware/internal/common"
	"bbb-graphql-middleware/internal/metricstest"

	"golang.org/x/time/rate"
)

// A mutation longer than max_mutation_length, through the client: the browser gets an error, and
// the refusal is counted under its reason and nothing else (the whole registry is compared before
// and after); the mutation is not counted in gql_mutation_total.
func TestAMutationOverTheLengthLimitIsCountedAsRefused(t *testing.T) {
	common.RegisterMetrics()
	c := startClient(t, rate.NewLimiter(rate.Inf, 1))
	before, err := metricstest.Series()
	if err != nil {
		t.Fatal(err)
	}
	key := `gql_query_rejected_total{reason="max_mutation_length"}`
	if _, ok := before[key]; !ok {
		t.Fatalf("%s is not exported before any refusal", key)
	}

	message, _ := json.Marshal(map[string]interface{}{
		"id":   "m1",
		"type": "subscribe",
		"payload": map[string]interface{}{
			"operationName": "TooLong",
			"query":         "mutation TooLong { userSetMuted(muted: true) }" + strings.Repeat(" ", 10001),
		},
	})
	c.browser.FromBrowserToGqlActionsChannel.SendWait(context.Background(), message)
	select {
	case reply := <-c.browser.FromHasuraToBrowserChannel.ReceiveChannel():
		var got struct{ Type string }
		json.Unmarshal(reply, &got)
		if got.Type != "error" {
			t.Fatalf("the mutation over the length limit was answered with %s, want an error", reply)
		}
	case <-time.After(5 * time.Second):
		t.Fatal("no reply to the mutation")
	}

	after, err := metricstest.Series()
	if err != nil {
		t.Fatal(err)
	}
	changed := metricstest.Changed(before, after)
	for name, delta := range changed {
		if name != key {
			t.Errorf("%s moved by %v when a mutation was refused by its length", name, delta)
		}
	}
	if changed[key] != 1 {
		t.Errorf("%s: moved by %v, want 1", key, changed[key])
	}
}
