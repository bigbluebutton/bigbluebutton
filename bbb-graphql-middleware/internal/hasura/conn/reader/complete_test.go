package reader

import (
	"testing"

	"bbb-graphql-middleware/internal/common"
	"bbb-graphql-middleware/internal/metricstest"

	"github.com/sirupsen/logrus"
)

func TestHandleCompleteMessageCountsTheRemoval(t *testing.T) {
	browser := &common.BrowserConnection{
		ActiveSubscriptions: map[string]common.GraphQlSubscription{"7": {Id: "7", OperationName: "getPolls", Type: common.Subscription}},
		Logger:              logrus.NewEntry(logrus.New()),
	}
	hasura := &common.HasuraConnection{Id: "HC1", BrowserConn: browser}
	removed := func() float64 {
		return metricstest.Value(common.GqlSubscriptionRemovedCounter.WithLabelValues(string(common.Subscription), "getPolls", common.RemovedByHasura))
	}

	before := removed()
	handleCompleteMessage(hasura, "7")
	handleCompleteMessage(hasura, "7") // already removed: not counted again
	if got := removed(); got != before+1 {
		t.Errorf("hasura_complete: %v -> %v, want +1", before, got)
	}
	if _, ok := browser.ActiveSubscriptions["7"]; ok {
		t.Error("the subscription was not removed")
	}
}

// A complete from Hasura handled after the connection closed: the subscription was counted when
// the connection closed, and is not counted again.
func TestACompleteAfterTheConnectionClosedIsNotCountedAgain(t *testing.T) {
	browser := &common.BrowserConnection{
		ActiveSubscriptions: map[string]common.GraphQlSubscription{"8": {Id: "8", OperationName: "getNotes", Type: common.Subscription}},
		Logger:              logrus.NewEntry(logrus.New()),
	}
	hasura := &common.HasuraConnection{Id: "HC1", BrowserConn: browser}
	removed := func(reason string) float64 {
		return metricstest.Value(common.GqlSubscriptionRemovedCounter.WithLabelValues(string(common.Subscription), "getNotes", reason))
	}

	closedBefore, completedBefore := removed(common.RemovedOnConnectionClose), removed(common.RemovedByHasura)
	common.RecordConnectionSubscriptionsRemoved(browser)
	handleCompleteMessage(hasura, "8")
	if got := removed(common.RemovedOnConnectionClose); got != closedBefore+1 {
		t.Errorf("connection_closed: %v -> %v, want +1", closedBefore, got)
	}
	if got := removed(common.RemovedByHasura); got != completedBefore {
		t.Errorf("hasura_complete: %v -> %v, want no change", completedBefore, got)
	}
}
