// Package presence drives headless BigBlueButton users. A user joins a
// meeting over bbb-graphql-middleware's websocket the way the HTML5 client
// does, stays present, runs GraphQL operations, and leaves.
package presence

import (
	"bytes"
	"context"
	"crypto/tls"
	"encoding/json"
	"errors"
	"fmt"
	"net"
	"net/http"
	"strconv"
	"strings"
	"sync"
	"time"

	"golang.org/x/net/websocket"
)

// Subprotocol is the only one bbb-graphql-middleware speaks.
const Subprotocol = "graphql-transport-ws"

// DefaultPingEvery is how often a connection pings. The middleware drops a
// connection that sends nothing for 60 seconds.
const DefaultPingEvery = 20 * time.Second

// writeTimeout bounds one frame's write.
const writeTimeout = 10 * time.Second

// Options configure a connection.
type Options struct {
	URL       string // wss://host/graphql
	Origin    string // the page the client came from: the target's base URL
	TLS       *tls.Config
	Cookies   []*http.Cookie
	UserAgent string
	// Headers go in connection_init's payload, as the HTML5 client sends
	// them: X-Session-Token and the like.
	Headers   map[string]string
	PingEvery time.Duration // DefaultPingEvery when zero
}

// ErrClosed is why a connection that Close ended is over.
var ErrClosed = errors.New("the connection was closed")

// Rejected is the server refusing or ending a connection: bbb-graphql-
// middleware sends an error frame with id -1 before it closes.
type Rejected struct {
	MessageID, Message string
}

func (r *Rejected) Error() string {
	return fmt.Sprintf("the server closed the connection: %s: %s", r.MessageID, r.Message)
}

// Result is what an operation answered: GraphQL's data and errors.
type Result struct {
	Data   json.RawMessage   `json:"data,omitempty"`
	Errors []json.RawMessage `json:"errors,omitempty"`
}

// Messages returns the errors' messages.
func (r *Result) Messages() []string {
	var out []string
	for _, e := range r.Errors {
		var m struct{ Message string }
		if json.Unmarshal(e, &m) == nil && m.Message != "" {
			out = append(out, m.Message)
		} else {
			out = append(out, string(e))
		}
	}
	return out
}

// Conn is one graphql-transport-ws connection. Its methods may be called
// from any goroutine.
type Conn struct {
	ws  *websocket.Conn
	wmu sync.Mutex // one frame written at a time

	mu       sync.Mutex
	nextID   int
	ops      map[string]*op
	err      error         // why the connection ended
	rejected *Rejected     // the server's last word, if it said one
	done     chan struct{} // closed when the connection ends

	wg       sync.WaitGroup
	failOnce sync.Once
}

// op is one operation waiting for answers.
type op struct {
	first  bool                              // a subscription read as a query: stop at the first answer
	each   func(kind string, payload []byte) // a subscription: called with each next, error and complete
	result chan *Result                      // a query or mutation: its result, once
	got    *Result
}

type frame struct {
	ID      string          `json:"id,omitempty"`
	Type    string          `json:"type"`
	Payload json.RawMessage `json:"payload,omitempty"`
}

// Dial opens a connection and waits for the server's connection_ack.
func Dial(ctx context.Context, o Options) (*Conn, error) {
	cfg, err := websocket.NewConfig(o.URL, o.Origin)
	if err != nil {
		return nil, err
	}
	cfg.Protocol = []string{Subprotocol}
	cfg.TlsConfig = o.TLS
	cfg.Dialer = &net.Dialer{Timeout: 10 * time.Second}
	cfg.Header = http.Header{}
	if o.UserAgent != "" {
		cfg.Header.Set("User-Agent", o.UserAgent)
	}
	if len(o.Cookies) > 0 {
		parts := make([]string, len(o.Cookies))
		for i, c := range o.Cookies {
			parts[i] = c.Name + "=" + c.Value
		}
		cfg.Header.Set("Cookie", strings.Join(parts, "; "))
	}
	ws, err := cfg.DialContext(ctx)
	if err != nil {
		// DialError doesn't unwrap: errors.Is can't see ErrBadStatus.
		if de := (*websocket.DialError)(nil); errors.As(err, &de) && de.Err == websocket.ErrBadStatus {
			return nil, fmt.Errorf("%s didn't accept a websocket (check the target's graphqlUrl, and that its host matches the base URL's, which is sent as Origin): %w", o.URL, err)
		}
		return nil, fmt.Errorf("%w (websockets are dialled directly, not through HTTPS_PROXY)", err)
	}
	c := &Conn{ws: ws, ops: map[string]*op{}, done: make(chan struct{})}
	if err := c.init(ctx, o.Headers); err != nil {
		ws.Close()
		return nil, err
	}
	every := o.PingEvery
	if every <= 0 {
		every = DefaultPingEvery
	}
	c.wg.Add(2)
	go c.read()
	go c.keepalive(every)
	return c, nil
}

// init sends connection_init and reads until the server acknowledges it.
func (c *Conn) init(ctx context.Context, headers map[string]string) error {
	payload, _ := json.Marshal(map[string]any{"headers": headers})
	if err := c.write(frame{Type: "connection_init", Payload: payload}); err != nil {
		return err
	}
	deadline, ok := ctx.Deadline()
	if !ok {
		deadline = time.Now().Add(30 * time.Second)
	}
	c.ws.SetReadDeadline(deadline)
	defer c.ws.SetReadDeadline(time.Time{})
	// A cancelled ctx (Ctrl-C) ends the wait as its deadline would.
	defer context.AfterFunc(ctx, func() { c.ws.SetReadDeadline(time.Now()) })()
	for {
		f, err := c.receive()
		if err != nil {
			if ctx.Err() != nil {
				return fmt.Errorf("no connection_ack: %w", ctx.Err())
			}
			return fmt.Errorf("no connection_ack: %w", err)
		}
		switch f.Type {
		case "connection_ack":
			return nil
		case "ping":
			if err := c.write(frame{Type: "pong"}); err != nil {
				return err
			}
		case "error":
			if r := rejection(f); r != nil {
				return r
			}
			return fmt.Errorf("no connection_ack: error %s", f.Payload)
		}
	}
}

// rejection reads the middleware's id -1 error frame.
func rejection(f frame) *Rejected {
	if f.ID != "-1" {
		return nil
	}
	var p []struct{ MessageID, Message string }
	if json.Unmarshal(f.Payload, &p) != nil || len(p) == 0 {
		return &Rejected{MessageID: "?", Message: string(f.Payload)}
	}
	return &Rejected{MessageID: p[0].MessageID, Message: p[0].Message}
}

func (c *Conn) receive() (frame, error) {
	var msg []byte
	if err := websocket.Message.Receive(c.ws, &msg); err != nil {
		return frame{}, err
	}
	var f frame
	if err := json.Unmarshal(msg, &f); err != nil {
		return frame{}, fmt.Errorf("a frame isn't JSON: %w", err)
	}
	return f, nil
}

func (c *Conn) write(f frame) error {
	var buf bytes.Buffer
	enc := json.NewEncoder(&buf)
	enc.SetEscapeHTML(false)
	if err := enc.Encode(f); err != nil {
		return err
	}
	c.wmu.Lock()
	defer c.wmu.Unlock()
	c.ws.SetWriteDeadline(time.Now().Add(writeTimeout))
	return websocket.Message.Send(c.ws, strings.TrimSuffix(buf.String(), "\n"))
}

// read hands each frame to its operation until the connection ends.
func (c *Conn) read() {
	defer c.wg.Done()
	defer func() {
		if r := recover(); r != nil {
			c.fail(fmt.Errorf("reading the connection panicked: %v", r))
		}
	}()
	for {
		f, err := c.receive()
		if err != nil {
			c.fail(err)
			return
		}
		switch f.Type {
		case "ping":
			if err := c.write(frame{Type: "pong"}); err != nil {
				c.fail(err)
				return
			}
		case "next", "error", "complete":
			if r := rejection(f); r != nil {
				c.mu.Lock()
				c.rejected = r
				c.mu.Unlock()
				continue // the close follows
			}
			c.deliver(f)
		}
	}
}

func (c *Conn) deliver(f frame) {
	c.mu.Lock()
	o := c.ops[f.ID]
	c.mu.Unlock()
	if o == nil {
		return // an operation that ended, answered again
	}
	switch {
	case o.each != nil:
		if f.Type != "next" { // the subscription is over
			c.mu.Lock()
			delete(c.ops, f.ID)
			c.mu.Unlock()
		}
		o.each(f.Type, f.Payload)
		return
	case f.Type == "next":
		r := &Result{}
		if err := json.Unmarshal(f.Payload, r); err != nil {
			r.Errors = []json.RawMessage{json.RawMessage(strconv.Quote("an answer isn't a GraphQL result: " + string(f.Payload)))}
		}
		o.got = r
		if !o.first {
			return // complete follows
		}
		_ = c.write(frame{ID: f.ID, Type: "complete"})
	case f.Type == "error":
		var errs []json.RawMessage
		if json.Unmarshal(f.Payload, &errs) != nil {
			errs = []json.RawMessage{f.Payload}
		}
		o.got = &Result{Errors: errs}
	}
	c.mu.Lock()
	delete(c.ops, f.ID)
	c.mu.Unlock()
	if o.got == nil {
		o.got = &Result{} // complete with nothing before it
	}
	o.result <- o.got
}

func (c *Conn) keepalive(every time.Duration) {
	defer c.wg.Done()
	t := time.NewTicker(every)
	defer t.Stop()
	for {
		select {
		case <-t.C:
			if err := c.write(frame{Type: "ping"}); err != nil {
				c.fail(err)
				return
			}
		case <-c.done:
			return
		}
	}
}

// fail ends the connection for everyone waiting on it, and closes the
// socket: a connection the server closed, or that can't be written to,
// isn't kept open until the case ends.
func (c *Conn) fail(err error) {
	c.failOnce.Do(func() {
		c.mu.Lock()
		c.err = err
		c.mu.Unlock()
		close(c.done)
		c.wmu.Lock()
		c.ws.SetWriteDeadline(time.Now().Add(2 * time.Second))
		c.ws.Close() // sends the close frame; the reader then stops
		c.wmu.Unlock()
	})
}

// Done is closed when the connection ends.
func (c *Conn) Done() <-chan struct{} { return c.done }

// Err says why the connection ended: the server's rejection when it sent
// one, otherwise the error that ended it. It is nil while it is open.
func (c *Conn) Err() error {
	select {
	case <-c.done:
	default:
		return nil
	}
	c.mu.Lock()
	defer c.mu.Unlock()
	if c.rejected != nil {
		return c.rejected
	}
	return c.err
}

// Request is one GraphQL operation.
type Request struct {
	Query         string          `json:"query"`
	Variables     json.RawMessage `json:"variables,omitempty"`
	OperationName string          `json:"operationName,omitempty"`
}

func (c *Conn) start(r Request, o *op) (string, error) {
	payload, err := json.Marshal(r)
	if err != nil {
		return "", err
	}
	c.mu.Lock()
	c.nextID++
	id := strconv.Itoa(c.nextID)
	c.ops[id] = o
	c.mu.Unlock()
	if err := c.write(frame{ID: id, Type: "subscribe", Payload: payload}); err != nil {
		c.forget(id)
		return "", err
	}
	return id, nil
}

// forget drops an operation and tells the server to stop it.
func (c *Conn) forget(id string) {
	c.mu.Lock()
	_, pending := c.ops[id]
	delete(c.ops, id)
	c.mu.Unlock()
	if pending {
		select {
		case <-c.done:
		default:
			_ = c.write(frame{ID: id, Type: "complete"})
		}
	}
}

// Do runs a query or mutation and returns its result. A subscription is
// read as a query: its first answer. When ctx ends first, the server is
// told to stop the operation.
func (c *Conn) Do(ctx context.Context, r Request, subscription bool) (*Result, error) {
	o := &op{first: subscription, result: make(chan *Result, 1)}
	id, err := c.start(r, o)
	if err != nil {
		return nil, err
	}
	select {
	case res := <-o.result:
		return res, nil
	case <-c.done:
		// The reader delivers an answer before it ends the connection, so
		// an answer the server sent just before closing is already here.
		select {
		case res := <-o.result:
			return res, nil
		default:
		}
		return nil, c.Err()
	case <-ctx.Done():
		c.forget(id)
		return nil, ctx.Err()
	}
}

// Subscribe starts a subscription. each sees every frame for it, next,
// error and the final complete, on the connection's reader, so it must not
// block. Stop it with Unsubscribe.
func (c *Conn) Subscribe(r Request, each func(kind string, payload []byte)) (string, error) {
	return c.start(r, &op{each: each})
}

// Unsubscribe stops a subscription.
func (c *Conn) Unsubscribe(id string) { c.forget(id) }

// Close closes the connection and waits for its goroutines. It may be
// called more than once.
func (c *Conn) Close() error {
	c.fail(ErrClosed)
	c.wg.Wait()
	return nil
}
