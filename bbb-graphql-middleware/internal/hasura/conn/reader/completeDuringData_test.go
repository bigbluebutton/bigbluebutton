package reader

import (
	"bytes"
	"context"
	"testing"
	"time"

	"bbb-graphql-middleware/internal/common"
	"bbb-graphql-middleware/internal/metricstest"

	"github.com/prometheus/client_golang/prometheus"
	"github.com/sirupsen/logrus"
)

// A subscription removed while the reader handles one of its data messages, after the reader read
// the record and before it updates it: by a complete from the browser, or by the close of the
// connection. The reader's update does not bring the subscription back, so it is counted as
// removed once, its first data is not observed, and the connection's count of active
// subscriptions ends at zero.
func TestASubscriptionRemovedDuringADataMessageIsCountedOnce(t *testing.T) {
	type readerUpdate func(hc *common.HasuraConnection, stale common.GraphQlSubscription)
	updates := map[string]readerUpdate{
		"subscription data": func(hc *common.HasuraConnection, stale common.GraphQlSubscription) {
			message := bytes.Replace([]byte(`{"type":"next","id":"1","payload":{"data":{"user":[{"userId":"during"}]}}}`), []byte(`"1"`), []byte(`"`+string(QueryIdPlaceholderInBytes)+`"`), 1)
			if handleSubscriptionMessage(hc, &message, stale, "1") {
				t.Error("the data of the removed subscription was accepted for forwarding")
			}
		},
		"stream cursor": func(hc *common.HasuraConnection, stale common.GraphQlSubscription) {
			handleStreamingMessage(hc, []byte(`{"type":"next","id":"1","payload":{"data":{"chat_stream":[{"createdAt":"2026-01-01T00:00:01"}]}}}`), stale, "1")
		},
		"first data": func(hc *common.HasuraConnection, stale common.GraphQlSubscription) {
			if _, ok := recordFirstData(hc, "1"); ok {
				t.Error("the first data of the removed subscription was settled")
			}
		},
	}
	removals := map[string]func(browser *common.BrowserConnection){
		"complete from the browser": func(browser *common.BrowserConnection) {
			if subscription, removed := browser.RemoveActiveSubscription("1"); removed {
				common.RecordSubscriptionRemoved(subscription, common.RemovedByClient)
			}
		},
		"connection closed": common.RecordConnectionSubscriptionsRemoved,
	}

	for updateName, update := range updates {
		for removalName, remove := range removals {
			t.Run(updateName+", "+removalName, func(t *testing.T) {
				label := "removedDuringData"
				browser := &common.BrowserConnection{
					MeetingId:                  "meeting-removed-during-data",
					Context:                    context.Background(),
					ActiveSubscriptions:        map[string]common.GraphQlSubscription{},
					FromHasuraToBrowserChannel: common.NewSafeChannelByte(10),
					Logger:                     logrus.NewEntry(logrus.New()),
				}
				browser.ActiveSubscriptionsMutex.Lock()
				browser.ActiveSubscriptions["1"] = common.GraphQlSubscription{
					Id: "1", Type: common.Streaming, OperationNameLabel: label, StreamCursorField: "createdAt",
					FirstDataPendingSince: time.Now(),
				}
				browser.NoteActiveSubscriptionsLocked()
				stale := browser.ActiveSubscriptions["1"] // the reader's copy
				browser.ActiveSubscriptionsMutex.Unlock()
				hc := &common.HasuraConnection{Id: "HC1", BrowserConn: browser, Context: context.Background()}

				removed := func() float64 {
					total := 0.0
					for _, reason := range []string{common.RemovedByClient, common.RemovedByHasura, common.RemovedOnConnectionClose} {
						total += metricstest.Value(common.GqlSubscriptionRemovedCounter.WithLabelValues(string(common.Streaming), label, reason))
					}
					return total
				}
				firstData := func() float64 {
					return metricstest.Value(common.GqlSubscriptionFirstDataDuration.WithLabelValues(string(common.Streaming)).(prometheus.Histogram))
				}
				removedBefore, firstDataBefore := removed(), firstData()

				remove(browser)
				update(hc, stale)
				common.RecordConnectionSubscriptionsRemoved(browser) // the connection closes, or closes again

				if got := removed(); got != removedBefore+1 {
					t.Errorf("gql_subscription_removed_total: %v -> %v, want +1", removedBefore, got)
				}
				if got := browser.ActiveSubscriptionsCount.Load(); got != 0 {
					t.Errorf("count of active subscriptions = %d, want 0", got)
				}
				if len(browser.ActiveSubscriptions) != 0 {
					t.Errorf("the removed subscription is back: %v", browser.ActiveSubscriptions)
				}
				if got := firstData(); got != firstDataBefore {
					t.Errorf("first data observed for the removed subscription: %v -> %v", firstDataBefore, got)
				}
			})
		}
	}
}
