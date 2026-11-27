package reader

import (
	"context"
	"fmt"
	"strings"
	"testing"

	"bbb-graphql-middleware/internal/common"
	"bbb-graphql-middleware/internal/hasura/retransmiter"
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

// A complete from Hasura is counted once the connection's lock is released: a scrape that waits on
// that lock does not hold the complete up.
func TestACompleteFromHasuraIsCountedOutsideTheConnectionLock(t *testing.T) {
	browser := &common.BrowserConnection{ActiveSubscriptions: map[string]common.GraphQlSubscription{}, Logger: logrus.NewEntry(logrus.New())}
	hasura := &common.HasuraConnection{Id: "HC1", BrowserConn: browser}
	metricstest.ScrapeWhileLocked(t, &browser.ActiveSubscriptionsMutex, 4000, func(run int) {
		id := fmt.Sprint(run)
		browser.ActiveSubscriptionsMutex.Lock()
		// A new label each time, so each removal creates its series.
		browser.ActiveSubscriptions[id] = common.GraphQlSubscription{Id: id, Type: common.Subscription, OperationNameLabel: "completeLock" + id}
		browser.ActiveSubscriptionsMutex.Unlock()
		handleCompleteMessage(hasura, id)
	}, common.GqlSubscriptionRemovedCounter)
}

// An error from Hasura for a subscription that has received no data, the one Hasura refused at
// its start: the subscription is removed, counted once as hasura_error, the error still reaches
// the browser, and the next resend does not include it.
func TestAnErrorFromHasuraRemovesTheSubscription(t *testing.T) {
	browser := &common.BrowserConnection{
		CurrentlyInMeeting: true,
		ActiveSubscriptions: map[string]common.GraphQlSubscription{
			"9":  {Id: "9", OperationName: "getBroken", Type: common.Subscription, Message: []byte(`{"id":"9"}`), LastSeenOnHasuraConnection: "HC1"},
			"10": {Id: "10", OperationName: "getKept", Type: common.Subscription, Message: []byte(`{"id":"10"}`), LastSeenOnHasuraConnection: "HC1"},
		},
		FromBrowserToHasuraChannel: common.NewSafeChannel[*common.BrowserMessage](10),
		FromHasuraToBrowserChannel: common.NewSafeChannelByte(10),
		Logger:                     logrus.NewEntry(logrus.New()),
	}
	hasura := &common.HasuraConnection{Id: "HC1", BrowserConn: browser, Context: context.Background()}
	removed := func() float64 {
		return metricstest.Value(common.GqlSubscriptionRemovedCounter.WithLabelValues(string(common.Subscription), "getBroken", common.RemovedByHasuraError))
	}
	before := removed()

	errorMessage := []byte(`{"id":"9","type":"error","payload":[{"message":"field not found"}]}`)
	handleMessageReceivedFromHasura(hasura, errorMessage)
	handleMessageReceivedFromHasura(hasura, errorMessage) // already removed: not counted again

	if got := removed(); got != before+1 {
		t.Errorf("hasura_error: %v -> %v, want +1", before, got)
	}
	if _, active := browser.ActiveSubscriptions["9"]; active {
		t.Error("the subscription Hasura ended with an error is still active")
	}
	select {
	case message := <-browser.FromHasuraToBrowserChannel.ReceiveChannel():
		if !strings.Contains(string(message), `"type":"error"`) {
			t.Errorf("the browser received %s, want the error", message)
		}
	default:
		t.Error("the error did not reach the browser")
	}

	retransmiter.RetransmitSubscriptionStartMessages(&common.HasuraConnection{Id: "HC2", BrowserConn: browser, Context: context.Background()})
	var resent []string
drain:
	for {
		select {
		case message := <-browser.FromBrowserToHasuraChannel.ReceiveChannel():
			resent = append(resent, string(message.Raw))
		default:
			break drain
		}
	}
	if len(resent) != 1 || resent[0] != `{"id":"10"}` {
		t.Errorf("resent %v after the error, want only the subscription still active", resent)
	}
}

// An error for a subscription that has received data does not remove it: Hasura answers a second
// subscribe for an id it is running with an error, and the first one keeps running.
func TestAnErrorFromHasuraKeepsASubscriptionThatReceivedData(t *testing.T) {
	browser := &common.BrowserConnection{
		CurrentlyInMeeting: true,
		ActiveSubscriptions: map[string]common.GraphQlSubscription{
			"11": {Id: "11", OperationName: "getRunning", Type: common.Subscription, Message: []byte(`{"id":"11"}`), LastSeenOnHasuraConnection: "HC1", FirstDataReceived: true},
		},
		FromBrowserToHasuraChannel: common.NewSafeChannel[*common.BrowserMessage](10),
		FromHasuraToBrowserChannel: common.NewSafeChannelByte(10),
		Logger:                     logrus.NewEntry(logrus.New()),
	}
	hasura := &common.HasuraConnection{Id: "HC1", BrowserConn: browser, Context: context.Background()}
	removed := func() float64 {
		return metricstest.Value(common.GqlSubscriptionRemovedCounter.WithLabelValues(string(common.Subscription), "getRunning", common.RemovedByHasuraError))
	}
	before := removed()

	handleMessageReceivedFromHasura(hasura, []byte(`{"type":"error","id":"11","payload":{"message":"an operation already exists with this id: 11","extensions":{"path":"$","code":"start-failed"}}}`))

	if got := removed(); got != before {
		t.Errorf("hasura_error: %v -> %v, want no change", before, got)
	}
	if _, active := browser.ActiveSubscriptions["11"]; !active {
		t.Error("the subscription that received data was removed")
	}
	select {
	case message := <-browser.FromHasuraToBrowserChannel.ReceiveChannel():
		if !strings.Contains(string(message), `"type":"error"`) {
			t.Errorf("the browser received %s, want the error", message)
		}
	default:
		t.Error("the error did not reach the browser")
	}
}
