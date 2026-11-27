package reader

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"sync"
	"testing"
	"time"

	"bbb-graphql-middleware/config"
	"bbb-graphql-middleware/internal/common"

	"github.com/coder/websocket"
	"github.com/sirupsen/logrus"
)

// runningReader is a BrowserConnectionReader of an authorized connection, fed through a real
// websocket.
type runningReader struct {
	browser *common.BrowserConnection
	client  *websocket.Conn
}

func startReader(t *testing.T) *runningReader {
	t.Helper()
	ctx, cancel := context.WithCancel(context.Background())
	browser := &common.BrowserConnection{
		Id:                             "BC1",
		MeetingId:                      "meeting-1",
		Context:                        ctx,
		ContextCancelFunc:              cancel,
		ActiveSubscriptions:            map[string]common.GraphQlSubscription{},
		ActiveStreamings:               map[string][]string{},
		FromBrowserToHasuraChannel:     common.NewSafeChannel[*common.BrowserMessage](10),
		FromBrowserToGqlActionsChannel: common.NewSafeChannel[*common.BrowserMessage](10),
		FromHasuraToBrowserChannel:     common.NewSafeChannelByte(10),
		Logger:                         logrus.NewEntry(logrus.New()),
	}
	var wg sync.WaitGroup
	wg.Add(1)
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		conn, err := websocket.Accept(w, r, nil)
		if err != nil {
			return
		}
		browser.Websocket = conn
		BrowserConnectionReader(browser, []*sync.WaitGroup{&wg})
	}))
	client, _, err := websocket.Dial(context.Background(), "ws"+strings.TrimPrefix(server.URL, "http"), nil)
	if err != nil {
		server.Close()
		t.Fatalf("dial: %v", err)
	}
	t.Cleanup(func() {
		client.CloseNow()
		cancel()
		wg.Wait()
		server.Close()
	})
	return &runningReader{browser: browser, client: client}
}

func (r *runningReader) send(t *testing.T, operationName, query string) {
	t.Helper()
	message, _ := json.Marshal(map[string]interface{}{
		"id":      "1",
		"type":    "subscribe",
		"payload": map[string]interface{}{"operationName": operationName, "query": query},
	})
	if err := r.client.Write(context.Background(), websocket.MessageText, message); err != nil {
		t.Fatalf("write: %v", err)
	}
}

// destination waits for the message on one of the reader's destinations and returns which, with
// the message passed on.
func (r *runningReader) destination(t *testing.T) (string, *common.BrowserMessage) {
	t.Helper()
	deadline := time.After(5 * time.Second)
	for {
		select {
		case message := <-r.browser.FromBrowserToHasuraChannel.ReceiveChannel():
			return "hasura", message
		case message := <-r.browser.FromBrowserToGqlActionsChannel.ReceiveChannel():
			return "actions", message
		case <-deadline:
			t.Fatal("the reader passed the message nowhere")
		case <-time.After(5 * time.Millisecond):
			r.browser.ActiveStreamingsMutex.RLock()
			streams := len(r.browser.ActiveStreamings)
			r.browser.ActiveStreamingsMutex.RUnlock()
			if streams > 0 {
				return "streaming", nil
			}
		}
	}
}

var leadingIgnored = map[string]string{
	"none":    "",
	"space":   " ",
	"newline": "\n",
	"comment": "# a comment\n",
	"comma":   ",",
}

func TestTheReaderRoutesOnTheDecidedOperation(t *testing.T) {
	cases := []struct {
		name          string
		operationName string
		query         string
		destination   string
		queryType     common.QueryType
	}{
		{"a mutation", "userSetMuted", "mutation userSetMuted { userSetMuted(muted: true) }", "actions", common.Mutation},
		{"a subscription", "getUsers", "subscription getUsers { user { userId } }", "hasura", common.Subscription},
		{"a stream the middleware answers", "getCursorCoordinatesStream",
			`subscription getCursorCoordinatesStream { pres_page_cursor_stream(cursor: {initial_value: {lastUpdatedAt: "2020-01-01"}}, batch_size: 100) { userId } }`, "streaming", ""},
	}
	for _, c := range cases {
		for prefixName, prefix := range leadingIgnored {
			t.Run(c.name+" after "+prefixName, func(t *testing.T) {
				r := startReader(t)
				r.send(t, c.operationName, prefix+c.query)
				destination, message := r.destination(t)
				if destination != c.destination {
					t.Fatalf("routed to %s, want %s", destination, c.destination)
				}
				if message != nil && (message.Operation == nil || message.Operation.Type != c.queryType || message.Subscribe == nil) {
					t.Errorf("passed on %+v, want the decoded message with a %q operation", message, c.queryType)
				}
			})
		}
	}
}

// The streams the middleware answers are matched on the decided name, exactly, and only for a
// subscription.
func TestOnlyASubscriptionNamedExactlyAsAStreamGoesToTheStreamingServer(t *testing.T) {
	for name, query := range map[string]string{
		"a longer name": `subscription getCursorCoordinatesStreamOther { user { userId } }`,
		"a query":       `query getCursorCoordinatesStream { user { userId } }`,
	} {
		t.Run(name, func(t *testing.T) {
			r := startReader(t)
			operationName := strings.Fields(query)[1]
			r.send(t, operationName, query)
			if destination, _ := r.destination(t); destination != "hasura" {
				t.Errorf("routed to %s, want hasura", destination)
			}
		})
	}
}

// A document that does not parse is routed on the text of the message, as before.
func TestADocumentThatDoesNotParseIsRoutedAsBefore(t *testing.T) {
	cases := []struct{ operationName, query, destination string }{
		{"userSetMuted", "mutation userSetMuted { userSetMuted(muted: true)", "actions"},
		{"userSetMuted", " mutation userSetMuted { userSetMuted(muted: true)", "hasura"},
		{"getCursorCoordinatesStream", "subscription getCursorCoordinatesStream { pres_page_cursor_stream", "streaming"},
	}
	for _, c := range cases {
		r := startReader(t)
		r.send(t, c.operationName, c.query)
		if destination, message := r.destination(t); destination != c.destination || (message != nil && message.Operation.FromDocument) {
			t.Errorf("%q: routed to %s, want %s on its text", c.query, destination, c.destination)
		}
	}
}

// The parsed document goes on only where it is used: to the writer, to check max_query_depth.
func TestTheDocumentGoesOnOnlyWhereItIsUsed(t *testing.T) {
	r := startReader(t)
	r.send(t, "userSetMuted", "mutation userSetMuted { userSetMuted(muted: true) }")
	if destination, message := r.destination(t); destination != "actions" || message.Operation.Document != nil {
		t.Errorf("to %s, document kept %v; want actions without the document", destination, message.Operation.Document != nil)
	}

	// A document with two operations and no operationName selects none: it is routed on its text,
	// to bbb-graphql-actions here, and its parsed document does not go along.
	if err := r.client.Write(context.Background(), websocket.MessageText, []byte(`{"id":"1","type":"subscribe","payload":{"query":"mutation A{x} query B{y}"}}`)); err != nil {
		t.Fatalf("write: %v", err)
	}
	if destination, message := r.destination(t); destination != "actions" || message.Operation.Document != nil || message.Operation.ParseError != nil {
		t.Errorf("to %s, document kept %v, parse error %v; want actions without either", destination, message.Operation.Document != nil, message.Operation.ParseError)
	}

	r.send(t, "getUsers", "subscription getUsers { user { userId } }")
	if destination, message := r.destination(t); destination != "hasura" || message.Operation.Document == nil {
		t.Errorf("to %s with max_query_depth 6, document kept %v; want hasura with the document", destination, message.Operation.Document != nil)
	}

}

// Without the depth check the writer does not use the document, which does not go along.
func TestTheDocumentDoesNotGoToTheWriterWithoutTheDepthCheck(t *testing.T) {
	// Set before the reader starts, which reads it.
	saved := config.GetConfig().Server.MaxQueryDepth
	config.GetConfig().Server.MaxQueryDepth = 0
	t.Cleanup(func() { config.GetConfig().Server.MaxQueryDepth = saved })
	r := startReader(t)
	r.send(t, "getUsers", "subscription getUsers { user { userId } }")
	if destination, message := r.destination(t); destination != "hasura" || message.Operation.Document != nil || message.Operation.Type != common.Subscription {
		t.Errorf("to %s with max_query_depth 0, document kept %v; want hasura, the type, and no document", destination, message.Operation.Document != nil)
	}
}

// A stream is registered under the name the reader decided, also without the operationName field.
func TestAStreamIsRegisteredUnderTheDecidedName(t *testing.T) {
	r := startReader(t)
	r.send(t, "", `subscription getCursorCoordinatesStream { pres_page_cursor_stream(cursor: {initial_value: {lastUpdatedAt: "2020-01-01"}}, batch_size: 100) { userId } }`)
	if destination, _ := r.destination(t); destination != "streaming" {
		t.Fatalf("routed to %s, want streaming", destination)
	}
	r.browser.ActiveStreamingsMutex.RLock()
	defer r.browser.ActiveStreamingsMutex.RUnlock()
	if _, registered := r.browser.ActiveStreamings["getCursorCoordinatesStream"]; !registered {
		t.Errorf("registered %v, want under getCursorCoordinatesStream", r.browser.ActiveStreamings)
	}
}
