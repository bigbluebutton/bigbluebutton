package presence

import (
	"context"
	"crypto/sha1"
	"crypto/tls"
	"encoding/hex"
	"encoding/json"
	"encoding/xml"
	"errors"
	"io"
	"net/http"
	"net/http/cookiejar"
	"net/http/httptest"
	"net/url"
	"strings"
	"testing"
	"time"

	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/fakebbb"
	"golang.org/x/net/websocket"
)

const fakeSalt = "presence-test-salt"

type world struct {
	t    *testing.T
	fake *fakebbb.Server
	srv  *httptest.Server
	tls  *tls.Config
}

func newWorld(t *testing.T, createParams string) *world {
	t.Helper()
	fake := fakebbb.New(fakeSalt)
	srv := httptest.NewTLSServer(fake)
	t.Cleanup(srv.Close)
	w := &world{t: t, fake: fake, srv: srv, tls: srv.Client().Transport.(*http.Transport).TLSClientConfig}
	resp := w.call(http.DefaultClient, "create", "meetingID=m1&name=Meeting"+createParams)
	resp.Body.Close()
	return w
}

func (w *world) call(c *http.Client, name, query string) *http.Response {
	w.t.Helper()
	sum := sha1.Sum([]byte(name + query + fakeSalt))
	hc := &http.Client{Transport: w.srv.Client().Transport, Jar: c.Jar,
		CheckRedirect: func(*http.Request, []*http.Request) error { return http.ErrUseLastResponse }}
	resp, err := hc.Get(w.srv.URL + "/bigbluebutton/api/" + name + "?" + query + "&checksum=" + hex.EncodeToString(sum[:]))
	if err != nil {
		w.t.Fatal(err)
	}
	return resp
}

// join joins through the API in its own cookie jar, and attaches.
func (w *world) join(name, extra string) (*User, string) {
	w.t.Helper()
	jar, _ := cookiejar.New(nil)
	c := &http.Client{Jar: jar}
	resp := w.call(c, "join", "meetingID=m1&fullName="+name+"&redirect=false"+extra)
	body, _ := io.ReadAll(resp.Body)
	resp.Body.Close()
	var j struct {
		Token  string `xml:"session_token"`
		UserID string `xml:"user_id"`
	}
	if err := xml.Unmarshal(body, &j); err != nil {
		w.t.Fatalf("join: %s", body)
	}
	base, _ := url.Parse(w.srv.URL)
	gql := *base
	gql.Path = "/graphql"
	u, err := Attach(ctx(w.t), Options{
		URL: "wss://" + base.Host + "/graphql", Origin: w.srv.URL, TLS: w.tls,
		Cookies: jar.Cookies(&gql), UserAgent: "bbb-conform/test", PingEvery: 100 * time.Millisecond,
	}, j.Token)
	if err != nil {
		w.t.Fatalf("attach %s: %v", name, err)
	}
	w.t.Cleanup(u.Close)
	return u, j.UserID
}

func (w *world) running() bool {
	resp := w.call(http.DefaultClient, "isMeetingRunning", "meetingID=m1")
	defer resp.Body.Close()
	body, _ := io.ReadAll(resp.Body)
	return strings.Contains(string(body), "<running>true</running>")
}

// openConnections waits a little for the fake to see connections close.
func (w *world) openConnections(want int) int {
	deadline := time.Now().Add(2 * time.Second)
	n := w.fake.OpenConnections()
	for n != want && time.Now().Before(deadline) {
		time.Sleep(10 * time.Millisecond)
		n = w.fake.OpenConnections()
	}
	return n
}

func ctx(t *testing.T) context.Context {
	c, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	t.Cleanup(cancel)
	return c
}

func snapshot(t *testing.T, u *User) map[string]any {
	t.Helper()
	var m map[string]any
	if err := json.Unmarshal(u.Snapshot(), &m); err != nil {
		t.Fatal(err)
	}
	return m
}

func TestJoinQueryLeave(t *testing.T) {
	w := newWorld(t, "")
	ann, _ := w.join("Ann", "&role=MODERATOR")
	if _, err := ann.Query(ctx(t), Request{Query: "query Users { user { userId } }", OperationName: "Users"}, "query"); !errors.Is(err, ErrNotJoined) {
		t.Errorf("a query before the join: %v", err)
	}
	if w.running() {
		t.Error("running before anyone joined")
	}
	if err := ann.Join(ctx(t), false); err != nil {
		t.Fatal(err)
	}
	snap := snapshot(t, ann)
	if snap["joined"] != true || snap["role"] != "MODERATOR" || snap["sessionToken"] == "" || snap["authToken"] != nil {
		t.Errorf("snapshot %v", snap)
	}
	res, err := ann.Query(ctx(t), Request{Query: "query Me { user_current { name } }", OperationName: "Me"}, "query")
	if err != nil || string(res.Data) != `{"user_current":[{"name":"Ann"}]}` {
		t.Errorf("Me: %v %v", res, err)
	}
	if !w.running() {
		t.Error("not running with a user in")
	}
	if err := ann.Leave(ctx(t)); err != nil {
		t.Fatal(err)
	}
	if snapshot(t, ann)["loggedOut"] != true {
		t.Error("not logged out")
	}
	if n := w.openConnections(0); n != 0 {
		t.Errorf("%d connections open after leaving", n)
	}
}

func TestGuestApproval(t *testing.T) {
	w := newWorld(t, "&guestPolicy=ASK_MODERATOR")
	mod, _ := w.join("Mod", "&role=MODERATOR")
	if err := mod.Join(ctx(t), false); err != nil {
		t.Fatal(err)
	}
	eve, eveID := w.join("Eve", "&guest=true")
	if err := eve.Join(ctx(t), false); err != nil {
		t.Fatal(err)
	}
	if s := snapshot(t, eve); s["guestStatus"] != "WAIT" || s["joined"] != false {
		t.Fatalf("a waiting guest: %v", s)
	}
	done := make(chan error, 1)
	go func() { done <- eve.Join(ctx(t), true) }()
	vars, _ := json.Marshal(map[string]any{"g": []map[string]string{{"guest": eveID, "status": "ALLOW"}}})
	time.Sleep(50 * time.Millisecond)
	if _, err := mod.Query(ctx(t), Request{Query: "mutation A($g: [GuestUserApprovalStatus!]!) { guestUsersSubmitApprovalStatus(guests: $g) }", Variables: vars, OperationName: "A"}, "mutation"); err != nil {
		t.Fatal(err)
	}
	if err := <-done; err != nil {
		t.Fatalf("joining after approval: %v", err)
	}
	if !eve.InMeeting() {
		t.Error("the guest isn't in")
	}
}

// A guest who leaves while still waiting only closes the connection: the
// server ignores a leave from a user who isn't in.
func TestWaitingGuestLeaves(t *testing.T) {
	w := newWorld(t, "&guestPolicy=ASK_MODERATOR")
	eve, _ := w.join("Eve", "&guest=true")
	if err := eve.Join(ctx(t), false); err != nil {
		t.Fatal(err)
	}
	start := time.Now()
	if err := eve.Leave(ctx(t)); err != nil || time.Since(start) > time.Second {
		t.Fatalf("leave: %v after %s", err, time.Since(start))
	}
	// A mutation goes straight to the connection, which is closed.
	if _, err := eve.Query(ctx(t), Request{Query: "mutation M { userLeaveMeeting }", OperationName: "M"}, "mutation"); err == nil {
		t.Error("the connection is still open")
	}
}

// When the user's state comes back as GraphQL errors, waiting on it ends
// at once with the server's message, not at the deadline.
func TestStateErrors(t *testing.T) {
	w := newWorld(t, "")
	ann, _ := w.join("Ann", "")
	if err := ann.Join(ctx(t), false); err != nil {
		t.Fatal(err)
	}
	w.fake.FailUserState("field 'loggedOut' not found in type: 'user_current'")
	start := time.Now()
	err := ann.Leave(ctx(t))
	if err == nil || !strings.Contains(err.Error(), "field 'loggedOut' not found") || time.Since(start) > time.Second {
		t.Errorf("leave: %v after %s", err, time.Since(start))
	}
}

func TestGuestDenied(t *testing.T) {
	w := newWorld(t, "&guestPolicy=ASK_MODERATOR")
	mod, _ := w.join("Mod", "&role=MODERATOR")
	if err := mod.Join(ctx(t), false); err != nil {
		t.Fatal(err)
	}
	eve, eveID := w.join("Eve", "&guest=true")
	vars, _ := json.Marshal(map[string]any{"g": []map[string]string{{"guest": eveID, "status": "DENY"}}})
	if _, err := mod.Query(ctx(t), Request{Query: "mutation A($g: [GuestUserApprovalStatus!]!) { guestUsersSubmitApprovalStatus(guests: $g) }", Variables: vars, OperationName: "A"}, "mutation"); err != nil {
		t.Fatal(err)
	}
	if err := eve.Join(ctx(t), true); err == nil || !strings.Contains(err.Error(), "denied") {
		t.Errorf("a denied guest's join: %v", err)
	}
}

func TestAttachRetriesAnUnknownUser(t *testing.T) {
	w := newWorld(t, "")
	w.fake.RejectInits("user_not_found", "user_not_found")
	ann, _ := w.join("Ann", "")
	if ann.State() == nil {
		t.Error("no state after retrying")
	}
	w.fake.RejectInits("session_token_replaced")
	jar, _ := cookiejar.New(nil)
	resp := w.call(&http.Client{Jar: jar}, "join", "meetingID=m1&fullName=Bob&redirect=false")
	resp.Body.Close()
	_, err := Attach(ctx(t), Options{URL: "wss" + strings.TrimPrefix(w.srv.URL, "https") + "/graphql", Origin: w.srv.URL, TLS: w.tls}, "st000002")
	var r *Rejected
	if !errors.As(err, &r) || r.MessageID != "session_token_replaced" {
		t.Errorf("a rejection that isn't retried: %v", err)
	}
}

func TestDisconnectAndReconnect(t *testing.T) {
	w := newWorld(t, "")
	ann, _ := w.join("Ann", "")
	if err := ann.Join(ctx(t), false); err != nil {
		t.Fatal(err)
	}
	ann.Disconnect()
	deadline := time.Now().Add(2 * time.Second)
	for w.running() && time.Now().Before(deadline) {
		time.Sleep(20 * time.Millisecond)
	}
	if w.running() {
		t.Error("still running with nobody connected")
	}
	if err := ann.Reconnect(ctx(t)); err != nil {
		t.Fatal(err)
	}
	if !w.running() || !ann.InMeeting() {
		t.Error("not back after reconnecting")
	}
}

// Pings keep a connection the server would drop for silence.
func TestKeepalive(t *testing.T) {
	w := newWorld(t, "")
	w.fake.IdleTimeout = 300 * time.Millisecond
	ann, _ := w.join("Ann", "")
	if err := ann.Join(ctx(t), false); err != nil {
		t.Fatal(err)
	}
	time.Sleep(900 * time.Millisecond)
	if _, err := ann.Query(ctx(t), Request{Query: "query Me { user_current { name } }", OperationName: "Me"}, "query"); err != nil {
		t.Errorf("after a quiet spell: %v", err)
	}
}

// scriptedUser attaches a user to a scripted server that answers
// user_current with row, then runs more for the rest of the connection.
func scriptedUser(t *testing.T, row string, more func(ws *websocket.Conn, subID string)) (*User, error) {
	t.Helper()
	s := serve(t, func(ws *websocket.Conn) {
		ack(ws)
		f, _ := recv(ws)
		send(ws, `{"id":"`+f.ID+`","type":"next","payload":{"data":{"user_current":[`+row+`]}}}`)
		more(ws, f.ID)
	})
	return Attach(ctx(t), s.options(), "st1")
}

// When the server stops following the user, waiting for the user fails at
// once, with why, rather than at the timeout.
func TestLostSubscription(t *testing.T) {
	u, err := scriptedUser(t, `{"joined":false,"guestStatus":"ALLOW","authToken":"at1"}`, func(ws *websocket.Conn, subID string) {
		f, _ := recv(ws) // the join
		send(ws, `{"id":"`+f.ID+`","type":"next","payload":{"data":{"userJoinMeeting":true}}}`)
		send(ws, `{"id":"`+f.ID+`","type":"complete"}`)
		send(ws, `{"id":"`+subID+`","type":"error","payload":[{"message":"subscription ended"}]}`)
		recv(ws)
	})
	if err != nil {
		t.Fatal(err)
	}
	defer u.Close()
	start := time.Now()
	err = u.Join(ctx(t), false)
	if err == nil || !strings.Contains(err.Error(), "stopped following the user") || time.Since(start) > 2*time.Second {
		t.Errorf("after %s: %v", time.Since(start), err)
	}
}

func TestLeaveReportsErrors(t *testing.T) {
	u, err := scriptedUser(t, `{"joined":true,"guestStatus":"ALLOW"}`, func(ws *websocket.Conn, _ string) {
		f, _ := recv(ws)
		send(ws, `{"id":"`+f.ID+`","type":"error","payload":[{"message":"Mutation failed (userLeaveMeeting): nope"}]}`)
		recv(ws)
	})
	if err != nil {
		t.Fatal(err)
	}
	defer u.Close()
	if err := u.Leave(ctx(t)); err == nil || !strings.Contains(err.Error(), "Mutation failed") {
		t.Errorf("leave: %v", err)
	}
}

func TestJoinNeedsAConnection(t *testing.T) {
	w := newWorld(t, "")
	ann, _ := w.join("Ann", "")
	if err := ann.Join(ctx(t), false); err != nil {
		t.Fatal(err)
	}
	ann.Disconnect()
	if err := ann.Join(ctx(t), false); err == nil || !strings.Contains(err.Error(), "reconnect first") {
		t.Errorf("a join after a disconnect: %v", err)
	}
}
