package websrv

import (
	"testing"
	"time"

	"bbb-graphql-middleware/internal/common"
)

func TestMaxActiveSubscriptions(t *testing.T) {
	saved := BrowserConnections
	t.Cleanup(func() { BrowserConnections = saved })

	BrowserConnections = map[string]*common.BrowserConnection{}
	if got := maxActiveSubscriptions(); got != 0 {
		t.Fatalf("no connections: %v, want 0", got)
	}

	BrowserConnections = map[string]*common.BrowserConnection{
		"a": {ActiveSubscriptions: map[string]common.GraphQlSubscription{"1": {}, "2": {}}},
		"b": {ActiveSubscriptions: map[string]common.GraphQlSubscription{"1": {}, "2": {}, "3": {}}},
	}
	if got := maxActiveSubscriptions(); got != 3 {
		t.Errorf("max = %v, want 3", got)
	}
}

// A collection waiting on one connection's subscriptions does not hold the connections lock,
// so connections can still open and close meanwhile.
func TestMaxActiveSubscriptionsReleasesTheConnectionsLock(t *testing.T) {
	saved := BrowserConnections
	t.Cleanup(func() { BrowserConnections = saved })
	busy := &common.BrowserConnection{ActiveSubscriptions: map[string]common.GraphQlSubscription{"1": {}}}
	BrowserConnections = map[string]*common.BrowserConnection{"busy": busy}

	busy.ActiveSubscriptionsMutex.Lock()
	collected := make(chan float64)
	go func() { collected <- maxActiveSubscriptions() }()
	time.Sleep(50 * time.Millisecond) // the collection is now waiting on the busy connection

	locked := false
	for deadline := time.Now().Add(time.Second); time.Now().Before(deadline) && !locked; time.Sleep(5 * time.Millisecond) {
		locked = BrowserConnectionsMutex.TryLock()
	}
	if locked {
		BrowserConnectionsMutex.Unlock()
	}
	busy.ActiveSubscriptionsMutex.Unlock()
	if got := <-collected; got != 1 {
		t.Errorf("max = %v, want 1", got)
	}
	if !locked {
		t.Error("the collection held the connections lock while waiting on one connection")
	}
}
