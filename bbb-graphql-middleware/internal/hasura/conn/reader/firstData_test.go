package reader

import (
	"context"
	"testing"
	"time"

	"bbb-graphql-middleware/internal/common"
	"bbb-graphql-middleware/internal/metricstest"

	"github.com/prometheus/client_golang/prometheus"
	"github.com/sirupsen/logrus"
)

func TestRecordFirstDataObservesOnlyTheFirstMessage(t *testing.T) {
	browser := &common.BrowserConnection{ActiveSubscriptions: map[string]common.GraphQlSubscription{
		"1": {Id: "1", Type: common.Streaming, FirstDataPendingSince: time.Now().Add(-200 * time.Millisecond)},
		"2": {Id: "2", Type: common.Streaming}, // a retransmission: nothing pending
	}}
	hasura := &common.HasuraConnection{Id: "HC1", BrowserConn: browser}
	observations := func() float64 {
		return metricstest.Value(common.GqlSubscriptionFirstDataDuration.WithLabelValues(string(common.Streaming)).(prometheus.Histogram))
	}

	before := observations()
	recordFirstData(hasura, "1")
	recordFirstData(hasura, "1") // a second message of the same subscription
	recordFirstData(hasura, "2")
	if got := observations(); got != before+1 {
		t.Errorf("observations: %v -> %v, want +1", before, got)
	}
	if !browser.ActiveSubscriptions["1"].FirstDataPendingSince.IsZero() {
		t.Error("the pending start was not cleared after the first message")
	}
}

// After its first data is settled, a data message reads the record under the read lock only: it
// is served while another reader holds the lock, which a write lock would wait for.
func TestRecordFirstDataReadsASettledRecordUnderTheReadLock(t *testing.T) {
	browser := &common.BrowserConnection{ActiveSubscriptions: map[string]common.GraphQlSubscription{
		"1": {Id: "1", Type: common.Subscription, FirstDataPendingSince: time.Now()},
	}}
	hasura := &common.HasuraConnection{Id: "HC1", BrowserConn: browser}
	recordFirstData(hasura, "1") // settles the first data, under the write lock

	browser.ActiveSubscriptionsMutex.RLock()
	defer browser.ActiveSubscriptionsMutex.RUnlock()
	done := make(chan bool, 1)
	go func() {
		_, ok := recordFirstData(hasura, "1")
		done <- ok
	}()
	select {
	case ok := <-done:
		if !ok {
			t.Error("the settled subscription was not found")
		}
	case <-time.After(2 * time.Second):
		t.Fatal("a data message of a settled subscription waited for the write lock")
	}
}

// Two data messages with different payloads, through the message handler: the first is
// observed once, and the record that the handler writes back keeps the wait cleared.
func TestFirstDataThroughTheHandler(t *testing.T) {
	cases := []struct {
		queryType   common.QueryType
		cursorField string
		messages    []string
	}{
		{common.Subscription, "", []string{
			`{"type":"next","id":"1","payload":{"data":{"user":[{"userId":"a"}]}}}`,
			`{"type":"next","id":"1","payload":{"data":{"user":[{"userId":"b"}]}}}`,
		}},
		{common.Streaming, "createdAt", []string{
			`{"type":"next","id":"1","payload":{"data":{"chat_stream":[{"createdAt":"2026-01-01T00:00:01"}]}}}`,
			`{"type":"next","id":"1","payload":{"data":{"chat_stream":[{"createdAt":"2026-01-01T00:00:02"}]}}}`,
		}},
	}
	for _, c := range cases {
		browser := &common.BrowserConnection{
			MeetingId:                  "meeting-first-data-" + string(c.queryType),
			Context:                    context.Background(),
			ActiveSubscriptions:        map[string]common.GraphQlSubscription{},
			FromHasuraToBrowserChannel: common.NewSafeChannelByte(10),
			Logger:                     logrus.NewEntry(logrus.New()),
		}
		browser.ActiveSubscriptions["1"] = common.GraphQlSubscription{
			Id: "1", Type: c.queryType, OperationName: "getData", StreamCursorField: c.cursorField,
			FirstDataPendingSince: time.Now().Add(-100 * time.Millisecond),
		}
		hasura := &common.HasuraConnection{Id: "HC1", BrowserConn: browser, Context: context.Background()}
		observations := func() float64 {
			return metricstest.Value(common.GqlSubscriptionFirstDataDuration.WithLabelValues(string(c.queryType)).(prometheus.Histogram))
		}

		before := observations()
		for _, message := range c.messages {
			handleMessageReceivedFromHasura(hasura, []byte(message))
		}
		if got := observations(); got != before+1 {
			t.Errorf("%s: observations %v -> %v, want +1", c.queryType, before, got)
		}
		subscription := browser.ActiveSubscriptions["1"]
		if !subscription.FirstDataPendingSince.IsZero() || !subscription.FirstDataReceived {
			t.Errorf("%s: the record kept a pending wait after its first data: %+v", c.queryType, subscription.FirstDataPendingSince)
		}
		if c.queryType == common.Streaming && subscription.StreamCursorCurrValue != "2026-01-01T00:00:02" {
			t.Errorf("streaming: cursor %v, want the last row's", subscription.StreamCursorCurrValue)
		}
	}
}

func TestDataMessagesUseTheStoredLabel(t *testing.T) {
	browser := &common.BrowserConnection{
		MeetingId:                  "meeting-stored-label",
		Context:                    context.Background(),
		ActiveSubscriptions:        map[string]common.GraphQlSubscription{},
		FromHasuraToBrowserChannel: common.NewSafeChannelByte(10),
		Logger:                     logrus.NewEntry(logrus.New()),
	}
	browser.ActiveSubscriptions["1"] = common.GraphQlSubscription{Id: "1", Type: common.Subscription, OperationName: "getUsers", OperationNameLabel: "storedLabel"}
	hasura := &common.HasuraConnection{Id: "HC1", BrowserConn: browser, Context: context.Background()}
	received := func() float64 {
		return metricstest.Value(common.GqlReceivedDataCounter.WithLabelValues(string(common.Subscription), "storedLabel"))
	}

	before := received()
	handleMessageReceivedFromHasura(hasura, []byte(`{"type":"next","id":"1","payload":{"data":{"user":[{"userId":"x"}]}}}`))
	if got := received(); got != before+1 {
		t.Errorf("gql_received_data_total with the stored label: %v -> %v, want +1", before, got)
	}
}
