package presence

import (
	"context"
	"crypto/tls"
	"crypto/x509"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"sync"
	"testing"
	"time"

	"golang.org/x/net/websocket"
)

// script runs one test server: handle gets each accepted connection.
type script struct {
	srv    *httptest.Server
	mu     sync.Mutex
	header http.Header // the last handshake's request headers
}

func serve(t *testing.T, handle func(ws *websocket.Conn)) *script {
	t.Helper()
	s := &script{}
	s.srv = httptest.NewTLSServer(websocket.Server{
		Handshake: func(cfg *websocket.Config, r *http.Request) error {
			if !strings.Contains(r.Header.Get("Sec-Websocket-Protocol"), Subprotocol) {
				return errors.New("no subprotocol")
			}
			cfg.Protocol = []string{Subprotocol}
			s.mu.Lock()
			s.header = r.Header.Clone()
			s.mu.Unlock()
			return nil
		},
		Handler: handle,
	})
	t.Cleanup(s.srv.Close)
	return s
}

func (s *script) options() Options {
	pool := x509.NewCertPool()
	pool.AddCert(s.srv.Certificate())
	return Options{
		URL:       "wss" + strings.TrimPrefix(s.srv.URL, "https") + "/graphql",
		Origin:    s.srv.URL,
		TLS:       &tls.Config{RootCAs: pool},
		Cookies:   []*http.Cookie{{Name: "JSESSIONID", Value: "js1"}},
		UserAgent: "bbb-conform/test",
		Headers:   map[string]string{"X-Session-Token": "st1", "X-ClientType": "HTML5"},
	}
}

func recv(ws *websocket.Conn) (frame, []byte) {
	var msg []byte
	if err := websocket.Message.Receive(ws, &msg); err != nil {
		return frame{Type: "eof"}, nil
	}
	var f frame
	_ = json.Unmarshal(msg, &f)
	return f, msg
}

func send(ws *websocket.Conn, raw string) {
	_ = websocket.Message.Send(ws, raw)
}

// ack completes the handshake and returns the init payload.
func ack(ws *websocket.Conn) json.RawMessage {
	f, _ := recv(ws)
	send(ws, `{"type":"connection_ack"}`)
	return f.Payload
}

func TestDialAndQuery(t *testing.T) {
	type seen struct {
		init json.RawMessage
		raw  []byte
	}
	got := make(chan seen, 1)
	s := serve(t, func(ws *websocket.Conn) {
		init := ack(ws)
		f, raw := recv(ws)
		got <- seen{init, raw}
		send(ws, `{"id":"`+f.ID+`","type":"next","payload":{"data":{"user_current":[{"name":"Ann"}]}}}`)
		send(ws, `{"id":"`+f.ID+`","type":"complete"}`)
		recv(ws)
	})
	c, err := Dial(context.Background(), s.options())
	if err != nil {
		t.Fatal(err)
	}
	defer c.Close()
	res, err := c.Do(context.Background(), Request{Query: "mutation M { userLeaveMeeting }", OperationName: "M"}, false)
	if err != nil {
		t.Fatal(err)
	}
	if string(res.Data) != `{"user_current":[{"name":"Ann"}]}` || len(res.Errors) != 0 {
		t.Errorf("result %s %v", res.Data, res.Errors)
	}
	g := <-got
	init, raw := g.init, g.raw
	s.mu.Lock()
	h := s.header
	s.mu.Unlock()
	for name, want := range map[string]string{"Origin": s.srv.URL, "Cookie": "JSESSIONID=js1", "User-Agent": "bbb-conform/test"} {
		if got := h.Get(name); got != want {
			t.Errorf("%s = %q, want %q", name, got, want)
		}
	}
	if string(init) != `{"headers":{"X-ClientType":"HTML5","X-Session-Token":"st1"}}` {
		t.Errorf("connection_init payload %s", init)
	}
	// The middleware routes a frame to the actions service only if its
	// bytes hold "query":"mutation.
	if !strings.Contains(string(raw), `"query":"mutation M`) || !strings.Contains(string(raw), `"operationName":"M"`) {
		t.Errorf("subscribe frame %s", raw)
	}
}

func TestRejected(t *testing.T) {
	s := serve(t, func(ws *websocket.Conn) {
		recv(ws)
		send(ws, `{"id":"-1","type":"error","payload":[{"messageId":"meeting_not_found","message":"Meeting not found"}]}`)
	})
	_, err := Dial(context.Background(), s.options())
	var r *Rejected
	if !errors.As(err, &r) || r.MessageID != "meeting_not_found" {
		t.Fatalf("error %v, want a rejection", err)
	}
}

func TestPings(t *testing.T) {
	got := make(chan string, 2)
	s := serve(t, func(ws *websocket.Conn) {
		ack(ws)
		send(ws, `{"type":"ping"}`)
		for seen := map[string]bool{}; len(seen) < 2; {
			f, _ := recv(ws)
			if f.Type == "eof" {
				return
			}
			if (f.Type == "pong" || f.Type == "ping") && !seen[f.Type] {
				seen[f.Type] = true
				got <- f.Type
			}
		}
	})
	o := s.options()
	o.PingEvery = 50 * time.Millisecond
	c, err := Dial(context.Background(), o)
	if err != nil {
		t.Fatal(err)
	}
	defer c.Close()
	for i := 0; i < 2; i++ {
		select {
		case <-got:
		case <-time.After(3 * time.Second):
			t.Fatal("the client didn't answer the server's ping and send its own")
		}
	}
}

func TestErrorsAndStrayAnswers(t *testing.T) {
	s := serve(t, func(ws *websocket.Conn) {
		ack(ws)
		f, _ := recv(ws)
		send(ws, `{"id":"99","type":"next","payload":{"data":{"x":1}}}`) // nobody asked
		send(ws, `{"id":"`+f.ID+`","type":"error","payload":[{"message":"field 'nope' not found"}]}`)
		f, _ = recv(ws)
		send(ws, `{"id":"`+f.ID+`","type":"next","payload":{"data":{"n":1}}}`)
		send(ws, `{"id":"`+f.ID+`","type":"complete"}`)
		send(ws, `{"id":"`+f.ID+`","type":"next","payload":{"data":{"n":2}}}`) // answered again
		send(ws, `{"id":"`+f.ID+`","type":"complete"}`)
		recv(ws)
	})
	c, err := Dial(context.Background(), s.options())
	if err != nil {
		t.Fatal(err)
	}
	defer c.Close()
	res, err := c.Do(context.Background(), Request{Query: "query Q { nope }", OperationName: "Q"}, false)
	if err != nil || fmt.Sprint(res.Messages()) != "[field 'nope' not found]" {
		t.Fatalf("%v, %v", res, err)
	}
	res, err = c.Do(context.Background(), Request{Query: "query N { n }", OperationName: "N"}, false)
	if err != nil || string(res.Data) != `{"n":1}` {
		t.Fatalf("%s, %v", res.Data, err)
	}
}

func TestTimeoutStopsTheOperation(t *testing.T) {
	stopped := make(chan string, 1)
	s := serve(t, func(ws *websocket.Conn) {
		ack(ws)
		f, _ := recv(ws)
		for {
			g, _ := recv(ws)
			if g.Type == "eof" {
				return
			}
			if g.Type == "complete" && g.ID == f.ID {
				stopped <- g.ID
			}
		}
	})
	c, err := Dial(context.Background(), s.options())
	if err != nil {
		t.Fatal(err)
	}
	defer c.Close()
	ctx, cancel := context.WithTimeout(context.Background(), 100*time.Millisecond)
	defer cancel()
	if _, err := c.Do(ctx, Request{Query: "query Q { q }", OperationName: "Q"}, false); !errors.Is(err, context.DeadlineExceeded) {
		t.Fatalf("error %v", err)
	}
	select {
	case <-stopped:
	case <-time.After(3 * time.Second):
		t.Fatal("the server wasn't told to stop the operation")
	}
}

// A subscription read as a query takes its first answer, then stops.
func TestSubscriptionFirstAnswer(t *testing.T) {
	stopped := make(chan bool, 1)
	s := serve(t, func(ws *websocket.Conn) {
		ack(ws)
		f, _ := recv(ws)
		send(ws, `{"id":"`+f.ID+`","type":"next","payload":{"data":{"n":1}}}`)
		g, _ := recv(ws)
		stopped <- g.Type == "complete" && g.ID == f.ID
		recv(ws)
	})
	c, err := Dial(context.Background(), s.options())
	if err != nil {
		t.Fatal(err)
	}
	defer c.Close()
	res, err := c.Do(context.Background(), Request{Query: "subscription S { n }", OperationName: "S"}, true)
	if err != nil || string(res.Data) != `{"n":1}` {
		t.Fatalf("%v, %v", res, err)
	}
	if !<-stopped {
		t.Error("the subscription wasn't stopped after its first answer")
	}
}

func TestSubscribe(t *testing.T) {
	s := serve(t, func(ws *websocket.Conn) {
		ack(ws)
		f, _ := recv(ws)
		for i := 1; i <= 2; i++ {
			send(ws, fmt.Sprintf(`{"id":"%s","type":"next","payload":{"data":{"n":%d}}}`, f.ID, i))
		}
		send(ws, `{"id":"`+f.ID+`","type":"complete"}`)
		recv(ws)
	})
	c, err := Dial(context.Background(), s.options())
	if err != nil {
		t.Fatal(err)
	}
	defer c.Close()
	var mu sync.Mutex
	var seen []string
	ended := make(chan struct{})
	_, err = c.Subscribe(Request{Query: "subscription S { n }", OperationName: "S"}, func(kind string, payload []byte) {
		mu.Lock()
		defer mu.Unlock()
		seen = append(seen, kind+" "+string(payload))
		if kind == "complete" {
			close(ended)
		}
	})
	if err != nil {
		t.Fatal(err)
	}
	select {
	case <-ended:
	case <-time.After(3 * time.Second):
		t.Fatal("no complete")
	}
	mu.Lock()
	defer mu.Unlock()
	if want := `[next {"data":{"n":1}} next {"data":{"n":2}} complete ]`; fmt.Sprint(seen) != want {
		t.Errorf("seen %v", seen)
	}
}

func TestCloseEndsWaiters(t *testing.T) {
	s := serve(t, func(ws *websocket.Conn) {
		ack(ws)
		for f, _ := recv(ws); f.Type != "eof"; f, _ = recv(ws) {
		}
	})
	c, err := Dial(context.Background(), s.options())
	if err != nil {
		t.Fatal(err)
	}
	errc := make(chan error, 1)
	go func() {
		_, err := c.Do(context.Background(), Request{Query: "query Q { q }", OperationName: "Q"}, false)
		errc <- err
	}()
	time.Sleep(50 * time.Millisecond)
	c.Close()
	c.Close()
	if err := <-errc; !errors.Is(err, ErrClosed) {
		t.Errorf("a waiting operation got %v", err)
	}
	if !errors.Is(c.Err(), ErrClosed) {
		t.Errorf("Err() = %v", c.Err())
	}
}

// When the server ends the connection, waiters see why.
func TestServerEndsTheConnection(t *testing.T) {
	s := serve(t, func(ws *websocket.Conn) {
		ack(ws)
		recv(ws)
		send(ws, `{"id":"-1","type":"error","payload":[{"messageId":"session_token_replaced","message":"replaced"}]}`)
	})
	c, err := Dial(context.Background(), s.options())
	if err != nil {
		t.Fatal(err)
	}
	defer c.Close()
	_, err = c.Do(context.Background(), Request{Query: "query Q { q }", OperationName: "Q"}, false)
	var r *Rejected
	if !errors.As(err, &r) || r.MessageID != "session_token_replaced" {
		t.Errorf("error %v", err)
	}
	select {
	case <-c.Done():
	default:
		t.Error("Done isn't closed")
	}
}

// An answer the server sends just before it closes the connection is still
// the operation's result.
func TestAnswerBeforeClose(t *testing.T) {
	for i := 0; i < 20; i++ {
		s := serve(t, func(ws *websocket.Conn) {
			ack(ws)
			f, _ := recv(ws)
			send(ws, `{"id":"`+f.ID+`","type":"next","payload":{"data":{"userLeaveMeeting":true}}}`)
			send(ws, `{"id":"`+f.ID+`","type":"complete"}`)
			send(ws, `{"id":"-1","type":"error","payload":[{"messageId":"user_logged_out","message":"bye"}]}`)
		})
		c, err := Dial(context.Background(), s.options())
		if err != nil {
			t.Fatal(err)
		}
		res, err := c.Do(context.Background(), Request{Query: "mutation L { userLeaveMeeting }", OperationName: "L"}, false)
		c.Close()
		if err != nil || string(res.Data) != `{"userLeaveMeeting":true}` {
			t.Fatalf("try %d: %v, %v", i, res, err)
		}
	}
}

// A URL that answers without a websocket gets the hint about graphqlUrl.
func TestDialNotAWebsocket(t *testing.T) {
	srv := httptest.NewTLSServer(http.NotFoundHandler())
	defer srv.Close()
	o := (&script{srv: srv}).options()
	if _, err := Dial(context.Background(), o); err == nil || !strings.Contains(err.Error(), "didn't accept a websocket") {
		t.Errorf("error %v", err)
	}
}

// Cancelling ctx ends the wait for connection_ack, though ctx has no
// deadline.
func TestInitCancelled(t *testing.T) {
	s := serve(t, func(ws *websocket.Conn) {
		recv(ws) // never acknowledged
		recv(ws)
	})
	ctx, cancel := context.WithCancel(context.Background())
	time.AfterFunc(100*time.Millisecond, cancel)
	start := time.Now()
	if _, err := Dial(ctx, s.options()); !errors.Is(err, context.Canceled) || time.Since(start) > 2*time.Second {
		t.Errorf("error %v after %s", err, time.Since(start))
	}
}
