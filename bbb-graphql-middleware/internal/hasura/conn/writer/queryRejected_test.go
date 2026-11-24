package writer

import (
	"encoding/json"
	"strings"
	"testing"
	"time"

	"bbb-graphql-middleware/config"
	"bbb-graphql-middleware/internal/common"
	"bbb-graphql-middleware/internal/metricstest"
)

func refusalSubscribe(id, operationName, query string, variables map[string]interface{}) string {
	payload := map[string]interface{}{"operationName": operationName, "query": query}
	if variables != nil {
		payload["variables"] = variables
	}
	message, _ := json.Marshal(map[string]interface{}{"id": id, "type": "subscribe", "payload": payload})
	return string(message)
}

// Each input check of the writer loop refuses its case, which is counted under its reason and
// nothing else: the whole registry is compared before and after, and the only other series that
// moves is the wait in the query rate limiter, which every message goes through first. The four
// checks that answer send the browser an error and a complete for the operation, and the two lists
// send nothing. The refused operation is not stored, and a valid operation sent after it is the
// first thing Hasura receives.
func TestOperationsRefusedByTheInputChecksAreCountedByReason(t *testing.T) {
	common.RegisterMetrics()
	deep := "subscription Deep { a { b { c { d { e { f { g { h } } } } } } } }" // depth 8, the limit is 6
	nested := "query Nested { user(where: " + strings.Repeat("[", 5001) + strings.Repeat("]", 5001) + ") { userId } }"
	cases := []struct {
		reason   string
		message  string
		answered bool   // the browser gets an error and a complete
		sentinel string // a valid operation the check lets through
		setup    func(t *testing.T)
	}{
		{common.QueryRejectedMaxQueryLength, refusalSubscribe("1", "Long", "subscription Long { user { userId } }"+strings.Repeat(" ", 5001), nil), true, "Sentinel", nil},
		{common.QueryRejectedMaxQueryNesting, refusalSubscribe("2", "Nested", nested, nil), true, "Sentinel", func(t *testing.T) {
			saved := config.GetConfig().Server.MaxQueryLength
			config.GetConfig().Server.MaxQueryLength = 0
			t.Cleanup(func() { config.GetConfig().Server.MaxQueryLength = saved })
		}},
		{common.QueryRejectedMaxQueryDepth, refusalSubscribe("3", "Deep", deep, nil), true, "Sentinel", nil},
		{common.QueryRejectedMaxQueryVariablesLength, refusalSubscribe("4", "Vars", "subscription Vars($v: String) { user { userId } }", map[string]interface{}{"v": strings.Repeat("x", 10001)}), true, "Sentinel", nil},
		{common.QueryRejectedSubscriptionsAllowed, subscribeOperation("5", "NotAllowed"), false, "OnlyThisOne", func(t *testing.T) {
			saved := allowedSubscriptions
			allowedSubscriptions = []string{"OnlyThisOne"}
			t.Cleanup(func() { allowedSubscriptions = saved })
		}},
		{common.QueryRejectedSubscriptionsDenied, subscribeOperation("6", "Denied"), false, "Sentinel", func(t *testing.T) {
			saved := deniedSubscriptions
			deniedSubscriptions = []string{"Denied"}
			t.Cleanup(func() { deniedSubscriptions = saved })
		}},
	}
	for _, c := range cases {
		t.Run(c.reason, func(t *testing.T) {
			if c.setup != nil {
				c.setup(t)
			}
			var refused struct {
				ID string `json:"id"`
			}
			json.Unmarshal([]byte(c.message), &refused)
			browser := newBrowserConnection(true)
			w := startWriter(t, browser)
			before, err := metricstest.Series()
			if err != nil {
				t.Fatal(err)
			}
			key := `gql_query_rejected_total{reason="` + c.reason + `"}`
			if _, ok := before[key]; !ok {
				t.Fatalf("%s is not exported before any refusal", key)
			}

			w.send(c.message)
			w.waitUntil(t, func() bool {
				after, _ := metricstest.Series()
				return after[key] > before[key]
			})
			after, err := metricstest.Series()
			if err != nil {
				t.Fatal(err)
			}
			changed := metricstest.Changed(before, after)
			for name, delta := range changed {
				switch name {
				case key:
					if delta != 1 {
						t.Errorf("%s moved by %v, want 1", name, delta)
					}
				case "gql_query_rate_limit_wait_seconds count":
					if delta != 1 {
						t.Errorf("%s moved by %v, want 1", name, delta)
					}
				case "gql_query_rate_limit_wait_seconds sum":
				default:
					t.Errorf("%s moved by %v when the %s check refused an operation", name, delta, c.reason)
				}
			}
			if changed[key] != 1 {
				t.Errorf("%s: moved by %v, want 1", key, changed[key])
			}
			if _, stored := w.subscription(refused.ID); stored {
				t.Error("the refused operation was stored")
			}

			// What the browser receives for the refused operation.
			if c.answered {
				for _, want := range []string{"error", "complete"} {
					select {
					case message := <-browser.FromHasuraToBrowserChannel.ReceiveChannel():
						var got struct{ ID, Type string }
						json.Unmarshal(message, &got)
						if got.ID != refused.ID || got.Type != want {
							t.Errorf("the browser received %s, want a %s for id %s", message, want, refused.ID)
						}
					case <-time.After(5 * time.Second):
						t.Fatalf("the browser received no %s", want)
					}
				}
			}

			// A valid operation after the refused one is the first thing Hasura receives.
			w.send(subscribeOperation("99", c.sentinel))
			var first struct{ ID string }
			json.Unmarshal(w.expectSent(t), &first)
			if first.ID != "99" {
				t.Errorf("Hasura first received id %q, want the operation sent after the refused one", first.ID)
			}
			select {
			case message := <-browser.FromHasuraToBrowserChannel.ReceiveChannel():
				t.Errorf("the browser received %s, want nothing more", message)
			default:
			}
		})
	}
}
