package websrv

import (
	"errors"
	"testing"

	"bbb-graphql-middleware/internal/common"
	"bbb-graphql-middleware/internal/metricstest"
)

func TestRecordConnectionInitCountsOnlyAcceptedConnections(t *testing.T) {
	accepted := metricstest.Value(common.WsConnectionAcceptedCounter)

	recordConnectionInit(errors.New("error on trying to check authorization"), "meeting_not_found")
	if got := metricstest.Value(common.WsConnectionAcceptedCounter); got != accepted {
		t.Fatalf("a rejected connection was counted as accepted: %v -> %v", accepted, got)
	}

	recordConnectionInit(nil, "")
	if got := metricstest.Value(common.WsConnectionAcceptedCounter); got != accepted+1 {
		t.Fatalf("an accepted connection was not counted: %v -> %v", accepted, got)
	}
}

func TestRecordConnectionInitLabelsRejectionsByMessageId(t *testing.T) {
	rejected := func(reason string) float64 {
		return metricstest.Value(common.WsConnectionRejectedCounter.WithLabelValues(reason))
	}
	cases := []struct{ errorMessageId, reason string }{
		{"meeting_not_found", "meeting_not_found"},
		{"param_missing", "param_missing"},
		{"some_id_from_akka_apps", "other"},
	}
	for _, c := range cases {
		before := rejected(c.reason)
		recordConnectionInit(errors.New("error on trying to check authorization"), c.errorMessageId)
		if got := rejected(c.reason); got != before+1 {
			t.Errorf("errorMessageId %q: reason %q went %v -> %v, want +1", c.errorMessageId, c.reason, before, got)
		}
	}
	if got := rejected("error on trying to check authorization"); got != 0 {
		t.Errorf("the error text is still used as the reason: %v", got)
	}
}

func TestConnectionClosePeakOnlyForAcceptedConnections(t *testing.T) {
	peaks := func() float64 { return metricstest.Value(common.WsConnectionSubscriptionsPeak) }
	connection := &common.BrowserConnection{ActiveSubscriptions: map[string]common.GraphQlSubscription{}}

	before := peaks()
	recordConnectionClose(connection, false)
	if got := peaks(); got != before {
		t.Fatalf("a connection rejected at init was observed in the peak: %v -> %v", before, got)
	}
	recordConnectionClose(connection, true)
	if got := peaks(); got != before+1 {
		t.Fatalf("an accepted connection was not observed in the peak: %v -> %v", before, got)
	}
}
