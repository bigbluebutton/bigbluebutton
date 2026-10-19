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
)

// Server is the fake. Use it as an http.Handler.
type Server struct {
	Salt string
	// EndPolls is how many isMeetingRunning calls an ended meeting still
	// answers with true, so cases have something to wait for.
	EndPolls int

	mu       sync.Mutex
	clock    int64
	meetings map[string]*meeting
	sessions map[string]*session
	seq      int
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
	ended                   bool
	endPolls                int
}

type session struct {
	token, meetingID, fullName string
}

// New returns a fake with the given salt. Create times start at a fixed
// instant.
func New(salt string) *Server {
	return &Server{Salt: salt, EndPolls: 2, clock: 1760000000000,
		meetings: map[string]*meeting{}, sessions: map[string]*session{}}
}

// unsigned calls are authenticated by session token, or not at all.
var unsigned = map[string]bool{"stuns": true, "signOut": true, "getJoinUrl": true, "learningDashboard": true}

func (s *Server) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	w.Header()["Date"] = nil // keep responses byte-for-byte repeatable
	raw, _ := io.ReadAll(r.Body)
	body := string(raw)
	s.mu.Lock()
	s.Requests = append(s.Requests, Seen{Method: r.Method, Path: r.URL.Path, RawQuery: r.URL.RawQuery,
		ContentType: r.Header.Get("Content-Type"), Header: r.Header.Clone(), Chunked: len(r.TransferEncoding) > 0 && r.TransferEncoding[0] == "chunked", Body: body})
	s.mu.Unlock()

	path := strings.TrimSuffix(r.URL.Path, "/")
	if path == "/bigbluebutton/api" {
		writeXML(w, "<returncode>SUCCESS</returncode><version>2.0</version><apiVersion>2.0</apiVersion><bbbVersion></bbbVersion>")
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
		writeXML(w, "<returncode>SUCCESS</returncode><meetings/><messageKey>noMeetings</messageKey><message>no meetings were found on this server</message>")
	case "isMeetingRunning":
		id := params.Get("meetingID")
		m := s.meetings[id]
		if m != nil && m.ended {
			if m.endPolls++; m.endPolls > s.EndPolls {
				delete(s.meetings, id)
				m = nil
			}
		}
		writeXML(w, fmt.Sprintf("<returncode>SUCCESS</returncode><running>%t</running>", m != nil))
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
		writeXML(w, "<returncode>SUCCESS</returncode><messageKey/><message>Presentation is being uploaded</message>")
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
		intID: hex.EncodeToString(sum[:]) + "-" + strconv.FormatInt(s.clock, 10)}
	for k, vs := range p {
		if rest, ok := strings.CutPrefix(k, "meta_"); ok && rest != "" {
			m.meta[strings.ToLower(rest)] = vs[0]
		}
	}
	s.meetings[id] = m
	s.writeMeeting(w, m, "", "")
}

func (s *Server) writeMeeting(w http.ResponseWriter, m *meeting, key, msg string) {
	writeXML(w, fmt.Sprintf("<returncode>SUCCESS</returncode><meetingID>%s</meetingID><internalMeetingID>%s</internalMeetingID>"+
		"<attendeePW>%s</attendeePW><moderatorPW>%s</moderatorPW><createTime>%d</createTime><messageKey>%s</messageKey><message>%s</message>",
		esc(m.id), m.intID, esc(m.attendeePW), esc(m.moderatorPW), m.createTime, key, esc(msg)))
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
	writeXML(w, fmt.Sprintf("<returncode>SUCCESS</returncode><meetingName>%s</meetingName><meetingID>%s</meetingID>"+
		"<internalMeetingID>%s</internalMeetingID><createTime>%d</createTime><running>false</running><metadata>%s</metadata>",
		esc(m.name), esc(m.id), m.intID, m.createTime, meta.String()))
}

func (s *Server) end(w http.ResponseWriter, r *http.Request, p url.Values) {
	id := p.Get("meetingID")
	m := s.meetings[id]
	if m == nil {
		s.fail(w, r, "notFound", "We could not find a meeting with that meeting ID - perhaps the meeting is not yet running?")
		return
	}
	m.ended = true
	writeXML(w, "<returncode>SUCCESS</returncode><messageKey>sentEndMeetingRequest</messageKey>"+
		"<message>A request to end the meeting was sent.  Please wait a few seconds, and then use the getMeetingInfo or isMeetingRunning API calls to verify that it was ended.</message>")
}

func (s *Server) join(w http.ResponseWriter, r *http.Request, p url.Values) {
	m := s.meetings[p.Get("meetingID")]
	if m == nil || m.ended {
		http.Redirect(w, r, origin(r)+"/?errors=%5B%7B%22key%22%3A%22meetingForciblyEnded%22%7D%5D", http.StatusFound)
		return
	}
	s.seq++
	sess := &session{token: fmt.Sprintf("st%06d", s.seq), meetingID: m.id, fullName: p.Get("fullName")}
	s.sessions[sess.token] = sess
	http.SetCookie(w, &http.Cookie{Name: "JSESSIONID", Value: fmt.Sprintf("js%06d", s.seq), Path: "/bigbluebutton", Secure: true, HttpOnly: true})
	if p.Get("redirect") == "false" {
		writeXML(w, fmt.Sprintf("<returncode>SUCCESS</returncode><meeting_id>%s</meeting_id><session_token>%s</session_token>", m.intID, sess.token))
		return
	}
	http.Redirect(w, r, origin(r)+"/html5client/join?sessionToken="+sess.token, http.StatusFound)
}

// getJoinURL builds its link the way bbb-web does: SHA-1, and a query
// string that starts with "&".
func (s *Server) getJoinURL(w http.ResponseWriter, r *http.Request, p url.Values) {
	sess := s.sessions[p.Get("sessionToken")]
	if sess == nil {
		writeJSON(w, map[string]any{"response": map[string]any{"returncode": "FAILED", "message": "Invalid session token"}})
		return
	}
	q := "&fullName=" + url.QueryEscape(p.Get("fullName")) + "&meetingID=" + url.QueryEscape(sess.meetingID) + "&role=VIEWER&redirect=true"
	sum := sha1.Sum([]byte("join" + q + s.Salt))
	link := origin(r) + "/bigbluebutton/api/join?" + q + "&checksum=" + hex.EncodeToString(sum[:])
	writeJSON(w, map[string]any{"response": map[string]any{"returncode": "SUCCESS", "message": "Join URL provided successfully.", "url": link}})
}

// fail answers with an error, as JSON when the client asks for it.
func (s *Server) fail(w http.ResponseWriter, r *http.Request, key, msg string) {
	if strings.Contains(r.Header.Get("Accept"), "application/json") {
		writeJSON(w, map[string]any{"response": map[string]any{"returncode": "FAILED", "messageKey": key, "message": msg}})
		return
	}
	writeXML(w, fmt.Sprintf("<returncode>FAILED</returncode><messageKey>%s</messageKey><message>%s</message>", key, esc(msg)))
}

func writeXML(w http.ResponseWriter, inner string) {
	w.Header().Set("Content-Type", "text/xml;charset=utf-8")
	w.Header().Set("Cache-Control", "no-cache")
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
