package websrv

import (
	"context"
	"testing"

	"bbb-graphql-middleware/internal/common"
	"bbb-graphql-middleware/internal/metricstest"
)

func TestRecordHasuraReconnectionOnlyWhileTheBrowserIsConnected(t *testing.T) {
	reconnections := func() float64 {
		return metricstest.Value(common.GqlHasuraReconnectionCounter.WithLabelValues("lock_user_changed"))
	}
	before := reconnections()

	connected := context.Background()
	recordHasuraReconnection(connected, "lock_user_changed")

	gone, cancel := context.WithCancel(context.Background())
	cancel()
	recordHasuraReconnection(gone, "lock_user_changed")

	if got := reconnections(); got != before+1 {
		t.Errorf("reconnections: %v -> %v, want +1", before, got)
	}
}
