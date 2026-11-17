package websrv

import (
	"testing"

	"bbb-graphql-middleware/internal/common"
	"bbb-graphql-middleware/internal/metricstest"
)

func rejectedConnections(reason string) float64 {
	return metricstest.Value(common.WsConnectionRejectedCounter.WithLabelValues(reason))
}

// A connection rejected at init: counted as rejected with its reason, and not as accepted.
func TestRejectedConnectionMetrics(t *testing.T) {
	accepted, rejected := metricstest.Value(common.WsConnectionAcceptedCounter), rejectedConnections("param_missing")

	browser := connectBrowser(t)
	browser.init(t, map[string]string{"X-ClientSessionUUID": "uuid-no-token"}) // no X-Session-Token
	browser.waitHandled(t)

	if got := rejectedConnections("param_missing"); got != rejected+1 {
		t.Errorf("ws_connection_rejected{reason=param_missing}: %v -> %v, want +1", rejected, got)
	}
	if got := metricstest.Value(common.WsConnectionAcceptedCounter); got != accepted {
		t.Errorf("the rejected connection was counted as accepted: %v -> %v", accepted, got)
	}
}

// A browser that leaves before it sends its connection_init has its own reason.
func TestConnectionClosedBeforeInitMetrics(t *testing.T) {
	closedBeforeInit, paramMissing := rejectedConnections("closed_before_init"), rejectedConnections("param_missing")

	browser := connectBrowser(t)
	browser.close(t)

	if got := rejectedConnections("closed_before_init"); got != closedBeforeInit+1 {
		t.Errorf("ws_connection_rejected{reason=closed_before_init}: %v -> %v, want +1", closedBeforeInit, got)
	}
	if got := rejectedConnections("param_missing"); got != paramMissing {
		t.Errorf("counted as param_missing: %v -> %v", paramMissing, got)
	}
}

// A connection over the server's connection limit is rejected before its init.
func TestConnectionOverTheServerLimitMetrics(t *testing.T) {
	common.UserConnectionsCountMutex.Lock()
	saved := common.GlobalConnectionsCount
	common.GlobalConnectionsCount = common.GetMaxConnectionsGlobal()
	common.UserConnectionsCountMutex.Unlock()
	t.Cleanup(func() {
		common.UserConnectionsCountMutex.Lock()
		common.GlobalConnectionsCount = saved
		common.UserConnectionsCountMutex.Unlock()
	})
	rejected := rejectedConnections("connections_limit_exceeded")

	connectBrowser(t).waitHandled(t)

	if got := rejectedConnections("connections_limit_exceeded"); got != rejected+1 {
		t.Errorf("ws_connection_rejected{reason=connections_limit_exceeded}: %v -> %v, want +1", rejected, got)
	}
}
