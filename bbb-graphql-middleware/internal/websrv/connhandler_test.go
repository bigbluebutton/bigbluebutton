package websrv

import (
	"testing"

	"bbb-graphql-middleware/internal/common"
)

func TestReplacedSessionWindowConnections(t *testing.T) {
	current := &common.BrowserConnection{Id: "current", SessionToken: "token", ClientSessionUUID: "new"}
	differentWindow := &common.BrowserConnection{Id: "different-window", SessionToken: "token", ClientSessionUUID: "old", ConnectionInitSettled: true}
	sameWindow := &common.BrowserConnection{Id: "same-window", SessionToken: "token", ClientSessionUUID: "new", ConnectionInitSettled: true}
	initializing := &common.BrowserConnection{Id: "initializing", SessionToken: "token", ClientSessionUUID: "other"}
	otherToken := &common.BrowserConnection{Id: "other-token", SessionToken: "other", ClientSessionUUID: "old", ConnectionInitSettled: true}

	connections := map[string]*common.BrowserConnection{
		current.Id: current, differentWindow.Id: differentWindow, sameWindow.Id: sameWindow,
		initializing.Id: initializing, otherToken.Id: otherToken,
	}

	replaced := replacedSessionWindowConnections(connections, current)
	if len(replaced) != 1 || replaced[0] != differentWindow {
		t.Fatalf("expected only the settled connection from another window, got %v", replaced)
	}
}
