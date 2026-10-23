package fakebbb

import (
	"encoding/json"
	"errors"
	"net/http"
	"regexp"
	"sort"
	"strings"
	"sync"
	"time"

	"golang.org/x/net/websocket"
)

// The fake's /graphql stands in for bbb-graphql-middleware, Hasura and the
// GraphQL actions, just enough for the presence driver's tests:
//
//   - the handshake: subprotocol, Origin, the join's JSESSIONID and the
//     connection_init headers, with the middleware's id -1 rejections;
//   - before a user joins, only the middleware's allowlisted queries are
//     answered; the rest are held, and answered once the user joins, as
//     the middleware's retransmission does. Mutations go to the actions
//     service, which has no allowlist;
//   - user_current, as a query or a subscription that pushes changes;
//   - user, the in-meeting role's view, which fails once right after a
//     join, as it does until the session variables are refreshed;
//   - the actions userJoinMeeting, userLeaveMeeting, userSetPresenter,
//     userSetRole and guestUsersSubmitApprovalStatus. Mutations are read
//     with regular expressions written separately from the runner's
//     parser. Like akka-apps, the fake ignores actions the user may not
//     take, and answers true.
//
// It is written separately from internal/presence, so the driver is never
// tested against itself.

// preJoinOps are the operations the middleware lets through before a user
// joins (bbb-graphql-middleware/config/Config.go).
var preJoinOps = map[string]bool{
	"getUserInfo": true, "getMeetingEndData": true, "PluginConfigurationQuery": true,
	"getGuestLobbyInfo": true, "userCurrentSubscription": true, "Patched_userCurrentSubscription": true,
}

// maxConnsPerSession is the middleware's max_connections_per_session_token.
const maxConnsPerSession = 3

var (
	mutationFn   = regexp.MustCompile(`\{\s*(\w+)`)
	mutationArgs = regexp.MustCompile(`(\w+)\s*:\s*\$(\w+)`)
	rootField    = regexp.MustCompile(`^\s*(?:query|subscription)\s+\w+[^{]*\{\s*(\w+)`)
)

type gqlFrame struct {
	ID      string          `json:"id,omitempty"`
	Type    string          `json:"type"`
	Payload json.RawMessage `json:"payload,omitempty"`
}

type gqlRequest struct {
	Query         string                     `json:"query"`
	Variables     map[string]json.RawMessage `json:"variables"`
	OperationName string                     `json:"operationName"`
}

// gqlConn is one websocket the fake serves.
type gqlConn struct {
	s    *Server
	ws   *websocket.Conn
	wmu  sync.Mutex
	sess *session
	subs map[string]string // subscription id -> selected fields ("" = all)
	held []gqlFrame        // operations sent before the user joined
}

// push is a frame for a connection, sent after s.mu is released.
type push struct {
	c *gqlConn
	f gqlFrame
}

func (s *Server) serveGraphQL(w http.ResponseWriter, r *http.Request) {
	websocket.Server{
		Handshake: func(cfg *websocket.Config, req *http.Request) error {
			if !strings.Contains(req.Header.Get("Sec-Websocket-Protocol"), "graphql-transport-ws") {
				return errors.New("graphql-transport-ws only")
			}
			if o := req.Header.Get("Origin"); o != "" && o != origin(req) {
				return errors.New("cross-origin websocket")
			}
			cfg.Protocol = []string{"graphql-transport-ws"}
			return nil
		},
		Handler: s.gqlConnection,
	}.ServeHTTP(w, r)
}

// OpenConnections is how many GraphQL websockets are open.
func (s *Server) OpenConnections() int {
	s.mu.Lock()
	defer s.mu.Unlock()
	n := 0
	for _, cs := range s.conns {
		n += len(cs)
	}
	return n
}

func (s *Server) gqlConnection(ws *websocket.Conn) {
	c := &gqlConn{s: s, ws: ws, subs: map[string]string{}}
	defer ws.Close()
	f, ok := c.recv()
	if !ok || f.Type != "connection_init" {
		return
	}
	if id, msg := c.init(f.Payload, ws.Request()); id != "" {
		c.send(gqlFrame{ID: "-1", Type: "error", Payload: mustJSON([]map[string]string{{"messageId": id, "message": msg}})})
		return
	}
	defer c.closed()
	c.send(gqlFrame{Type: "connection_ack"})
	for {
		f, ok := c.recv()
		if !ok {
			return
		}
		switch f.Type {
		case "ping":
			c.send(gqlFrame{Type: "pong"})
		case "subscribe":
			c.subscribe(f)
		case "complete":
			c.s.mu.Lock()
			delete(c.subs, f.ID)
			c.s.mu.Unlock()
		}
	}
}

func (c *gqlConn) recv() (gqlFrame, bool) {
	if c.s.IdleTimeout > 0 {
		c.ws.SetReadDeadline(time.Now().Add(c.s.IdleTimeout))
	}
	var msg []byte
	if err := websocket.Message.Receive(c.ws, &msg); err != nil {
		return gqlFrame{}, false
	}
	var f gqlFrame
	if json.Unmarshal(msg, &f) != nil {
		return gqlFrame{}, false
	}
	return f, true
}

func (c *gqlConn) send(f gqlFrame) {
	b, _ := json.Marshal(f)
	c.wmu.Lock()
	defer c.wmu.Unlock()
	_ = websocket.Message.Send(c.ws, string(b))
}

func sendAll(ps []push) {
	for _, p := range ps {
		p.c.send(p.f)
	}
}

// init checks connection_init the way the middleware and bbb-web's
// checkGraphqlAuthorization do. It returns a rejection's messageId and
// message, or "".
func (c *gqlConn) init(payload json.RawMessage, r *http.Request) (string, string) {
	var p struct{ Headers map[string]string }
	_ = json.Unmarshal(payload, &p)
	for _, h := range []string{"X-Session-Token", "X-ClientSessionUUID", "X-ClientType", "X-ClientIsMobile"} {
		if p.Headers[h] == "" {
			return "param_missing", h + " is missing"
		}
	}
	s := c.s
	s.mu.Lock()
	defer s.mu.Unlock()
	if len(s.rejects) > 0 {
		id := s.rejects[0]
		s.rejects = s.rejects[1:]
		return id, "rejected for the test"
	}
	sess := s.sessions[p.Headers["X-Session-Token"]]
	if sess == nil {
		return "check_authorization_error", "invalid session token"
	}
	if ck, err := r.Cookie("JSESSIONID"); err != nil || ck.Value != sess.jsession {
		return "check_authorization_error", "the session token isn't this session's"
	}
	if m := s.meetings[sess.meetingID]; m == nil || m.ended {
		return "meeting_not_found", "Meeting not found"
	}
	if len(s.conns[sess.token]) >= maxConnsPerSession {
		return "too_many_connections", "too many connections"
	}
	c.sess = sess
	s.conns[sess.token] = append(s.conns[sess.token], c)
	return "", ""
}

// closed forgets the connection. A user whose last connection closed is
// no longer present, until it reconnects.
func (c *gqlConn) closed() {
	s := c.s
	s.mu.Lock()
	defer s.mu.Unlock()
	cs := s.conns[c.sess.token]
	for i, x := range cs {
		if x == c {
			cs = append(cs[:i], cs[i+1:]...)
			break
		}
	}
	if len(cs) == 0 {
		delete(s.conns, c.sess.token)
	} else {
		s.conns[c.sess.token] = cs
	}
}

func (c *gqlConn) subscribe(f gqlFrame) {
	var req gqlRequest
	if json.Unmarshal(f.Payload, &req) != nil {
		return
	}
	s := c.s
	s.mu.Lock()
	var out []push
	switch {
	case strings.HasPrefix(req.Query, "mutation"):
		out = c.mutation(f.ID, req) // the actions service, which has no allowlist
	case !c.sess.inMeeting() && !preJoinOps[req.OperationName]:
		c.held = append(c.held, f) // silently, like the middleware
	default:
		out = c.query(f.ID, req)
	}
	s.mu.Unlock()
	sendAll(out)
}

func (c *gqlConn) query(id string, req gqlRequest) []push {
	m := rootField.FindStringSubmatch(req.Query)
	if m == nil {
		return c.errors(id, "the fake can't read this query")
	}
	switch m[1] {
	case "user_current":
		fields := selection(req.Query, "user_current")
		row := project(c.sess.row(), fields)
		next := gqlFrame{ID: id, Type: "next", Payload: mustJSON(map[string]any{"data": map[string]any{"user_current": []any{row}}})}
		if strings.HasPrefix(strings.TrimSpace(req.Query), "subscription") {
			c.subs[id] = strings.Join(fields, " ")
			return []push{{c, next}}
		}
		return []push{{c, next}, {c, gqlFrame{ID: id, Type: "complete"}}}
	case "user":
		if c.sess.probeFails > 0 {
			c.sess.probeFails--
			return c.errors(id, "field 'user' not found in type: 'query_root'")
		}
		var users []any
		for _, u := range c.s.sessions {
			if u.meetingID == c.sess.meetingID && u.inMeeting() {
				users = append(users, map[string]any{"userId": u.userID, "name": u.fullName})
			}
		}
		sort.Slice(users, func(i, j int) bool {
			return users[i].(map[string]any)["userId"].(string) < users[j].(map[string]any)["userId"].(string)
		})
		return []push{{c, gqlFrame{ID: id, Type: "next", Payload: mustJSON(map[string]any{"data": map[string]any{"user": users}})}},
			{c, gqlFrame{ID: id, Type: "complete"}}}
	}
	return c.errors(id, "field '"+m[1]+"' not found in type: 'query_root'")
}

func (c *gqlConn) errors(id, msg string) []push {
	return []push{{c, gqlFrame{ID: id, Type: "error", Payload: mustJSON([]map[string]any{{"message": msg, "extensions": map[string]string{"code": "validation-failed"}}})}}}
}

func (c *gqlConn) mutation(id string, req gqlRequest) []push {
	fn := mutationFn.FindStringSubmatch(req.Query)
	if fn == nil {
		return c.errors(id, "no action")
	}
	args := map[string]json.RawMessage{}
	rest := req.Query[strings.Index(req.Query, fn[0])+len(fn[0]):]
	if strings.HasPrefix(strings.TrimSpace(rest), "(") {
		inner := rest[:strings.Index(rest, ")")+1]
		for _, a := range mutationArgs.FindAllStringSubmatch(inner, -1) {
			if v, ok := req.Variables[a[2]]; ok {
				args[a[1]] = v
			}
		}
	}
	str := func(name string) string {
		var v string
		_ = json.Unmarshal(args[name], &v)
		return v
	}
	s, me := c.s, c.sess
	moderator := me.inMeeting() && me.role == "MODERATOR"
	var changed []*session
	switch fn[1] {
	case "userJoinMeeting":
		switch {
		case str("authToken") != me.authToken:
			me.joinErrorCode = "INVALID_AUTH_TOKEN"
		case me.guestStatus != "ALLOW":
			me.joinErrorCode = "PERMISSION_FAILED" // sticky, as in akka-apps
		case !me.joined:
			me.joined, me.probeFails = true, 1
		}
		changed = append(changed, me)
	case "userLeaveMeeting":
		if me.joined { // akka-apps acts only on users in the meeting
			me.loggedOut, me.presenter = true, false // joined stays, as on a real server
			changed = append(changed, me)
		}
	case "userSetPresenter":
		if moderator {
			for _, u := range s.sessions {
				if u.meetingID == me.meetingID && (u.presenter || u.userID == str("userId")) {
					u.presenter = u.userID == str("userId")
					changed = append(changed, u)
				}
			}
		}
	case "userSetRole":
		if u := s.user(me.meetingID, str("userId")); moderator && u != nil {
			u.role = str("role")
			changed = append(changed, u)
		}
	case "guestUsersSubmitApprovalStatus":
		var guests []struct{ Guest, Status string }
		_ = json.Unmarshal(args["guests"], &guests)
		for _, g := range guests {
			if u := s.user(me.meetingID, g.Guest); moderator && u != nil && u.guestStatus == "WAIT" {
				u.guestStatus = g.Status
				changed = append(changed, u)
			}
		}
	default:
		return c.errors(id, "Mutation failed ("+fn[1]+"): no such action")
	}
	out := []push{{c, gqlFrame{ID: id, Type: "next", Payload: mustJSON(map[string]any{"data": map[string]bool{fn[1]: true}})}},
		{c, gqlFrame{ID: id, Type: "complete"}}}
	for _, u := range changed {
		out = append(out, s.pushUser(u)...)
	}
	return out
}

// pushUser sends u's row to its user_current subscriptions, and once u is
// in the meeting, answers what its connections held back.
func (s *Server) pushUser(u *session) []push {
	var out []push
	for _, c := range s.conns[u.token] {
		for id, fields := range c.subs {
			if s.stateErrors != "" {
				out = append(out, push{c, gqlFrame{ID: id, Type: "next", Payload: mustJSON(map[string]any{"errors": []any{map[string]string{"message": s.stateErrors}}})}})
				continue
			}
			row := project(u.row(), strings.Fields(fields))
			out = append(out, push{c, gqlFrame{ID: id, Type: "next", Payload: mustJSON(map[string]any{"data": map[string]any{"user_current": []any{row}}})}})
		}
		if u.inMeeting() && len(c.held) > 0 {
			held := c.held
			c.held = nil
			for _, f := range held {
				var req gqlRequest
				_ = json.Unmarshal(f.Payload, &req)
				out = append(out, c.query(f.ID, req)...)
			}
		}
	}
	return out
}

func (s *Server) user(meetingID, userID string) *session {
	for _, u := range s.sessions {
		if u.meetingID == meetingID && u.userID == userID {
			return u
		}
	}
	return nil
}

// inMeeting is akka-apps' currentlyInMeeting.
func (u *session) inMeeting() bool { return u.joined && !u.loggedOut }

// row is the user's user_current row. Like Hasura's, the columns nothing
// has set yet are null.
func (u *session) row() map[string]any {
	var joinError any
	if u.joinErrorCode != "" {
		joinError = u.joinErrorCode
	}
	return map[string]any{
		"userId": u.userID, "extId": u.extID, "name": u.fullName, "role": u.role,
		"isModerator": u.role == "MODERATOR", "presenter": u.presenter, "guest": u.guest,
		"guestStatus": u.guestStatus, "joined": u.joined, "loggedOut": u.loggedOut,
		"ejected": nil, "ejectReasonCode": nil, "joinErrorCode": joinError, "joinErrorMessage": nil,
		"currentlyInMeeting": u.inMeeting(), "authToken": u.authToken, "avatar": u.avatar,
		"registeredAt": u.registeredAt, "locked": false,
	}
}

// selection lists the fields a query selects on root, one level deep.
func selection(query, root string) []string {
	i := strings.Index(query, root)
	if i < 0 {
		return nil
	}
	rest := query[i+len(root):]
	open := strings.Index(rest, "{")
	if open < 0 {
		return nil
	}
	var fields []string
	depth := 0
	for _, tok := range strings.FieldsFunc(rest[open:], func(r rune) bool { return r == ' ' || r == '\n' || r == '\t' || r == ',' }) {
		for _, part := range splitBraces(tok) {
			switch part {
			case "{":
				depth++
			case "}":
				depth--
				if depth == 0 {
					return fields
				}
			default:
				if depth == 1 {
					fields = append(fields, part)
				}
			}
		}
	}
	return fields
}

func splitBraces(tok string) []string {
	var out []string
	cur := ""
	for _, r := range tok {
		if r == '{' || r == '}' {
			if cur != "" {
				out = append(out, cur)
				cur = ""
			}
			out = append(out, string(r))
			continue
		}
		cur += string(r)
	}
	if cur != "" {
		out = append(out, cur)
	}
	return out
}

func project(row map[string]any, fields []string) map[string]any {
	if len(fields) == 0 {
		return row
	}
	out := map[string]any{}
	for _, f := range fields {
		if v, ok := row[f]; ok {
			out[f] = v
		}
	}
	return out
}

func mustJSON(v any) json.RawMessage {
	b, _ := json.Marshal(v)
	return b
}
