// Package sink stands in for the services a BigBlueButton server calls out
// to. It records the requests it gets, callbacks and fetches alike,
// answers each as its URL asks, and serves fixture files. The runner reads
// what it recorded from the same port. Run it for tests only: anyone who
// reaches its port can read what it recorded.
//
// The first segment of a path is its key:
//
//	/<key>[/...]                      recorded; 200 with no body
//	/<key>/fixtures/<path>            recorded; a file from the fixtures directory
//	/<key>/fixtures/generated/<name>  recorded; a generated file of _size bytes
//	/fixtures/<path>                  the same files, not recorded
//	/_received?key=K                  the requests recorded under K
//	/_info                            the sink's instance and last sequence number
//
// Query params that start with an underscore change the answer; see
// parseModifiers.
package sink

import (
	"bytes"
	"cmp"
	"context"
	"crypto/rand"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"mime"
	"net/http"
	"net/url"
	"os"
	"path"
	"slices"
	"strconv"
	"strings"
	"sync"
	"time"
	"unicode/utf8"
)

const (
	maxWait    = 30 * time.Second
	maxDelay   = 120 * time.Second
	maxDiscard = 256 << 20 // the most of a body read past MaxBody
	// fixturesDir is the path segment fixtures are served under, and
	// generatedDir the one under it that generated files are.
	fixturesDir  = "fixtures"
	generatedDir = "generated"
)

// Config configures a sink.
type Config struct {
	Fixtures string // the fixtures directory; "" serves none
	MaxBytes int
	MaxAge   time.Duration
}

// Server is a running sink. It reads fixtures through an os.Root, so
// nothing outside the fixtures directory can be served.
type Server struct {
	cfg      Config
	instance string
	log      *Log
	root     *os.Root

	mu     sync.Mutex
	served map[string]int // requests per path that asked for _failFirst
}

// New starts a sink.
func New(cfg Config) (*Server, error) {
	b := make([]byte, 8)
	_, _ = rand.Read(b)
	s := &Server{cfg: cfg, instance: hex.EncodeToString(b), log: NewLog(cfg.MaxBytes, cfg.MaxAge), served: map[string]int{}}
	if cfg.Fixtures != "" {
		root, err := os.OpenRoot(cfg.Fixtures)
		if err != nil {
			return nil, err
		}
		s.root = root
	}
	return s, nil
}

// Close stops serving fixtures.
func (s *Server) Close() {
	if s.root != nil {
		s.root.Close()
	}
}

// ServeHTTP records and answers a request, or serves the sink's own API.
func (s *Server) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	key, rest, _ := strings.Cut(strings.TrimPrefix(r.URL.Path, "/"), "/")
	switch {
	case key == "_info":
		writeJSON(w, Info{Instance: s.instance, Seq: s.log.Last(), Fixtures: s.cfg.Fixtures}, 0, nil)
	case key == "_received":
		v, status, err := s.received(r)
		writeJSON(w, v, status, err)
	case key == "" || strings.HasPrefix(key, "_"):
		writeJSON(w, nil, http.StatusNotFound, errors.New("no such path: requests go to /<key>/..., fixtures to /fixtures/<path>, and /_received?key=<key> lists a key's requests"))
	case key == fixturesDir:
		s.answer(w, r, fixturesDir+"/"+rest)
	default:
		s.record(r, key)
		s.answer(w, r, rest)
	}
}

// record logs a request under key, with as much of its body as the sink
// keeps.
func (s *Server) record(r *http.Request, key string) {
	body, _ := io.ReadAll(io.LimitReader(r.Body, MaxBody))
	more, _ := io.Copy(io.Discard, io.LimitReader(r.Body, maxDiscard))
	h := r.Header.Clone()
	h.Set("Host", r.Host)
	req := Request{Key: key, Method: r.Method, Path: r.URL.Path, RawQuery: r.URL.RawQuery, Header: h,
		BodySize: int64(len(body)) + more, BodyTruncated: more > 0}
	if len(body) > 0 {
		if utf8.Valid(body) {
			req.Body = string(body)
		} else {
			req.Body, req.BodyEncoding = base64.StdEncoding.EncodeToString(body), "base64"
		}
	}
	s.log.Append(req)
}

// modifiers are what a request's query asks of its answer.
type modifiers struct {
	status    int           // _status: the answer's status
	delay     time.Duration // _delay: how long to wait before answering
	redirect  string        // _redirect: a Location to send, with a 302 or _status
	failFirst int           // _failFirst: how many requests to the path answer 500 first
	ctype     string        // _type: the answer's Content-Type
	// _size, a generated file's length, is read where the file is made.
}

var knownModifiers = []string{"_status", "_delay", "_redirect", "_failFirst", "_type", "_size"}

// parseModifiers reads the query params that start with an underscore.
// One it doesn't know is an error, so a misspelt one isn't ignored.
func parseModifiers(q url.Values) (modifiers, error) {
	var m modifiers
	for name := range q {
		if strings.HasPrefix(name, "_") && !slices.Contains(knownModifiers, name) {
			return m, fmt.Errorf("unknown modifier %s (known: %s)", name, strings.Join(knownModifiers, ", "))
		}
	}
	if v := q.Get("_status"); v != "" {
		n, err := strconv.Atoi(v)
		if err != nil || n < 200 || n > 599 {
			return m, fmt.Errorf("bad _status %q: a status from 200 to 599", v)
		}
		m.status = n
	}
	if v := q.Get("_delay"); v != "" {
		d, err := time.ParseDuration(v)
		if err != nil || d < 0 || d > maxDelay {
			return m, fmt.Errorf("bad _delay %q: a duration up to %s", v, maxDelay)
		}
		m.delay = d
	}
	if v := q.Get("_failFirst"); v != "" {
		n, err := strconv.Atoi(v)
		if err != nil || n < 0 {
			return m, fmt.Errorf("bad _failFirst %q: a number of requests", v)
		}
		m.failFirst = n
	}
	m.redirect, m.ctype = q.Get("_redirect"), q.Get("_type")
	if m.redirect != "" && m.status != 0 && m.status/100 != 3 {
		return m, fmt.Errorf("_status %d isn't a redirect, which _redirect needs", m.status)
	}
	return m, nil
}

// answer answers a request as its query asks. rest is its path after the
// key: a fixture when it starts with fixtures/, else nothing.
func (s *Server) answer(w http.ResponseWriter, r *http.Request, rest string) {
	m, err := parseModifiers(r.URL.Query())
	if err != nil {
		fail(w, http.StatusBadRequest, err)
		return
	}
	if m.delay > 0 {
		select {
		case <-time.After(m.delay):
		case <-r.Context().Done():
			return
		}
	}
	if m.failFirst > 0 && s.servedBefore(r.URL.Path) < m.failFirst {
		fail(w, http.StatusInternalServerError, errors.New("failing on purpose (_failFirst)"))
		return
	}
	if m.redirect != "" {
		w.Header().Set("Location", m.redirect)
		w.WriteHeader(cmp.Or(m.status, http.StatusFound))
		return
	}
	if m.ctype != "" {
		w.Header().Set("Content-Type", m.ctype)
	}
	name, ok := strings.CutPrefix(rest, fixturesDir+"/")
	if !ok {
		if m.ctype == "" {
			w.Header().Set("Content-Type", "text/plain; charset=utf-8")
		}
		w.WriteHeader(cmp.Or(m.status, http.StatusOK))
		return
	}
	f, status, err := s.open(name, r.URL.Query().Get("_size"))
	if err != nil {
		fail(w, status, err)
		return
	}
	defer f.close()
	if m.status == 0 {
		http.ServeContent(w, r, f.name, f.modTime, f.content)
		return
	}
	if m.ctype == "" {
		w.Header().Set("Content-Type", cmp.Or(mime.TypeByExtension(path.Ext(f.name)), "application/octet-stream"))
	}
	w.WriteHeader(m.status)
	if r.Method != http.MethodHead {
		io.Copy(w, f.content)
	}
}

// servedBefore counts a request to p and returns how many came before it.
func (s *Server) servedBefore(p string) int {
	s.mu.Lock()
	defer s.mu.Unlock()
	n := s.served[p]
	s.served[p] = n + 1
	return n
}

// file is a fixture to send.
type file struct {
	content io.ReadSeeker
	name    string
	modTime time.Time
	close   func()
}

// open finds the fixture at p, or generates it, with the status to answer
// when it can't.
func (s *Server) open(p, size string) (*file, int, error) {
	if name, ok := strings.CutPrefix(p, generatedDir+"/"); ok {
		b, err := generate(name, size)
		if err != nil {
			return nil, http.StatusBadRequest, err
		}
		return &file{content: bytes.NewReader(b), name: path.Base(name), close: func() {}}, 0, nil
	}
	if s.root == nil {
		return nil, http.StatusNotFound, errors.New("this sink serves no fixtures")
	}
	notFound := fmt.Errorf("no fixture %s", p)
	f, err := s.root.Open(p)
	if err != nil {
		return nil, http.StatusNotFound, notFound
	}
	st, err := f.Stat()
	if err != nil || st.IsDir() {
		f.Close()
		return nil, http.StatusNotFound, notFound
	}
	return &file{content: f, name: st.Name(), modTime: st.ModTime(), close: func() { f.Close() }}, 0, nil
}

// received answers what the runner asks: the requests under a key after
// a sequence number, waiting up to wait for a first one.
func (s *Server) received(r *http.Request) (any, int, error) {
	q := r.URL.Query()
	key := q.Get("key")
	if key == "" {
		return nil, http.StatusBadRequest, errors.New("key is required")
	}
	if inst := q.Get("instance"); inst != "" && inst != s.instance {
		return nil, http.StatusConflict, errors.New("the sink restarted: what it recorded before is gone")
	}
	var after int64
	if a := q.Get("after"); a != "" {
		n, err := strconv.ParseInt(a, 10, 64)
		if err != nil || n < 0 {
			return nil, http.StatusBadRequest, fmt.Errorf("bad after %q", a)
		}
		after = n
	}
	var wait time.Duration
	if v := q.Get("wait"); v != "" {
		d, err := time.ParseDuration(v)
		if err != nil || d < 0 {
			return nil, http.StatusBadRequest, fmt.Errorf("bad wait %q", v)
		}
		wait = d
	}
	ctx, cancel := context.WithTimeout(r.Context(), min(wait, maxWait))
	defer cancel()
	res := Received{Instance: s.instance, Seq: after, Requests: []Request{}}
	for {
		entries, truncated := s.log.After(res.Seq)
		res.Truncated = res.Truncated || truncated
		for _, e := range entries {
			res.Seq = e.Seq
			if e.Key == key {
				res.Requests = append(res.Requests, e)
			}
		}
		if len(res.Requests) > 0 || ctx.Err() != nil {
			return res, 0, nil
		}
		s.log.Wait(ctx, res.Seq)
	}
}

// fail answers a recorded request the sink can't answer as asked.
func fail(w http.ResponseWriter, status int, err error) {
	http.Error(w, "sink: "+err.Error(), status)
}

func writeJSON(w http.ResponseWriter, v any, status int, err error) {
	w.Header().Set("Content-Type", "application/json")
	if err != nil {
		w.WriteHeader(status)
		v = map[string]string{"error": err.Error()}
	}
	enc := json.NewEncoder(w)
	enc.SetEscapeHTML(false)
	enc.Encode(v)
}
