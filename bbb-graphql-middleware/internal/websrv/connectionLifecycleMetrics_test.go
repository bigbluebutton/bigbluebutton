package websrv

import (
	"testing"

	"bbb-graphql-middleware/internal/common"
	"bbb-graphql-middleware/internal/metricstest"
)

// A connection rejected at init is not counted as accepted.
func TestRejectedConnectionMetrics(t *testing.T) {
	accepted := metricstest.Value(common.WsConnectionAcceptedCounter)

	browser := connectBrowser(t)
	browser.init(t, map[string]string{"X-ClientSessionUUID": "uuid-no-token"}) // no X-Session-Token
	browser.waitHandled(t)

	if got := metricstest.Value(common.WsConnectionAcceptedCounter); got != accepted {
		t.Errorf("the rejected connection was counted as accepted: %v -> %v", accepted, got)
	}
}
