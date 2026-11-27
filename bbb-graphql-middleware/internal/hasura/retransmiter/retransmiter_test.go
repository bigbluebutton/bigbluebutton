package retransmiter

import (
	"context"
	"testing"

	"bbb-graphql-middleware/internal/common"
	"bbb-graphql-middleware/internal/metricstest"

	"github.com/sirupsen/logrus"
)

func TestRetransmitCountsEachSubscriptionResent(t *testing.T) {
	browser := &common.BrowserConnection{
		CurrentlyInMeeting:         true,
		ActiveSubscriptions:        map[string]common.GraphQlSubscription{},
		FromBrowserToHasuraChannel: common.NewSafeChannel[*common.BrowserMessage](10),
		Logger:                     logrus.NewEntry(logrus.New()),
	}
	browser.ActiveSubscriptions["1"] = common.GraphQlSubscription{Id: "1", OperationName: "getUsers", Type: common.Subscription, Message: []byte(`{"id":"1"}`), LastSeenOnHasuraConnection: "HC-old"}
	browser.ActiveSubscriptions["2"] = common.GraphQlSubscription{Id: "2", OperationName: "getUsers", Type: common.Subscription, Message: []byte(`{"id":"2"}`), LastSeenOnHasuraConnection: "HC-old"}
	browser.ActiveSubscriptions["3"] = common.GraphQlSubscription{Id: "3", OperationName: "getChat", Type: common.Subscription, Message: []byte(`{"id":"3"}`), LastSeenOnHasuraConnection: "HC-new"}
	hasura := &common.HasuraConnection{Id: "HC-new", BrowserConn: browser, Context: context.Background()}

	retransmitted := func(operationName string) float64 {
		return metricstest.Value(common.GqlSubscriptionRetransmittedCounter.WithLabelValues(string(common.Subscription), operationName))
	}
	users, chat := retransmitted("getUsers"), retransmitted("getChat")

	RetransmitSubscriptionStartMessages(hasura)

	if got := retransmitted("getUsers"); got != users+2 {
		t.Errorf("getUsers retransmissions: %v -> %v, want +2", users, got)
	}
	if got := retransmitted("getChat"); got != chat {
		t.Errorf("getChat was already on this Hasura connection and was counted: %v -> %v", chat, got)
	}
}

// A resend the connection to Hasura does not take, because it ended meanwhile, is not counted:
// the next connection resends it, and counts it.
func TestRetransmitCountsOnlyTheResendsQueued(t *testing.T) {
	browser := &common.BrowserConnection{
		CurrentlyInMeeting:         true,
		ActiveSubscriptions:        map[string]common.GraphQlSubscription{},
		FromBrowserToHasuraChannel: common.NewSafeChannel[*common.BrowserMessage](10),
		Logger:                     logrus.NewEntry(logrus.New()),
	}
	browser.ActiveSubscriptions["1"] = common.GraphQlSubscription{Id: "1", OperationName: "getPads", Type: common.Subscription, Message: []byte(`{"id":"1"}`), LastSeenOnHasuraConnection: "HC-old"}
	ended, cancel := context.WithCancel(context.Background())
	cancel()
	browser.FromBrowserToHasuraChannel.Close() // the browser connection is gone: nothing is queued
	hasura := &common.HasuraConnection{Id: "HC-new", BrowserConn: browser, Context: ended}

	retransmitted := func() float64 {
		return metricstest.Value(common.GqlSubscriptionRetransmittedCounter.WithLabelValues(string(common.Subscription), "getPads"))
	}
	before := retransmitted()
	RetransmitSubscriptionStartMessages(hasura)
	if got := retransmitted(); got != before {
		t.Errorf("a resend that was not queued was counted: %v -> %v", before, got)
	}
}

// A resend counts under the subscription's type and the capped label of its operationName, never
// under the name the client sent when that name is not admitted.
func TestRetransmitCountsUnderTheTypeAndTheCappedLabel(t *testing.T) {
	browser := &common.BrowserConnection{
		CurrentlyInMeeting:         true,
		ActiveSubscriptions:        map[string]common.GraphQlSubscription{},
		FromBrowserToHasuraChannel: common.NewSafeChannel[*common.BrowserMessage](10),
		Logger:                     logrus.NewEntry(logrus.New()),
	}
	browser.ActiveSubscriptions["1"] = common.GraphQlSubscription{
		Id: "1", OperationName: "get resent", OperationNameLabel: common.MetricOperationName("get resent"),
		Type: common.SubscriptionAggregate, Message: []byte(`{"id":"1"}`), LastSeenOnHasuraConnection: "HC-old",
	}
	hasura := &common.HasuraConnection{Id: "HC-new", BrowserConn: browser, Context: context.Background()}
	retransmitted := func(queryType common.QueryType, label string) float64 {
		return metricstest.Value(common.GqlSubscriptionRetransmittedCounter.WithLabelValues(string(queryType), label))
	}
	before := retransmitted(common.SubscriptionAggregate, common.OtherOperationLabel)

	RetransmitSubscriptionStartMessages(hasura)

	if got := retransmitted(common.SubscriptionAggregate, common.OtherOperationLabel); got != before+1 {
		t.Errorf("gql_subscription_retransmitted_total{type=subscription_aggregate,operationName=%q}: %v -> %v, want +1", common.OtherOperationLabel, before, got)
	}
	if got := retransmitted(common.SubscriptionAggregate, "get resent"); got != 0 {
		t.Errorf("the name outside the GraphQL grammar became a label: %v", got)
	}
}
