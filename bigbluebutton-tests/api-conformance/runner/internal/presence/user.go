package presence

import (
	"context"
	"crypto/rand"
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"sync"
	"time"
)

// PreJoinOps are the only operations bbb-graphql-middleware answers before
// a user is in the meeting (its config/Config.go). It drops any other
// query silently, and sends it again after the join.
var PreJoinOps = map[string]bool{
	"getUserInfo": true, "getMeetingEndData": true, "PluginConfigurationQuery": true,
	"getGuestLobbyInfo": true, "userCurrentSubscription": true, "Patched_userCurrentSubscription": true,
}

// ErrNotJoined refuses a query the middleware wouldn't answer yet.
var ErrNotJoined = errors.New("the user isn't in the meeting yet, so bbb-graphql-middleware would drop this query without an answer until they join; join first, or name the operation as one it answers before a join (" +
	"getUserInfo, getGuestLobbyInfo, userCurrentSubscription, ...)")

// stateFields is what the driver follows of its user. Each is visible to
// the user both before and after the join.
const stateFields = "userId extId name role isModerator guest guestStatus joined loggedOut ejected ejectReasonCode joinErrorCode joinErrorMessage authToken"

// Snapshot fields are the state without what a join leaves to chance or
// keeps secret: the presenter, locks and the auth token.
var snapshotFields = []string{"userId", "extId", "name", "role", "isModerator", "guest", "guestStatus",
	"joined", "loggedOut", "ejected", "ejectReasonCode", "joinErrorCode", "joinErrorMessage"}

const (
	attachTries = 5
	attachPause = 300 * time.Millisecond
	// probePause keeps the readiness probe under the middleware's 200
	// queries a minute, past which it delays a connection's queries.
	probePause = 300 * time.Millisecond
)

// User is a headless user: a connection to bbb-graphql-middleware for the
// session a join began, and what user_current last said about them.
type User struct {
	opts  Options
	token string

	mu      sync.Mutex
	conn    *Conn
	state   map[string]any
	lost    error         // why the server stopped user_current, if it did
	changed chan struct{} // closed and replaced on each change
}

// Attach connects to the session a join began, and waits for the user's
// first user_current row. It retries while akka-apps hasn't registered the
// user yet. o.Headers is filled in.
func Attach(ctx context.Context, o Options, sessionToken string) (*User, error) {
	o.Headers = map[string]string{
		"X-Session-Token":     sessionToken,
		"X-ClientSessionUUID": newUUID(),
		"X-ClientType":        "HTML5",
		"X-ClientIsMobile":    "false",
	}
	u := &User{opts: o, token: sessionToken, changed: make(chan struct{})}
	if err := u.connect(ctx); err != nil {
		return nil, err
	}
	return u, nil
}

// connect dials, follows user_current, and waits for its first row.
func (u *User) connect(ctx context.Context) error {
	var conn *Conn
	var err error
	for try := 1; ; try++ {
		conn, err = Dial(ctx, u.opts)
		var r *Rejected
		if err == nil || !errors.As(err, &r) || try == attachTries ||
			(r.MessageID != "user_not_found" && r.MessageID != "meeting_not_found") {
			break
		}
		select {
		case <-time.After(attachPause):
		case <-ctx.Done():
			return ctx.Err()
		}
	}
	if err != nil {
		var r *Rejected
		if errors.As(err, &r) && r.MessageID == "check_authorization_error" {
			return fmt.Errorf("%w (bbb-web didn't accept the session: does the connection carry the join's JSESSIONID?)", err)
		}
		return err
	}
	u.mu.Lock()
	u.conn, u.state, u.lost = conn, nil, nil
	u.mu.Unlock()
	_, err = conn.Subscribe(Request{
		Query:         "subscription userCurrentSubscription { user_current { " + stateFields + " } }",
		OperationName: "userCurrentSubscription",
	}, u.follow)
	if err == nil {
		err = u.waitFor(ctx, func(st map[string]any) (bool, error) { return st != nil, nil })
	}
	if err != nil {
		conn.Close()
		return fmt.Errorf("following the user: %w", err)
	}
	return nil
}

// follow takes each user_current answer, on the connection's reader.
func (u *User) follow(kind string, payload []byte) {
	if kind != "next" { // the server ended the subscription: no more changes
		u.mu.Lock()
		u.lost = fmt.Errorf("the server stopped following the user (%s %s)", kind, payload)
		close(u.changed)
		u.changed = make(chan struct{})
		u.mu.Unlock()
		return
	}
	var r struct {
		Data struct {
			UserCurrent []map[string]any `json:"user_current"`
		}
		Errors []struct{ Message string }
	}
	if json.Unmarshal(payload, &r) != nil || len(r.Errors) == 0 && len(r.Data.UserCurrent) == 0 {
		return
	}
	u.mu.Lock()
	if len(r.Errors) > 0 {
		// Waiting on the state would time out: say why instead, until an
		// answer comes with the state again.
		var msgs []string
		for _, e := range r.Errors {
			msgs = append(msgs, e.Message)
		}
		u.lost = fmt.Errorf("the server answered the user's state with errors: %s", strings.Join(msgs, "; "))
	} else {
		u.state, u.lost = r.Data.UserCurrent[0], nil
	}
	close(u.changed)
	u.changed = make(chan struct{})
	u.mu.Unlock()
}

// waitFor waits until cond holds for the user's state, or fails.
func (u *User) waitFor(ctx context.Context, cond func(map[string]any) (bool, error)) error {
	for {
		u.mu.Lock()
		st, changed, conn, lost := u.state, u.changed, u.conn, u.lost
		u.mu.Unlock()
		if done, err := cond(st); done || err != nil {
			return err
		}
		if lost != nil {
			return lost
		}
		select {
		case <-changed:
		case <-conn.Done():
			// The reader applies the last change before it ends the
			// connection: check it before giving up.
			if done, err := cond(u.State()); done || err != nil {
				return err
			}
			return conn.Err()
		case <-ctx.Done():
			return fmt.Errorf("%w; the user is %s", ctx.Err(), describe(st))
		}
	}
}

func describe(st map[string]any) string {
	if st == nil {
		return "not known yet"
	}
	return fmt.Sprintf("joined=%v guestStatus=%s loggedOut=%v ejected=%v joinErrorCode=%q", flag(st, "joined"), str(st, "guestStatus"), flag(st, "loggedOut"), flag(st, "ejected"), str(st, "joinErrorCode"))
}

func str(st map[string]any, k string) string {
	s, _ := st[k].(string)
	return s
}

func flag(st map[string]any, k string) bool {
	b, _ := st[k].(bool)
	return b
}

// gone says why a user can't be in the meeting, or "".
func gone(st map[string]any) string {
	switch {
	case flag(st, "loggedOut"):
		return "the user has logged out"
	case flag(st, "ejected"):
		return "the user was ejected (" + str(st, "ejectReasonCode") + ")"
	case str(st, "joinErrorCode") != "":
		return "the join failed: " + str(st, "joinErrorCode") + " " + str(st, "joinErrorMessage")
	case str(st, "guestStatus") == "DENY":
		return "the guest was denied"
	}
	return ""
}

// Join joins the user to the meeting, as the HTML5 client does once
// user_current gives it an auth token. A guest who must wait for approval
// is left waiting unless waitForApproval is set; then Join waits for the
// approval first. Once joined, Join waits until the user's in-meeting
// queries are answered.
func (u *User) Join(ctx context.Context, waitForApproval bool) error {
	if err := u.connection().Err(); err != nil {
		return fmt.Errorf("the connection is closed, reconnect first: %w", err)
	}
	st := u.State()
	if flag(st, "joined") && gone(st) == "" {
		return nil
	}
	if str(st, "guestStatus") == "WAIT" {
		if !waitForApproval {
			return nil
		}
		err := u.waitFor(ctx, func(st map[string]any) (bool, error) {
			return str(st, "guestStatus") != "WAIT", nil
		})
		if err != nil {
			return fmt.Errorf("waiting for approval: %w", err)
		}
		st = u.State()
	}
	if why := gone(st); why != "" {
		return errors.New(why)
	}
	vars, _ := json.Marshal(map[string]any{"authToken": str(st, "authToken"), "clientType": "HTML5", "clientIsMobile": false})
	res, err := u.connection().Do(ctx, Request{
		Query:         "mutation UserJoin($authToken: String!, $clientType: String!, $clientIsMobile: Boolean!) { userJoinMeeting(authToken: $authToken, clientType: $clientType, clientIsMobile: $clientIsMobile) }",
		Variables:     vars,
		OperationName: "UserJoin",
	}, false)
	if err != nil {
		return fmt.Errorf("userJoinMeeting: %w", err)
	}
	if len(res.Errors) > 0 {
		return fmt.Errorf("userJoinMeeting: %s", strings.Join(res.Messages(), "; "))
	}
	err = u.waitFor(ctx, func(st map[string]any) (bool, error) {
		if why := gone(st); why != "" {
			return false, errors.New(why)
		}
		return flag(st, "joined"), nil
	})
	if err != nil {
		return err
	}
	return u.ready(ctx)
}

// ready waits until the middleware answers the user's in-meeting queries:
// akka-apps refreshes the session's variables after the join, and until
// then the user can't see the user view.
func (u *User) ready(ctx context.Context) error {
	for {
		res, err := u.connection().Do(ctx, Request{Query: "query PresenceReady { user(limit: 1) { userId } }", OperationName: "PresenceReady"}, false)
		if err != nil {
			return fmt.Errorf("waiting for the in-meeting role: %w", err)
		}
		if len(res.Errors) == 0 {
			return nil
		}
		select {
		case <-time.After(probePause):
		case <-ctx.Done():
			return fmt.Errorf("waiting for the in-meeting role: %w (last: %s)", ctx.Err(), strings.Join(res.Messages(), "; "))
		}
	}
}

// State is what user_current last said about the user.
func (u *User) State() map[string]any {
	u.mu.Lock()
	defer u.mu.Unlock()
	return u.state
}

// Snapshot is the user's state as a document for checks and recordings:
// what user_current said, without the fields a join leaves to chance or
// keeps secret, plus the session token.
func (u *User) Snapshot() []byte {
	st := u.State()
	doc := map[string]any{"sessionToken": u.token}
	for _, f := range snapshotFields {
		if v, ok := st[f]; ok {
			doc[f] = v
		}
	}
	b, _ := json.Marshal(doc)
	return b
}

// InMeeting says whether the user has joined and is still in.
func (u *User) InMeeting() bool {
	st := u.State()
	return flag(st, "joined") && gone(st) == ""
}

// Query runs one operation as the user. A query the middleware wouldn't
// answer yet is refused with ErrNotJoined. A subscription is read as a
// query: its first answer.
func (u *User) Query(ctx context.Context, r Request, kind string) (*Result, error) {
	if kind != "mutation" && !u.InMeeting() && !PreJoinOps[r.OperationName] {
		return nil, ErrNotJoined
	}
	return u.connection().Do(ctx, r, kind == "subscription")
}

// Leave logs the user out, as the HTML5 client's Leave button does, and
// closes the connection. A user who isn't in the meeting, such as a guest
// still waiting or one removed, only has the connection closed: the
// server ignores a leave from them.
func (u *User) Leave(ctx context.Context) error {
	if !u.InMeeting() {
		u.Disconnect()
		return nil
	}
	res, err := u.connection().Do(ctx, Request{Query: "mutation UserLeaveMeeting { userLeaveMeeting }", OperationName: "UserLeaveMeeting"}, false)
	var r *Rejected
	switch {
	case errors.As(err, &r): // the server may close the connection of a user who left
	case err != nil:
		return fmt.Errorf("userLeaveMeeting: %w", err)
	case len(res.Errors) > 0:
		return fmt.Errorf("userLeaveMeeting: %s", strings.Join(res.Messages(), "; "))
	}
	err = u.waitFor(ctx, func(st map[string]any) (bool, error) { return flag(st, "loggedOut"), nil })
	if errors.As(err, &r) {
		err = nil // the server may close the connection of a user who left
	}
	u.Disconnect()
	return err
}

func (u *User) connection() *Conn {
	u.mu.Lock()
	defer u.mu.Unlock()
	return u.conn
}

// Disconnect drops the connection, as a closed browser tab does. The user
// stays in the meeting for a while, and can reconnect.
func (u *User) Disconnect() { u.connection().Close() }

// Reconnect opens a new connection for the same session and client, and
// joins again if the user was dropped from the meeting meanwhile.
func (u *User) Reconnect(ctx context.Context) error {
	u.Disconnect()
	if err := u.connect(ctx); err != nil {
		return err
	}
	switch st := u.State(); {
	case gone(st) != "" || str(st, "guestStatus") == "WAIT":
		return nil
	case !flag(st, "joined"):
		return u.Join(ctx, false)
	}
	return u.ready(ctx)
}

// Close drops the connection; it may be called more than once.
func (u *User) Close() { u.Disconnect() }

func newUUID() string {
	var b [16]byte
	_, _ = rand.Read(b[:])
	b[6] = b[6]&0x0f | 0x40
	b[8] = b[8]&0x3f | 0x80
	return fmt.Sprintf("%x-%x-%x-%x-%x", b[0:4], b[4:6], b[6:8], b[8:10], b[10:16])
}
