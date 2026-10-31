// Package fakebbb is a small stand-in for bbb-web, for the runner's own
// tests. It implements just enough of the API for the example cases, and it
// is deterministic: create times, passwords and session tokens count up.
//
// Its checksum check follows bbb-web's algorithm (GetChecksum.java and
// GetChecksumValidator.java) and is written separately from the runner's
// signer, so the signer is never tested against itself.
package fakebbb

import (
	"crypto/sha1"
	"crypto/sha256"
	"crypto/sha512"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"hash"
	"html"
	"io"
	"mime"
	"net/http"
	"net/url"
	"sort"
	"strconv"
	"strings"
	"sync"
	"time"
)

// Server is the fake. Use it as an http.Handler.
type Server struct {
	Salt string
	// EndPolls is how many isMeetingRunning calls an ended meeting still
	// answers with true, so cases have something to wait for.
	EndPolls int
	// IdleTimeout, when set, closes a GraphQL websocket that sends nothing
	// for that long, as bbb-graphql-middleware does after a minute.
	IdleTimeout time.Duration
	// Redis, when set, gets the bus messages and keys a real server would
	// publish and write; DataDir the recording markers.
	Redis   Redis
	DataDir string
	// DeleteMarkers removes markers as soon as they're written, as
	// record-and-playback does.
	DeleteMarkers bool
	// Callbacks, when set, sends the callbacks a real server sends when a
	// meeting ends, to meta_endCallbackUrl and meetingEndedURL.
	Callbacks *http.Client

	api bool // behave like bbb-api, the Go port

	mu          sync.Mutex
	clock       int64
	meetings    map[string]*meeting
	sessions    map[string]*session
	conns       map[string][]*gqlConn // GraphQL websockets by session token
	rejects     []string              // messageIds for the next connection_inits to be rejected with
	stateErrors string                // what user_current changes answer instead, when set
	loseEnds    int                   // how many ends to acknowledge and drop
	seq         int
	// Requests records every request's method, path and raw query, and
	// whether it was chunked, for tests that check what the runner sent.
	Requests []Seen
}

// Seen is one request as the fake received it.
type Seen struct {
	Method, Path, RawQuery, ContentType string
	Header                              http.Header
	Chunked                             bool
	Body                                string
}

type meeting struct {
	id, intID, name         string
	attendeePW, moderatorPW string
	createTime              int64
	meta                    map[string]string
	guestPolicy             string
	voiceConf               string
	record                  bool
	meetingKeepEvents       bool
	endedURL                string // meetingEndedURL
	ended                   bool
	endPolls                int
}

// session is a user who joined through the API, with the state the
// GraphQL side shows of them.
type session struct {
	token, meetingID, fullName string
	jsession                   string // the JSESSIONID join set
	userID, extID, authToken   string
	role, guestStatus, avatar  string
	registeredAt               string
	guest, presenter           bool
	joined, loggedOut          bool
	joinErrorCode              string
	probeFails                 int // in-meeting queries that still fail after the join
}

// New returns a fake with the given salt. Create times start at a fixed
// instant.
func New(salt string) *Server {
	return &Server{Salt: salt, EndPolls: 2, clock: 1760000000000,
		meetings: map[string]*meeting{}, sessions: map[string]*session{}, conns: map[string][]*gqlConn{}}
}

// RejectInits makes the next GraphQL connections fail their
// connection_init with these messageIds, one each, like a middleware that
// hasn't heard of the user yet (user_not_found).
func (s *Server) RejectInits(ids ...string) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.rejects = append(s.rejects, ids...)
}

// LoseEnds makes the next n ends answer as usual but do nothing, as on a
// real server when an end reaches akka-apps before the meeting's create.
func (s *Server) LoseEnds(n int) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.loseEnds = n
}

// FailUserState makes later changes to users' user_current
// subscriptions arrive as GraphQL errors with this message, as Hasura
// sends after a permission change. "" puts things back, and sends each
// user's row again, as Hasura's next poll would.
func (s *Server) FailUserState(msg string) {
	s.mu.Lock()
	was := s.stateErrors
	s.stateErrors = msg
	var out []push
	if msg == "" && was != "" {
		for _, u := range s.sessions {
			out = append(out, s.pushUser(u)...)
		}
	}
	s.mu.Unlock()
	sendAll(out)
}

// Skew shifts the fake's clock and counters, so two fakes give different
// create times, passwords and tokens, as two real servers would.
func (s *Server) Skew(ms int64, seq int) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.clock += ms
	s.seq += seq
}

// NewAPI returns a fake with bbb-api's response format, from the port
// branch: calls under /meeting-api/, HTTP 202 with application/xml,
// returnCode and moderatorPw in create, a case-sensitive checksum
// comparison, and only the five calls bbb-api serves.
func NewAPI(salt string) *Server {
	s := New(salt)
	s.api = true
	return s
}

// apiCalls are the calls bbb-api serves (cmd/meeting-api/main.go).
var apiCalls = map[string]bool{"create": true, "getMeetings": true, "getMeetingInfo": true, "isMeetingRunning": true, "insertDocument": true}

// unsigned calls are authenticated by session token, or not at all.
var unsigned = map[string]bool{"stuns": true, "signOut": true, "getJoinUrl": true, "learningDashboard": true}

func (s *Server) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path == "/graphql" && !s.api {
		s.serveGraphQL(w, r) // a long-lived websocket, not a logged request
		return
	}
	w.Header()["Date"] = nil // keep responses byte-for-byte repeatable
	raw, _ := io.ReadAll(r.Body)
	body := string(raw)
	s.mu.Lock()
	s.Requests = append(s.Requests, Seen{Method: r.Method, Path: r.URL.Path, RawQuery: r.URL.RawQuery,
		ContentType: r.Header.Get("Content-Type"), Header: r.Header.Clone(), Chunked: len(r.TransferEncoding) > 0 && r.TransferEncoding[0] == "chunked", Body: body})
	s.mu.Unlock()

	path := strings.TrimSuffix(r.URL.Path, "/")
	if s.api {
		call, ok := strings.CutPrefix(path, "/meeting-api/")
		if !ok || !apiCalls[call] {
			http.NotFound(w, r)
			return
		}
		path = "/bigbluebutton/api/" + call
	}
	if rest, ok := strings.CutPrefix(r.URL.EscapedPath(), "/bigbluebutton/presentation/"); ok && !s.api {
		// Stands in for the presentation routes: it echoes the escaped path.
		w.Header().Set("Content-Type", "text/plain")
		fmt.Fprint(w, "presentation/"+rest)
		return
	}
	if path == "/bigbluebutton/api" && !s.api {
		s.writeXML(w, "<returncode>SUCCESS</returncode><version>2.0</version><apiVersion>2.0</apiVersion><bbbVersion></bbbVersion>")
		return
	}
	call, ok := strings.CutPrefix(path, "/bigbluebutton/api/")
	if !ok || call == "" || strings.Contains(call, "/") {
		http.NotFound(w, r)
		return
	}
	params, err := parseParams(r, body)
	if err != nil {
		s.fail(w, r, "paramError", err.Error())
		return
	}
	if !unsigned[call] {
		if key, msg, ok := s.checkChecksum(call, r.URL.RawQuery); !ok {
			s.fail(w, r, key, msg)
			return
		}
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	switch call {
	case "create":
		s.create(w, r, params)
	case "getMeetingInfo":
		s.getMeetingInfo(w, r, params)
	case "getMeetings":
		s.writeXML(w, "<returncode>SUCCESS</returncode><meetings/><messageKey>noMeetings</messageKey><message>no meetings were found on this server</message>")
	case "isMeetingRunning":
		id := params.Get("meetingID")
		m := s.meetings[id]
		running := m != nil && s.present(m)
		if m != nil && m.ended {
			running = true
			if m.endPolls++; m.endPolls > s.EndPolls {
				delete(s.meetings, id)
				running = false
			}
		}
		s.writeXML(w, fmt.Sprintf("<returncode>SUCCESS</returncode><running>%t</running>", running))
	case "end":
		s.end(w, r, params)
	case "join":
		s.join(w, r, params)
	case "getJoinUrl":
		s.getJoinURL(w, r, params)
	case "stuns":
		writeJSON(w, map[string]any{"returncode": "FAILED", "message": "Could not find conference.", "logoutURL": origin(r) + "/"})
	case "insertDocument":
		if r.Method != http.MethodPost {
			s.fail(w, r, "notAllowed", "insertDocument only accepts POST")
			return
		}
		if s.meetings[params.Get("meetingID")] == nil {
			s.fail(w, r, "notFound", "We could not find a meeting with that meeting ID")
			return
		}
		s.writeXML(w, "<returncode>SUCCESS</returncode><messageKey/><message>Presentation is being uploaded</message>")
	case "putRecordingTextTrack":
		writeJSON(w, map[string]any{"response": map[string]any{"returncode": "SUCCESS", "messageKey": "upload_text_track_success", "message": "Text track uploaded successfully"}})
	default:
		http.NotFound(w, r)
	}
}

// parseParams merges the query with form bodies, like getParameterMap.
func parseParams(r *http.Request, body string) (url.Values, error) {
	params, err := url.ParseQuery(r.URL.RawQuery)
	if err != nil {
		return nil, err
	}
	mt, _, _ := mime.ParseMediaType(r.Header.Get("Content-Type"))
	if mt == "application/x-www-form-urlencoded" {
		form, err := url.ParseQuery(body)
		if err != nil {
			return nil, err
		}
		for k, vs := range form {
			params[k] = append(params[k], vs...)
		}
	}
	return params, nil
}

// checkChecksum is bbb-web's check: three literal removals of the
// checksum from the raw query, the algorithm by length, hex in any case.
func (s *Server) checkChecksum(call, rawQuery string) (key, msg string, ok bool) {
	if s.api {
		return s.checkChecksumAPI(call, rawQuery)
	}
	params, _ := url.ParseQuery(rawQuery)
	sums := params["checksum"]
	if len(sums) > 1 {
		return "checksumError", "Checksums do not match", false
	}
	if len(sums) == 0 || sums[0] == "" {
		return "checksumError", "You must provide the checksum", false
	}
	sum := sums[0]
	q := strings.ReplaceAll(rawQuery, "&checksum="+sum, "")
	q = strings.ReplaceAll(q, "checksum="+sum+"&", "")
	q = strings.ReplaceAll(q, "checksum="+sum, "")
	var h hash.Hash
	switch len(sum) {
	case 40:
		h = sha1.New()
	case 64:
		h = sha256.New()
	case 96:
		h = sha512.New384()
	case 128:
		h = sha512.New()
	default:
		return "checksumError", "Checksums do not match", false
	}
	h.Write([]byte(call + q + s.Salt))
	if !strings.EqualFold(hex.EncodeToString(h.Sum(nil)), sum) {
		return "checksumError", "Checksums do not match", false
	}
	return "", "", true
}

// checkChecksumAPI compares the checksum exactly, as bbb-api does, and
// words its error the same way.
func (s *Server) checkChecksumAPI(call, rawQuery string) (key, msg string, ok bool) {
	const mismatch = "Checksums do not match."
	params, _ := url.ParseQuery(rawQuery)
	sums := params["checksum"]
	if len(sums) != 1 || sums[0] == "" {
		return "checksumError", mismatch, false
	}
	sum := sums[0]
	var kept []string
	for _, entry := range strings.Split(rawQuery, "&") {
		if k, _, _ := strings.Cut(entry, "="); k != "checksum" {
			kept = append(kept, entry)
		}
	}
	var h hash.Hash
	switch len(sum) {
	case 40:
		h = sha1.New()
	case 64:
		h = sha256.New()
	case 96:
		h = sha512.New384()
	case 128:
		h = sha512.New()
	default:
		return "checksumError", mismatch, false
	}
	h.Write([]byte(call + strings.Join(kept, "&") + s.Salt))
	if hex.EncodeToString(h.Sum(nil)) != sum {
		return "checksumError", mismatch, false
	}
	return "", "", true
}

func (s *Server) create(w http.ResponseWriter, r *http.Request, p url.Values) {
	if mt, _, _ := mime.ParseMediaType(r.Header.Get("Content-Type")); mt == "application/json" {
		s.fail(w, r, "unsupportedContentType", "POST request Content-Type is missing or unsupported")
		return
	}
	id, name := p.Get("meetingID"), p.Get("name")
	switch {
	case id == "":
		s.fail(w, r, "validationError", "Invalid meeting ID")
		return
	case strings.Contains(id, ","):
		s.fail(w, r, "validationError", "Meeting ID cannot contain ','")
		return
	case !p.Has("name"):
		s.fail(w, r, "nullError", "You must provide a meeting name")
		return
	case len(name) < 2 || len(name) > 256:
		s.fail(w, r, "sizeError", "Meeting name must be between 2 and 256 characters")
		return
	}
	ap, mp := p.Get("attendeePW"), p.Get("moderatorPW")
	if m := s.meetings[id]; m != nil {
		if (ap == "" && mp == "") || (ap == m.attendeePW && mp == m.moderatorPW) {
			s.writeMeeting(w, m, "duplicateWarning", "This conference was already in existence and may currently be in progress.")
			return
		}
		s.fail(w, r, "idNotUnique", "A meeting already exists with that meeting ID.  Please use a different meeting ID.")
		return
	}
	s.clock++
	s.seq++
	if ap == "" {
		ap = fmt.Sprintf("ap%06d", s.seq)
	}
	if mp == "" {
		mp = fmt.Sprintf("mp%06d", s.seq)
	}
	sum := sha1.Sum([]byte(id))
	m := &meeting{id: id, name: name, attendeePW: ap, moderatorPW: mp, createTime: s.clock, meta: map[string]string{},
		intID: hex.EncodeToString(sum[:]) + "-" + strconv.FormatInt(s.clock, 10), guestPolicy: p.Get("guestPolicy"),
		voiceConf: voiceBridge(s.seq), record: p.Get("record") == "true", meetingKeepEvents: p.Get("meetingKeepEvents") == "true",
		endedURL: p.Get("meetingEndedURL")}
	for k, vs := range p {
		if rest, ok := strings.CutPrefix(k, "meta_"); ok && rest != "" {
			m.meta[strings.ToLower(rest)] = vs[0]
		}
	}
	s.meetings[id] = m
	s.writeMeeting(w, m, "", "")
	s.created(m, p)
}

func (s *Server) writeMeeting(w http.ResponseWriter, m *meeting, key, msg string) {
	rc, mpw := "returncode", "moderatorPW"
	if s.api {
		rc, mpw = "returnCode", "moderatorPw" // bbb-api's CreateMeetingResponse tags
	}
	s.writeXML(w, fmt.Sprintf("<%s>SUCCESS</%s><meetingID>%s</meetingID><internalMeetingID>%s</internalMeetingID>"+
		"<attendeePW>%s</attendeePW><%s>%s</%s><createTime>%d</createTime><messageKey>%s</messageKey><message>%s</message>",
		rc, rc, esc(m.id), m.intID, esc(m.attendeePW), mpw, esc(m.moderatorPW), mpw, m.createTime, key, esc(msg)))
}

func (s *Server) getMeetingInfo(w http.ResponseWriter, r *http.Request, p url.Values) {
	m := s.meetings[p.Get("meetingID")]
	if m == nil {
		s.fail(w, r, "notFound", "We could not find a meeting with that meeting ID")
		return
	}
	keys := make([]string, 0, len(m.meta))
	for k := range m.meta {
		keys = append(keys, k)
	}
	sort.Strings(keys)
	var meta strings.Builder
	for _, k := range keys {
		fmt.Fprintf(&meta, "<%s>%s</%s>", k, esc(m.meta[k]), k)
	}
	s.writeXML(w, fmt.Sprintf("<returncode>SUCCESS</returncode><meetingName>%s</meetingName><meetingID>%s</meetingID>"+
		"<internalMeetingID>%s</internalMeetingID><createTime>%d</createTime><running>false</running><metadata>%s</metadata>",
		esc(m.name), esc(m.id), m.intID, m.createTime, meta.String()))
}

func (s *Server) end(w http.ResponseWriter, r *http.Request, p url.Values) {
	id := p.Get("meetingID")
	m := s.meetings[id]
	// bbb-web forgets an ended meeting a moment after the end; isMeetingRunning
	// still sees it for EndPolls calls.
	if m == nil || m.ended {
		s.fail(w, r, "notFound", "We could not find a meeting with that meeting ID - perhaps the meeting is not yet running?")
		return
	}
	if s.loseEnds > 0 {
		s.loseEnds--
	} else {
		s.ended(m)
		m.ended = true
		s.callBack(m)
	}
	s.writeXML(w, "<returncode>SUCCESS</returncode><messageKey>sentEndMeetingRequest</messageKey>"+
		"<message>A request to end the meeting was sent.  Please wait a few seconds, and then use the getMeetingInfo or isMeetingRunning API calls to verify that it was ended.</message>")
}

// callBack sends the callbacks bbb-web sends once a meeting has ended, in
// the background: each URL gets recordingmarks and meetingID added to its
// query.
func (s *Server) callBack(m *meeting) {
	if s.Callbacks == nil {
		return
	}
	for _, raw := range []string{m.meta["endcallbackurl"], m.endedURL} {
		u, err := url.Parse(raw)
		if raw == "" || err != nil {
			continue
		}
		if u.RawQuery != "" {
			u.RawQuery += "&"
		}
		u.RawQuery += "recordingmarks=false&meetingID=" + url.QueryEscape(m.id)
		go func() {
			if resp, err := s.Callbacks.Get(u.String()); err == nil {
				resp.Body.Close()
			}
		}()
	}
}

func (s *Server) join(w http.ResponseWriter, r *http.Request, p url.Values) {
	m := s.meetings[p.Get("meetingID")]
	if m == nil || m.ended {
		http.Redirect(w, r, origin(r)+"/?errors=%5B%7B%22key%22%3A%22meetingForciblyEnded%22%7D%5D", http.StatusFound)
		return
	}
	s.seq++
	sess := &session{token: fmt.Sprintf("st%06d", s.seq), meetingID: m.id, fullName: p.Get("fullName"),
		jsession: fmt.Sprintf("js%06d", s.seq), userID: fmt.Sprintf("w_%012d", s.seq), authToken: fmt.Sprintf("at%06d", s.seq),
		role: strings.ToUpper(p.Get("role")), guest: p.Get("guest") == "true", guestStatus: "ALLOW", avatar: p.Get("avatarURL"),
		registeredAt: time.UnixMilli(s.clock + int64(s.seq)).UTC().Format("2006-01-02T15:04:05.000+00:00")}
	if sess.role != "MODERATOR" {
		sess.role = "VIEWER"
	}
	sess.extID = p.Get("userID")
	if sess.extID == "" {
		sess.extID = sess.userID
	}
	if sess.guest && m.guestPolicy == "ASK_MODERATOR" {
		sess.guestStatus = "WAIT"
	}
	s.sessions[sess.token] = sess
	// bbb-web runs at context path /, so its session cookie covers /graphql.
	http.SetCookie(w, &http.Cookie{Name: "JSESSIONID", Value: sess.jsession, Path: "/", Secure: true, HttpOnly: true})
	dest := origin(r) + "/html5client/join?sessionToken=" + sess.token
	if p.Get("redirect") == "false" {
		s.writeXML(w, fmt.Sprintf("<returncode>SUCCESS</returncode><messageKey/><message/><meeting_id>%s</meeting_id><user_id>%s</user_id>"+
			"<auth_token>%s</auth_token><session_token>%s</session_token><guestStatus>%s</guestStatus><url>%s</url>",
			m.intID, sess.userID, sess.authToken, sess.token, sess.guestStatus, esc(dest)))
		return
	}
	http.Redirect(w, r, dest, http.StatusFound)
}

// present says whether a user is in the meeting, connected.
func (s *Server) present(m *meeting) bool {
	for _, u := range s.sessions {
		if u.meetingID == m.id && u.inMeeting() && len(s.conns[u.token]) > 0 {
			return true
		}
	}
	return false
}

// getJoinURL builds its link the way bbb-web does: SHA-1, and a query
// string that starts with "&".
func (s *Server) getJoinURL(w http.ResponseWriter, r *http.Request, p url.Values) {
	sess := s.sessions[p.Get("sessionToken")]
	if sess == nil {
		writeJSON(w, map[string]any{"response": map[string]any{"returncode": "FAILED", "message": "Invalid session token"}})
		return
	}
	// As bbb-web's Meeting.isRunning: someone is in the meeting. A join
	// redirect alone puts nobody there.
	running := false
	for _, u := range s.sessions {
		running = running || u.meetingID == sess.meetingID && u.inMeeting()
	}
	if !running {
		writeJSON(w, map[string]any{"response": map[string]any{"returncode": "FAILED", "message": "Meeting not found", "sessionToken": p.Get("sessionToken")}})
		return
	}
	q := "&fullName=" + url.QueryEscape(p.Get("fullName")) + "&meetingID=" + url.QueryEscape(sess.meetingID) + "&role=VIEWER&redirect=true"
	sum := sha1.Sum([]byte("join" + q + s.Salt))
	link := origin(r) + "/bigbluebutton/api/join?" + q + "&checksum=" + hex.EncodeToString(sum[:])
	writeJSON(w, map[string]any{"response": map[string]any{"returncode": "SUCCESS", "message": "Join URL provided successfully.", "url": link}})
}

// fail answers with an error, as JSON when the client asks for it.
func (s *Server) fail(w http.ResponseWriter, r *http.Request, key, msg string) {
	if !s.api && strings.Contains(r.Header.Get("Accept"), "application/json") {
		writeJSON(w, map[string]any{"response": map[string]any{"returncode": "FAILED", "messageKey": key, "message": msg}})
		return
	}
	s.writeXML(w, fmt.Sprintf("<returncode>FAILED</returncode><messageKey>%s</messageKey><message>%s</message>", key, esc(msg)))
}

func (s *Server) writeXML(w http.ResponseWriter, inner string) {
	if s.api {
		// bbb-api: bbbhttp.WriteXML, always 202 (internal/meeting/*/handler.go).
		w.Header().Set("Content-Type", "application/xml")
		w.WriteHeader(http.StatusAccepted)
	} else {
		w.Header().Set("Content-Type", "text/xml;charset=utf-8")
		w.Header().Set("Cache-Control", "no-cache")
	}
	fmt.Fprint(w, "<response>"+inner+"</response>")
}

func writeJSON(w http.ResponseWriter, v any) {
	w.Header().Set("Content-Type", "application/json")
	b, _ := json.Marshal(v)
	w.Write(b)
}

func esc(s string) string { return html.EscapeString(s) }

// origin is the scheme and host the request came in on.
func origin(r *http.Request) string {
	if r.TLS != nil {
		return "https://" + r.Host
	}
	return "http://" + r.Host
}
