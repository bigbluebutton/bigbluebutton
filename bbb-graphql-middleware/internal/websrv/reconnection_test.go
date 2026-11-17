package websrv

import (
	"context"
	"testing"

	"bbb-graphql-middleware/internal/common"
	"bbb-graphql-middleware/internal/metricstest"

	"github.com/sirupsen/logrus"
)

// The connections to Hasura of a browser connection, one after the other while it is connected:
// each one after the first is counted, with the reason the previous one ended, when it is made. A
// browser that leaves during a connection is not counted, since no other connection follows.
func TestKeepConnectedToHasuraCountsEachReconnectionMade(t *testing.T) {
	for _, connections := range []int{1, 3} {
		reconnections := func() float64 {
			return metricstest.Value(common.GqlHasuraReconnectionCounter.WithLabelValues(common.ReconnectionDialError))
		}
		before := reconnections()

		ctx, cancel := context.WithCancel(context.Background())
		browser := &common.BrowserConnection{Id: "BCkeepConnected", Logger: logrus.NewEntry(logrus.New())}
		BrowserConnectionsMutex.Lock()
		BrowserConnections[browser.Id] = browser
		BrowserConnectionsMutex.Unlock()
		made := 0
		client := func(*common.BrowserConnection) (string, error) {
			made++
			if made == connections {
				cancel() // the browser leaves during this connection
			}
			return common.ReconnectionDialError, nil
		}

		keepConnectedToHasura(ctx, browser, client)

		BrowserConnectionsMutex.Lock()
		delete(BrowserConnections, browser.Id)
		BrowserConnectionsMutex.Unlock()
		if made != connections {
			t.Fatalf("%d connections made, want %d", made, connections)
		}
		if got := reconnections(); got != before+float64(connections-1) {
			t.Errorf("%d connections: gql_hasura_reconnection_total{reason=dial_error} %v -> %v, want +%d", connections, before, got, connections-1)
		}
	}
}

// A reconnection requested by akka-apps ends the connection to Hasura with the reason it was
// requested with, or other_request for a reason outside the list.
func TestARequestedReconnectionEndsTheConnectionWithItsReason(t *testing.T) {
	for requested, want := range map[string]string{
		"role_changed":                     "role_changed",
		"lock_user_changed":                "lock_user_changed",
		"assigned_presenter":               "assigned_presenter",
		"assigned_presenter_automatically": "assigned_presenter_automatically",
		"user_joined":                      "user_joined",
		"user was ejected by a moderator":  common.ReconnectionOtherRequest,
	} {
		browserContext, browserCancel := context.WithCancel(context.Background())
		hasuraContext, hasuraCancel := context.WithCancel(browserContext)
		browser := &common.BrowserConnection{
			Context:                    browserContext,
			FromBrowserToHasuraChannel: common.NewSafeChannelByte(1),
			Logger:                     logrus.NewEntry(logrus.New()),
		}
		hasura := &common.HasuraConnection{Id: "HC1", BrowserConn: browser, Context: hasuraContext, ContextCancelFunc: hasuraCancel}
		browser.HasuraConnection = hasura

		invalidateHasuraConnectionForSessionToken(browser, "token", requested)

		if hasuraContext.Err() == nil {
			t.Errorf("%s: the connection to Hasura was not ended", requested)
		}
		if got := hasura.CloseReason(); got != want {
			t.Errorf("%s: close reason %q, want %q", requested, got, want)
		}
		browserCancel() // ends the session variables refresh the request started
	}
}
