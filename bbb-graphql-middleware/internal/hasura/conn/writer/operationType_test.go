package writer

import (
	"context"
	"encoding/json"
	"strings"
	"testing"

	"bbb-graphql-middleware/internal/common"
	"bbb-graphql-middleware/internal/hasura/retransmiter"
	"bbb-graphql-middleware/internal/metricstest"
)

// The characters GraphQL ignores before an operation, which once made the writer take a
// subscription for a query.
var leadingIgnored = map[string]string{
	"space":   " ",
	"newline": "\n",
	"comment": "# a comment\n",
	"comma":   ",",
}

func subscribeWithName(id, operationName, query string, variables map[string]interface{}) []byte {
	payload := map[string]interface{}{"operationName": operationName, "query": query}
	if variables != nil {
		payload["variables"] = variables
	}
	message, _ := json.Marshal(map[string]interface{}{"id": id, "type": "subscribe", "payload": payload})
	return message
}

func (w *testWriter) sendDecided(message []byte) {
	w.browser.FromBrowserToHasuraChannel.SendWait(context.Background(), asTheReaderSends(message))
}

func TestASubscriptionAfterIgnoredCharactersIsLimitedAsASubscription(t *testing.T) {
	for name, prefix := range leadingIgnored {
		t.Run(name, func(t *testing.T) {
			setSubscriptionLimit(t, 1)
			w := startTestWriter(t)
			w.setActive(common.GraphQlSubscription{Id: "1", OperationName: "getUsers", Type: common.Subscription})
			rejected := func() float64 {
				return metricstest.Value(common.GqlSubscriptionLimitRejectedCounter.WithLabelValues(string(common.Subscription), "getMeetings"))
			}
			before := rejected()

			w.sendDecided(subscribeWithName("2", "getMeetings", prefix+"subscription getMeetings { meeting { name } }", nil))
			w.expectBrowserError(t, "Limit exceeded")
			w.expectNotForwarded(t)
			if _, exists := w.active("2"); exists {
				t.Error("the subscription refused at the limit was stored")
			}
			if got := rejected(); got != before+1 {
				t.Errorf("gql_subscription_limit_rejected_total{type=subscription}: %v -> %v, want +1", before, got)
			}
		})
	}
}

func TestASubscriptionAfterIgnoredCharactersGoesThroughTheLists(t *testing.T) {
	for name, prefix := range leadingIgnored {
		t.Run(name, func(t *testing.T) {
			for _, list := range []struct {
				reason        string
				operationName string
				set           func() func()
			}{
				{common.QueryRejectedSubscriptionsDenied, "Denied", func() func() {
					saved := deniedSubscriptions
					deniedSubscriptions = []string{"Denied"}
					return func() { deniedSubscriptions = saved }
				}},
				{common.QueryRejectedSubscriptionsAllowed, "NotAllowed", func() func() {
					saved := allowedSubscriptions
					allowedSubscriptions = []string{"OnlyThisOne"}
					return func() { allowedSubscriptions = saved }
				}},
			} {
				restore := list.set()
				w := startTestWriter(t)
				before := metricstest.Value(common.GqlQueryRejectedCounter.WithLabelValues(list.reason))

				w.sendDecided(subscribeWithName("1", list.operationName, prefix+"subscription "+list.operationName+" { user { userId } }", nil))
				w.expectNotForwarded(t)
				if got := metricstest.Value(common.GqlQueryRejectedCounter.WithLabelValues(list.reason)); got != before+1 {
					t.Errorf("%s: %v -> %v, want +1", list.reason, before, got)
				}
				restore()
			}
		})
	}
}

func TestOperationsAfterIgnoredCharactersAreStoredWithTheirType(t *testing.T) {
	stream := `subscription getMessages($createdAt: timestamptz) { message_stream(batch_size: 10, cursor: {initial_value: {createdAt: $createdAt}}) { createdAt } }`
	for name, prefix := range leadingIgnored {
		t.Run(name, func(t *testing.T) {
			w := startTestWriter(t)

			w.sendDecided(subscribeWithName("1", "getUsers", prefix+"subscription getUsers { user { userId } }", nil))
			w.expectForwarded(t)
			if subscription, _ := w.active("1"); subscription.Type != common.Subscription {
				t.Errorf("subscription stored as %q", subscription.Type)
			}

			w.sendDecided(subscribeWithName("2", "getMessages", prefix+stream, map[string]interface{}{"createdAt": "2020-01-01"}))
			w.expectForwarded(t)
			if subscription, _ := w.active("2"); subscription.Type != common.Streaming || subscription.StreamCursorField != "createdAt" {
				t.Errorf("stream stored as %q with cursor field %q, want streaming with createdAt", subscription.Type, subscription.StreamCursorField)
			}

			// A mutation that reaches the writer is stored as one, and its variables are not
			// checked against max_query_variables_length.
			w.sendDecided(subscribeWithName("3", "userSetMuted", prefix+"mutation userSetMuted($muted: Boolean) { userSetMuted(muted: $muted) }",
				map[string]interface{}{"muted": strings.Repeat("x", 10001)}))
			w.expectForwarded(t)
			if subscription, _ := w.active("3"); subscription.Type != common.Mutation {
				t.Errorf("mutation stored as %q", subscription.Type)
			}
		})
	}
}

// A subscribe the reader did not decide, read before the connection was authorized, is decided by
// the writer, with the same function.
func TestASubscribeTheReaderDidNotDecideIsDecidedByTheWriter(t *testing.T) {
	setSubscriptionLimit(t, 1)
	w := startTestWriter(t)
	w.setActive(common.GraphQlSubscription{Id: "1", OperationName: "getUsers", Type: common.Subscription})

	undecided := common.DecodeBrowserMessage(subscribeWithName("2", "getMeetings", " subscription getMeetings { meeting { name } }", nil))
	w.browser.FromBrowserToHasuraChannel.SendWait(context.Background(), undecided)
	w.expectBrowserError(t, "Limit exceeded")
	w.expectNotForwarded(t)
}

// A resend carries the type stored when the subscription started: the writer does not decide it
// again from the text, which would make a subscription after a space a query.
func TestAResendKeepsTheTypeItWasStoredWith(t *testing.T) {
	setSubscriptionLimit(t, 1)
	w := startTestWriter(t)
	w.setActive(common.GraphQlSubscription{
		Id:                         "1",
		Message:                    subscribeWithName("1", "getUsers", " subscription getUsers { user { userId } }", nil),
		OperationName:              "getUsers",
		Type:                       common.Subscription,
		LastSeenOnHasuraConnection: "HC-old",
	})

	retransmiter.RetransmitSubscriptionStartMessages(w.hasura)
	w.expectForwarded(t)
	subscription, _ := w.active("1")
	if subscription.Type != common.Subscription || subscription.LastSeenOnHasuraConnection != w.hasura.Id {
		t.Errorf("the resend was stored as %q on %q, want a subscription on %q", subscription.Type, subscription.LastSeenOnHasuraConnection, w.hasura.Id)
	}
}

// The depth is read from the document the reader parsed, and from a parse of the resend for a
// resend, which carries no document.
func TestTheDepthIsCheckedOnTheDecidedDocumentAndOnAResend(t *testing.T) {
	deep := " subscription Deep { a { b { c { d { e { f { g { h } } } } } } } }"
	w := startTestWriter(t)
	w.sendDecided(subscribeWithName("1", "Deep", deep, nil))
	w.expectBrowserError(t, "depth 8")
	w.expectBrowserError(t, "complete")
	w.expectNotForwarded(t)

	w.setActive(common.GraphQlSubscription{
		Id:                         "2",
		Message:                    subscribeWithName("2", "Deep", deep, nil),
		OperationName:              "Deep",
		Type:                       common.Subscription,
		LastSeenOnHasuraConnection: "HC-old",
	})
	retransmiter.RetransmitSubscriptionStartMessages(w.hasura)
	w.expectBrowserError(t, "depth 8")
	w.expectNotForwarded(t)
}

// A client that leaves out the operationName field does not take a named operation past the lists
// or under another label: they use the name decided from the document.
func TestANamedDocumentWithoutTheOperationNameFieldUsesItsName(t *testing.T) {
	t.Run("denied list", func(t *testing.T) {
		saved := deniedSubscriptions
		deniedSubscriptions = []string{"Denied"}
		t.Cleanup(func() { deniedSubscriptions = saved })
		w := startTestWriter(t)
		before := metricstest.Value(common.GqlQueryRejectedCounter.WithLabelValues(common.QueryRejectedSubscriptionsDenied))

		w.sendDecided(subscribeWithName("1", "", "subscription Denied { user { userId } }", nil))
		w.expectNotForwarded(t)
		if got := metricstest.Value(common.GqlQueryRejectedCounter.WithLabelValues(common.QueryRejectedSubscriptionsDenied)); got != before+1 {
			t.Errorf("subscriptions_denied_list: %v -> %v, want +1", before, got)
		}
	})

	t.Run("label", func(t *testing.T) {
		w := startTestWriter(t)
		started := func() float64 {
			return metricstest.Value(common.GqlSubscribeCounter.WithLabelValues(string(common.Subscription), "getNamedInTheDocument"))
		}
		before := started()

		w.sendDecided(subscribeWithName("1", "", "subscription getNamedInTheDocument { user { userId } }", nil))
		w.expectForwarded(t)
		if got := started(); got != before+1 {
			t.Errorf("gql_subscription_total{operationName=getNamedInTheDocument}: %v -> %v, want +1", before, got)
		}
		if subscription, _ := w.active("1"); subscription.OperationName != "getNamedInTheDocument" || subscription.OperationNameLabel != "getNamedInTheDocument" {
			t.Errorf("stored under %q, label %q, want the name of the document", subscription.OperationName, subscription.OperationNameLabel)
		}
	})

	t.Run("not in the meeting", func(t *testing.T) {
		w := startTestWriter(t)
		w.browser.Lock()
		w.browser.CurrentlyInMeeting = false
		w.browser.Unlock()

		w.sendDecided(subscribeWithName("1", "", "subscription userCurrentSubscription { user_current { userId } }", nil))
		w.expectForwarded(t)
		w.sendDecided(subscribeWithName("2", "", "subscription getUsers { user { userId } }", nil))
		w.expectNotForwarded(t)
	})
}
