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
		FromBrowserToHasuraChannel: common.NewSafeChannelByte(10),
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
