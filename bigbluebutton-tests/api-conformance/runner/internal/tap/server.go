package tap

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"io/fs"
	"net"
	"net/http"
	"os"
	"path"
	"path/filepath"
	"sort"
	"strconv"
	"strings"
	"sync"
	"time"
	"unicode/utf8"

	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/resp"
)

// DefaultChannels are the bus channels a tap follows unless told
// otherwise: what akka-apps and bbb-web send each other and publish.
var DefaultChannels = []string{"to-akka-apps-redis-channel", "from-akka-apps-redis-channel",
	"from-akka-apps-pres-redis-channel", "from-bbb-web-redis-channel"}

const (
	maxWait    = 30 * time.Second
	maxList    = 10000
	maxFiles   = 100      // the most files one /fs answer reads
	maxFSBytes = 16 << 20 // and the most it sends of them
	pingEvery  = 30 * time.Second
	silenceMax = 90 * time.Second
	// dialTimeout bounds connecting to redis and its confirming the
	// subscriptions.
	dialTimeout = 10 * time.Second
)

// Config configures a tap.
type Config struct {
	Redis     resp.Options
	Channels  []string
	DataDir   string   // "" serves no files
	Watch     []string // directories under DataDir to watch for new files
	RedisKeys []string // globs of the keys it may read
	Hosts     []string // host names it answers to, besides IP addresses and localhost
	MaxBytes  int
	MaxAge    time.Duration
}

// Server is a running tap. It only reads: the redis commands it sends are
// SUBSCRIBE, PING, TYPE, TTL, GET, HGETALL, SMEMBERS, LLEN and LRANGE, and
// files are read through an os.Root, so nothing outside the data
// directory can be reached.
type Server struct {
	cfg      Config
	instance string
	log      *Log
	root     *os.Root
	watcher  *Watcher
	watchErr error

	mu         sync.Mutex
	subscribed bool
	redisErr   string
	sub        *resp.Conn

	rmu   sync.Mutex // the connection for reading keys
	rconn *resp.Conn

	ctx    context.Context
	cancel context.CancelFunc
	wg     sync.WaitGroup
}

// Start starts a tap: it opens the data directory, starts watching it, and
// subscribes to the channels in the background.
func Start(cfg Config) (*Server, error) {
	if len(cfg.Channels) == 0 {
		cfg.Channels = DefaultChannels
	}
	b := make([]byte, 8)
	_, _ = rand.Read(b)
	s := &Server{cfg: cfg, instance: hex.EncodeToString(b), log: NewLog(cfg.MaxBytes, cfg.MaxAge)}
	if cfg.DataDir != "" {
		root, err := os.OpenRoot(cfg.DataDir)
		if err != nil {
			return nil, err
		}
		s.root = root
		s.watcher, s.watchErr = Watch(cfg.DataDir, cfg.Watch,
			func(p, op string) { s.log.Append(Entry{Kind: "file", Path: p, Op: op}) },
			func(why string) { s.log.Append(Entry{Kind: "gap", Of: "files", Why: why}) })
	}
	s.ctx, s.cancel = context.WithCancel(context.Background())
	s.wg.Add(1)
	go s.follow()
	return s, nil
}

// Close stops the tap.
func (s *Server) Close() {
	s.cancel()
	s.mu.Lock()
	if s.sub != nil {
		s.sub.Close()
	}
	s.mu.Unlock()
	s.wg.Wait()
	if s.watcher != nil {
		s.watcher.Close()
	}
	s.rmu.Lock()
	if s.rconn != nil {
		s.rconn.Close()
	}
	s.rmu.Unlock()
	if s.root != nil {
		s.root.Close()
	}
}

// follow keeps a subscription to the channels, reconnecting as needed.
// What it may have missed while disconnected is logged as a gap.
func (s *Server) follow() {
	defer s.wg.Done()
	backoff := 500 * time.Millisecond
	for s.ctx.Err() == nil {
		err := s.listen()
		if s.ctx.Err() != nil {
			return
		}
		s.mu.Lock()
		wasSubscribed := s.subscribed
		s.subscribed, s.redisErr = false, err.Error()
		s.mu.Unlock()
		if wasSubscribed {
			s.log.Append(Entry{Kind: "gap", Of: "bus", Why: "lost the redis subscription: " + err.Error()})
			backoff = 500 * time.Millisecond
		}
		select {
		case <-time.After(backoff):
		case <-s.ctx.Done():
			return
		}
		backoff = min(backoff*2, 5*time.Second)
	}
}

// listen subscribes once and logs messages until the connection ends.
func (s *Server) listen() error {
	ctx, cancel := context.WithTimeout(s.ctx, dialTimeout)
	c, err := resp.Dial(ctx, s.cfg.Redis)
	cancel()
	if err != nil {
		return err
	}
	defer c.Close()
	// Close cancels, then closes s.sub: checking under the same lock means
	// a connection made while it ran is either closed by it or never used.
	s.mu.Lock()
	if err := s.ctx.Err(); err != nil {
		s.mu.Unlock()
		return err
	}
	s.sub = c
	s.mu.Unlock()
	c.SetReadDeadline(time.Now().Add(dialTimeout)) // a server that never confirms
	if err := c.Subscribe(s.cfg.Channels...); err != nil {
		return err
	}
	s.mu.Lock()
	s.subscribed, s.redisErr = true, ""
	s.mu.Unlock()
	done := make(chan struct{})
	defer close(done)
	go func() { // a silent socket may be dead: PING keeps an answer coming
		t := time.NewTicker(pingEvery)
		defer t.Stop()
		for {
			select {
			case <-t.C:
				_ = c.Send("PING")
			case <-done:
				return
			}
		}
	}()
	for {
		c.SetReadDeadline(time.Now().Add(silenceMax))
		m, err := c.Receive()
		if err != nil {
			return err
		}
		if m.Pong {
			continue
		}
		name, ids := index([]byte(m.Payload))
		s.log.Append(Entry{Kind: "bus", Channel: m.Channel, Name: name, IDs: ids, Raw: []byte(m.Payload)})
	}
}

// ServeHTTP serves the API.
func (s *Server) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	var v any
	var status int
	var err error
	switch {
	case !s.answersTo(r.Host):
		status, err = http.StatusMisdirectedRequest, fmt.Errorf("the tap doesn't answer to %q: start it with --hosts naming it", r.Host)
	case r.URL.Path == "/info":
		v = s.info()
	case r.URL.Path == "/mark":
		v, status, err = s.mark()
	case r.URL.Path == "/bus":
		v, status, err = s.bus(r)
	case r.URL.Path == "/redis":
		v, status, err = s.redis(r)
	case r.URL.Path == "/fs":
		v, status, err = s.files(r)
	default:
		status, err = http.StatusNotFound, errors.New("no such endpoint: try /info, /mark, /bus, /redis or /fs")
	}
	w.Header().Set("Content-Type", "application/json")
	if err != nil {
		w.WriteHeader(status)
		v = map[string]string{"error": err.Error()}
	}
	enc := json.NewEncoder(w)
	enc.SetEscapeHTML(false)
	enc.Encode(v)
}

// answersTo says whether a request for host is for the tap: one sent to
// an IP address, localhost or a name it was given. A page that points
// another name at the tap's address gets nothing.
func (s *Server) answersTo(host string) bool {
	h, _, err := net.SplitHostPort(host)
	if err != nil {
		h = host
	}
	h = strings.TrimSuffix(strings.Trim(h, "[]"), ".")
	if net.ParseIP(h) != nil || strings.EqualFold(h, "localhost") {
		return true
	}
	for _, name := range s.cfg.Hosts {
		if strings.EqualFold(h, name) {
			return true
		}
	}
	return false
}

func (s *Server) info() Info {
	s.mu.Lock()
	defer s.mu.Unlock()
	i := Info{Instance: s.instance, Channels: s.cfg.Channels, Subscribed: s.subscribed, Redis: s.cfg.Redis.Addr,
		RedisError: s.redisErr, DataDir: s.cfg.DataDir, Watch: "none", Seq: s.log.Last()}
	if s.watcher != nil {
		i.Watch, i.Watching, i.WatchDirs = "inotify", s.watcher.Tops(), len(s.watcher.Watching())
	}
	if s.watchErr != nil {
		i.WatchError = s.watchErr.Error()
	} else if s.watcher != nil {
		i.WatchError = strings.Join(s.watcher.Skipped(), "; ")
	}
	return i
}

func (s *Server) mark() (any, int, error) {
	s.mu.Lock()
	ok, why := s.subscribed, s.redisErr
	s.mu.Unlock()
	if !ok {
		return nil, http.StatusServiceUnavailable, fmt.Errorf("not subscribed to the bus yet (%s)", why)
	}
	return Mark{Instance: s.instance, Seq: s.log.Last()}, 0, nil
}

// after reads the instance and after parameters a query is scoped by.
func (s *Server) after(r *http.Request) (int64, int, error) {
	q := r.URL.Query()
	if inst := q.Get("instance"); inst != "" && inst != s.instance {
		return 0, http.StatusConflict, errors.New("the tap restarted since the mark: its sequence numbers started again")
	}
	if q.Get("after") == "" {
		return 0, 0, nil
	}
	n, err := strconv.ParseInt(q.Get("after"), 10, 64)
	if err != nil || n < 0 {
		return 0, http.StatusBadRequest, fmt.Errorf("bad after %q", q.Get("after"))
	}
	return n, 0, nil
}

func (s *Server) bus(r *http.Request) (any, int, error) {
	after, status, err := s.after(r)
	if err != nil {
		return nil, status, err
	}
	q := r.URL.Query()
	name, meetingID, channel := q.Get("name"), q.Get("meetingId"), q.Get("channel")
	if channel != "" && !contains(s.cfg.Channels, channel) {
		return nil, http.StatusBadRequest, fmt.Errorf("the tap doesn't follow %s; it follows %s", channel, strings.Join(s.cfg.Channels, ", "))
	}
	wait := time.Duration(0)
	if w := q.Get("wait"); w != "" {
		if wait, err = time.ParseDuration(w); err != nil {
			return nil, http.StatusBadRequest, fmt.Errorf("bad wait %q", w)
		}
	}
	limit := 1000
	if l := q.Get("limit"); l != "" {
		if limit, err = strconv.Atoi(l); err != nil || limit < 1 {
			return nil, http.StatusBadRequest, fmt.Errorf("bad limit %q", l)
		}
	}
	ctx, cancel := context.WithTimeout(r.Context(), min(wait, maxWait))
	defer cancel()
	res := BusResult{Seq: after, Messages: []BusMessage{}}
	for {
		entries, truncated := s.log.After(res.Seq)
		res.Truncated = res.Truncated || truncated
		for _, e := range entries {
			res.Seq = e.Seq
			switch {
			case e.Kind == "gap" && e.Of == "bus":
				res.Gap = true
			case e.Kind == "bus" && (name == "" || e.Name == name) &&
				(meetingID == "" || contains(e.IDs, meetingID)) && (channel == "" || e.Channel == channel):
				msg := json.RawMessage(e.Raw)
				if !json.Valid(e.Raw) {
					msg, _ = json.Marshal(string(e.Raw))
				}
				res.Messages = append(res.Messages, BusMessage{Seq: e.Seq, At: e.At, Channel: e.Channel, Message: msg})
			}
			if len(res.Messages) == limit {
				return res, 0, nil
			}
		}
		if len(res.Messages) > 0 || ctx.Err() != nil {
			return res, 0, nil
		}
		s.log.Wait(ctx, res.Seq)
	}
}

func (s *Server) redis(r *http.Request) (any, int, error) {
	key := r.URL.Query().Get("key")
	allowed := false
	for _, g := range s.cfg.RedisKeys {
		if ok, _ := path.Match(g, key); ok {
			allowed = true
		}
	}
	if !allowed {
		return nil, http.StatusForbidden, fmt.Errorf("the tap only reads keys matching %s", strings.Join(s.cfg.RedisKeys, ", "))
	}
	v, err := s.readKey(r.Context(), key)
	if err != nil {
		v, err = s.readKey(r.Context(), key) // once more, on a fresh connection or a changed type
	}
	if err != nil {
		return nil, http.StatusServiceUnavailable, err
	}
	return v, 0, nil
}

func (s *Server) readKey(ctx context.Context, key string) (v *RedisValue, err error) {
	s.rmu.Lock()
	defer s.rmu.Unlock()
	if s.rconn == nil {
		dctx, cancel := context.WithTimeout(ctx, 5*time.Second)
		s.rconn, err = resp.Dial(dctx, s.cfg.Redis)
		cancel()
		if err != nil {
			s.rconn = nil
			return nil, err
		}
	}
	defer func() {
		var re *resp.Error
		if err != nil && !errors.As(err, &re) { // the connection may be broken
			s.rconn.Close()
			s.rconn = nil
		}
	}()
	c := s.rconn
	c.SetReadDeadline(time.Now().Add(10 * time.Second))
	t, err := c.Do("TYPE", key)
	if err != nil {
		return nil, err
	}
	ttl, err := c.Do("TTL", key)
	if err != nil {
		return nil, err
	}
	v = &RedisValue{Key: key, Type: t.Str, TTL: ttl.Int}
	switch t.Str {
	case "none":
		v.TTL = -2
	case "string":
		g, err := c.Do("GET", key)
		if err != nil {
			return nil, err
		}
		v.Value = g.Str
	case "hash":
		h, err := c.Do("HGETALL", key)
		if err != nil {
			return nil, err
		}
		m := map[string]string{}
		for i := 0; i+1 < len(h.Array); i += 2 {
			m[h.Array[i].Str] = h.Array[i+1].Str
		}
		v.Value = m
	case "set":
		m, err := c.Do("SMEMBERS", key)
		if err != nil {
			return nil, err
		}
		members := m.Strings()
		sort.Strings(members)
		v.Value = members
	case "list":
		n, err := c.Do("LLEN", key)
		if err != nil {
			return nil, err
		}
		l, err := c.Do("LRANGE", key, "0", strconv.Itoa(maxList-1))
		if err != nil {
			return nil, err
		}
		v.Value, v.Truncated = l.Strings(), n.Int > maxList
	}
	return v, nil
}

func (s *Server) files(r *http.Request) (any, int, error) {
	if s.root == nil {
		return nil, http.StatusServiceUnavailable, errors.New("the tap serves no files: start it with --data-dir")
	}
	after, status, err := s.after(r)
	if err != nil {
		return nil, status, err
	}
	pattern := r.URL.Query().Get("path")
	if pattern == "" || path.IsAbs(pattern) || strings.Contains("/"+pattern+"/", "/../") {
		return nil, http.StatusBadRequest, fmt.Errorf("bad path %q: give a glob relative to the data directory", pattern)
	}
	res := FSResult{Seq: s.log.Last(), Files: []File{}, Appeared: []Appeared{}}
	res.Watched, res.WatchError = s.watched(pattern)
	matches, err := fs.Glob(s.root.FS(), pattern)
	if err != nil {
		return nil, http.StatusBadRequest, err
	}
	if len(matches) > maxFiles {
		return nil, http.StatusBadRequest, fmt.Errorf("%s matches %d files, more than the %d the tap reads at once: narrow it", pattern, len(matches), maxFiles)
	}
	size := 0
	for _, m := range matches {
		if f, ok := s.readFile(m); ok {
			if size += len(f.Contents); size > maxFSBytes {
				return nil, http.StatusBadRequest, fmt.Errorf("the files %s matches hold more than the %d MiB the tap sends at once: narrow it", pattern, maxFSBytes>>20)
			}
			res.Files = append(res.Files, f)
		}
	}
	entries, truncated := s.log.After(after)
	res.Truncated = truncated
	for _, e := range entries {
		if e.Seq > res.Seq {
			break
		}
		if e.Kind == "gap" && e.Of == "files" {
			res.Gap = true
		}
		if ok, _ := path.Match(pattern, e.Path); ok && e.Kind == "file" && e.Op == "created" {
			res.Appeared = append(res.Appeared, Appeared{Path: e.Path, Seq: e.Seq, At: e.At})
		}
	}
	return res, 0, nil
}

// watched says whether the tap sees the files that come and go where
// pattern can match and, when it was asked to watch there but can't, why.
func (s *Server) watched(pattern string) (bool, string) {
	if s.watcher != nil {
		return s.watcher.Covers(pattern)
	}
	for _, d := range s.cfg.Watch {
		if underDir(pattern, path.Clean(filepath.ToSlash(d))) {
			if s.watchErr != nil {
				return false, "can't watch files: " + s.watchErr.Error()
			}
			return false, "the tap watches no files"
		}
	}
	return false, ""
}

// underDir says whether every path glob matches is under dir.
func underDir(glob, dir string) bool {
	return dir == "." || strings.HasPrefix(glob, dir+"/")
}

// readFile reads a regular file, up to MaxFile.
func (s *Server) readFile(name string) (File, bool) {
	f, err := s.root.Open(name)
	if err != nil {
		return File{}, false
	}
	defer f.Close()
	st, err := f.Stat()
	if err != nil || !st.Mode().IsRegular() {
		return File{}, false
	}
	data, err := io.ReadAll(io.LimitReader(f, MaxFile+1))
	if err != nil {
		return File{}, false
	}
	out := File{Path: name, Size: st.Size(), Truncated: len(data) > MaxFile}
	if out.Truncated {
		data = data[:MaxFile]
	}
	if utf8.Valid(data) {
		out.Contents = string(data)
	} else {
		out.Contents, out.Encoding = base64.StdEncoding.EncodeToString(data), "base64"
	}
	return out, true
}
