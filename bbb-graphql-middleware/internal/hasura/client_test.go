package hasura

import (
	"context"
	"net"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"bbb-graphql-middleware/internal/common"

	"github.com/coder/websocket"
	"github.com/sirupsen/logrus"
)

func browserConnectionForHasura(t *testing.T) *common.BrowserConnection {
	ctx, cancel := context.WithCancel(context.Background())
	t.Cleanup(cancel)
	return &common.BrowserConnection{
		Id:                         "BC1",
		Context:                    ctx,
		ActiveSubscriptions:        map[string]common.GraphQlSubscription{},
		FromBrowserToHasuraChannel: common.NewSafeChannel[*common.BrowserMessage](10),
		FromHasuraToBrowserChannel: common.NewSafeChannelByte(10),
		ConnectionInitMessage:      []byte(`{"type":"connection_init"}`),
		Logger:                     logrus.NewEntry(logrus.New()),
	}
}

func withHasuraEndpoint(t *testing.T, endpoint string) {
	saved := hasuraEndpoint
	hasuraEndpoint = endpoint
	t.Cleanup(func() { hasuraEndpoint = saved })
}

// HasuraClient returns why its connection to Hasura ended, for the reconnection that follows.
func TestHasuraClientReturnsWhyTheConnectionEnded(t *testing.T) {
	t.Run("Hasura cannot be reached", func(t *testing.T) {
		listener, err := net.Listen("tcp", "127.0.0.1:0")
		if err != nil {
			t.Fatal(err)
		}
		address := listener.Addr().String()
		listener.Close() // nothing listens there now
		withHasuraEndpoint(t, "ws://"+address+"/v1/graphql")

		if reason, _ := HasuraClient(browserConnectionForHasura(t)); reason != common.ReconnectionDialError {
			t.Errorf("reason %q, want %q", reason, common.ReconnectionDialError)
		}
	})
	t.Run("Hasura drops the connection", func(t *testing.T) {
		server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			conn, err := websocket.Accept(w, r, nil)
			if err != nil {
				return
			}
			conn.Read(r.Context()) // the init
			conn.CloseNow()
		}))
		t.Cleanup(server.Close)
		withHasuraEndpoint(t, "ws"+strings.TrimPrefix(server.URL, "http"))

		if reason, _ := HasuraClient(browserConnectionForHasura(t)); reason != common.ReconnectionHasuraReadError {
			t.Errorf("reason %q, want %q", reason, common.ReconnectionHasuraReadError)
		}
	})
	t.Run("the endpoint is not a URL", func(t *testing.T) {
		withHasuraEndpoint(t, "ws://%zz")

		if reason, _ := HasuraClient(browserConnectionForHasura(t)); reason != common.ReconnectionOther {
			t.Errorf("reason %q, want %q", reason, common.ReconnectionOther)
		}
	})
}
