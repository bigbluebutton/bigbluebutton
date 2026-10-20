package fakebbb

import (
	"crypto/sha1"
	"encoding/hex"
	"encoding/json"
	"encoding/xml"
	"io"
	"net/http"
	"net/http/httptest"
	"net/url"
	"strings"
	"testing"
	"time"

	"golang.org/x/net/websocket"
)

const salt = "fake-test-salt"

// joined is a user who joined through the API.
type joined struct {
	Token   string `xml:"session_token"`
	Auth    string `xml:"auth_token"`
	UserID  string `xml:"user_id"`
	Guest   string `xml:"guestStatus"`
	cookies []*http.Cookie
}

func call(t *testing.T, srv *httptest.Server, name, query string) *http.Response {
	t.Helper()
	sum := sha1.Sum([]byte(name + query + salt))
	c := srv.Client()
	c.CheckRedirect = func(*http.Request, []*http.Request) error { return http.ErrUseLastResponse }
	resp, err := c.Get(srv.URL + "/bigbluebutton/api/" + name + "?" + query + "&checksum=" + hex.EncodeToString(sum[:]))
	if err != nil {
		t.Fatal(err)
	}
	return resp
}

func join(t *testing.T, srv *httptest.Server, meetingID, name, extra string) joined {
	t.Helper()
	resp := call(t, srv, "join", "meetingID="+meetingID+"&fullName="+name+"&redirect=false"+extra)
	defer resp.Body.Close()
	body, _ := io.ReadAll(resp.Body)
	var j joined
	if err := xml.Unmarshal(body, &j); err != nil || j.Token == "" {
		t.Fatalf("join: %s", body)
	}
	j.cookies = resp.Cookies()
	return j
}

type wsClient struct {
	t  *testing.T
	ws *websocket.Conn
}

func dial(t *testing.T, srv *httptest.Server, j joined) (*wsClient, json.RawMessage) {
	t.Helper()
	cfg, _ := websocket.NewConfig("wss"+strings.TrimPrefix(srv.URL, "https")+"/graphql", srv.URL)
	cfg.Protocol = []string{"graphql-transport-ws"}
	cfg.TlsConfig = srv.Client().Transport.(*http.Transport).TLSClientConfig
	cfg.Header = http.Header{}
	for _, c := range j.cookies {
		cfg.Header.Add("Cookie", c.Name+"="+c.Value)
	}
	ws, err := websocket.DialConfig(cfg)
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { ws.Close() })
	c := &wsClient{t, ws}
	c.send(`{"type":"connection_init","payload":{"headers":{"X-Session-Token":"` + j.Token + `","X-ClientSessionUUID":"u1","X-ClientType":"HTML5","X-ClientIsMobile":"false"}}}`)
	f := c.recv()
	return c, mustJSON(f)
}

func (c *wsClient) send(s string) {
	if err := websocket.Message.Send(c.ws, s); err != nil {
		c.t.Fatal(err)
	}
}

func (c *wsClient) recv() gqlFrame {
	c.ws.SetReadDeadline(time.Now().Add(2 * time.Second))
	var msg []byte
	if err := websocket.Message.Receive(c.ws, &msg); err != nil {
		return gqlFrame{Type: "eof"}
	}
	var f gqlFrame
	_ = json.Unmarshal(msg, &f)
	return f
}

func (c *wsClient) op(id, opName, query string, vars string) {
	if vars == "" {
		vars = "{}"
	}
	q, _ := json.Marshal(query)
	c.send(`{"id":"` + id + `","type":"subscribe","payload":{"query":` + string(q) + `,"variables":` + vars + `,"operationName":"` + opName + `"}}`)
}

func start(t *testing.T) (*Server, *httptest.Server) {
	t.Helper()
	fake := New(salt)
	srv := httptest.NewTLSServer(fake)
	t.Cleanup(srv.Close)
	resp := call(t, srv, "create", "meetingID=m1&name=Meeting&guestPolicy=ASK_MODERATOR")
	resp.Body.Close()
	return fake, srv
}

func TestGraphQLRejections(t *testing.T) {
	fake, srv := start(t)
	ann := join(t, srv, "m1", "Ann", "&role=MODERATOR")
	stolen := ann
	stolen.cookies = []*http.Cookie{{Name: "JSESSIONID", Value: "nope"}}
	_, f := dial(t, srv, stolen)
	if !strings.Contains(string(f), "check_authorization_error") {
		t.Errorf("without the join's cookie: %s", f)
	}
	for i := 0; i < maxConnsPerSession; i++ {
		if _, f := dial(t, srv, ann); !strings.Contains(string(f), "connection_ack") {
			t.Fatalf("connection %d: %s", i+1, f)
		}
	}
	if _, f := dial(t, srv, ann); !strings.Contains(string(f), "too_many_connections") {
		t.Errorf("a fourth connection: %s", f)
	}
	if n := fake.OpenConnections(); n != maxConnsPerSession {
		t.Errorf("%d open connections", n)
	}
}

func TestGraphQLJoin(t *testing.T) {
	_, srv := start(t)
	ann := join(t, srv, "m1", "Ann", "&role=MODERATOR&avatarURL="+url.QueryEscape("https://img.test/a.png"))
	c, _ := dial(t, srv, ann)

	// Held: not allowed before the join.
	c.op("1", "Users", "query Users { user { userId } }", "")
	c.op("2", "userCurrentSubscription", "subscription userCurrentSubscription { user_current { authToken joined guestStatus } }", "")
	if f := c.recv(); f.ID != "2" || !strings.Contains(string(f.Payload), `"joined":false`) || strings.Contains(string(f.Payload), "name") {
		t.Fatalf("first user_current: %+v %s", f, f.Payload)
	}
	c.op("3", "UserJoin", "mutation UserJoin($authToken: String!, $clientType: String!, $clientIsMobile: Boolean!) { userJoinMeeting(authToken: $authToken, clientType: $clientType, clientIsMobile: $clientIsMobile) }",
		`{"authToken":"`+ann.Auth+`","clientType":"HTML5","clientIsMobile":false}`)
	seen := map[string]string{}
	for i := 0; i < 4; i++ {
		f := c.recv()
		seen[f.ID+" "+f.Type] = string(f.Payload)
	}
	if !strings.Contains(seen["3 next"], `"userJoinMeeting":true`) || !strings.Contains(seen["2 next"], `"joined":true`) {
		t.Errorf("join: %v", seen)
	}
	// The held query is answered once the user is in, and like the real
	// user view it fails once right after the join.
	if !strings.Contains(seen["1 error"], "not found") {
		t.Errorf("the held query: %v", seen)
	}
	c.op("4", "Users", "query Users { user { userId } }", "")
	if f := c.recv(); f.Type != "next" || !strings.Contains(string(f.Payload), ann.UserID) {
		t.Errorf("after the join: %+v %s", f, f.Payload)
	}
	if f := c.recv(); f.ID != "4" || f.Type != "complete" {
		t.Errorf("no complete: %+v", f)
	}
	c.op("5", "Me", "query Me { user_current { avatar role } }", "")
	if f := c.recv(); !strings.Contains(string(f.Payload), `"avatar":"https://img.test/a.png"`) {
		t.Errorf("Me: %s", f.Payload)
	}
	resp := call(t, srv, "isMeetingRunning", "meetingID=m1")
	body, _ := io.ReadAll(resp.Body)
	resp.Body.Close()
	if !strings.Contains(string(body), "<running>true</running>") {
		t.Errorf("isMeetingRunning with a user in: %s", body)
	}
}

func TestGraphQLGuestApproval(t *testing.T) {
	_, srv := start(t)
	mod := join(t, srv, "m1", "Mod", "&role=MODERATOR")
	eve := join(t, srv, "m1", "Eve", "&guest=true")
	if eve.Guest != "WAIT" {
		t.Fatalf("guest status %q", eve.Guest)
	}
	m, _ := dial(t, srv, mod)
	m.op("1", "UserJoin", "mutation UserJoin($a: String!, $t: String!, $m: Boolean!) { userJoinMeeting(authToken: $a, clientType: $t, clientIsMobile: $m) }",
		`{"a":"`+mod.Auth+`","t":"HTML5","m":false}`)
	m.recv()
	m.recv()
	e, _ := dial(t, srv, eve)
	e.op("1", "userCurrentSubscription", "subscription userCurrentSubscription { user_current { guestStatus joined } }", "")
	if f := e.recv(); !strings.Contains(string(f.Payload), `"guestStatus":"WAIT"`) {
		t.Fatalf("%s", f.Payload)
	}
	m.op("2", "Approve", "mutation Approve($g: [GuestUserApprovalStatus!]!) { guestUsersSubmitApprovalStatus(guests: $g) }",
		`{"g":[{"guest":"`+eve.UserID+`","status":"ALLOW"}]}`)
	if f := e.recv(); !strings.Contains(string(f.Payload), `"guestStatus":"ALLOW"`) {
		t.Errorf("after approval: %s", f.Payload)
	}
}
