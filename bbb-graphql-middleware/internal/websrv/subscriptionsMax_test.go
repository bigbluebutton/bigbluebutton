package websrv

import (
	"fmt"
	"testing"
	"time"

	"bbb-graphql-middleware/internal/common"
)

// openTestConnection is an open connection holding a number of subscriptions, registered for the
// metrics as ConnectionHandler registers it.
func openTestConnection(t *testing.T, id string, subscriptions int) *common.BrowserConnection {
	t.Helper()
	connection := &common.BrowserConnection{Id: id, ActiveSubscriptions: map[string]common.GraphQlSubscription{}}
	connection.ActiveSubscriptionsMutex.Lock()
	for i := 0; i < subscriptions; i++ {
		connection.ActiveSubscriptions[fmt.Sprint(i)] = common.GraphQlSubscription{Id: fmt.Sprint(i)}
		connection.NoteActiveSubscriptionsLocked()
	}
	connection.ActiveSubscriptionsMutex.Unlock()
	openConnectionSubscriptions.Store(id, &connection.ActiveSubscriptionsCount)
	t.Cleanup(func() { openConnectionSubscriptions.Delete(id) })
	return connection
}

func TestMaxActiveSubscriptions(t *testing.T) {
	if got := maxActiveSubscriptions(); got != 0 {
		t.Fatalf("no connections: %v, want 0", got)
	}

	openTestConnection(t, "BCmax-a", 2)
	b := openTestConnection(t, "BCmax-b", 3)
	if got := maxActiveSubscriptions(); got != 3 {
		t.Errorf("max = %v, want 3", got)
	}

	if _, removed := b.RemoveActiveSubscription("0"); !removed {
		t.Fatal("subscription 0 was not removed")
	}
	if got := maxActiveSubscriptions(); got != 2 {
		t.Errorf("after a removal: max = %v, want 2", got)
	}
}

// A collection runs inside the Prometheus registry, so it takes no lock of the application: one
// held meanwhile, by a connection or by the list of connections, does not hold it up.
func TestMaxActiveSubscriptionsTakesNoApplicationLock(t *testing.T) {
	busy := openTestConnection(t, "BCmax-busy", 1)

	busy.ActiveSubscriptionsMutex.Lock()
	BrowserConnectionsMutex.Lock()
	collected := make(chan float64, 1)
	go func() { collected <- maxActiveSubscriptions() }()
	var got float64
	select {
	case got = <-collected:
	case <-time.After(time.Second):
		t.Error("the collection waited on a lock of the application")
	}
	BrowserConnectionsMutex.Unlock()
	busy.ActiveSubscriptionsMutex.Unlock()
	if t.Failed() {
		got = <-collected
	}
	if got != 1 {
		t.Errorf("max = %v, want 1", got)
	}
}
