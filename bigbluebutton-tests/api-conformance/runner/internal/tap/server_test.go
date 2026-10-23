package tap

import (
	"context"
	"errors"
	"fmt"
	"net"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"reflect"
	"slices"
	"strings"
	"sync"
	"testing"
	"time"

	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/fakeredis"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/resp"
)

type world struct {
	redis   *fakeredis.Server
	tap     *Server
	client  *Client
	dataDir string
}

func startWorld(t *testing.T) *world {
	t.Helper()
	r, err := fakeredis.Start()
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(r.Close)
	dir := t.TempDir()
	if err := os.MkdirAll(filepath.Join(dir, "recording/status/recorded"), 0o755); err != nil {
		t.Fatal(err)
	}
	s, err := Start(Config{Redis: resp.Options{Addr: r.Addr()}, DataDir: dir, Watch: []string{"recording/status"},
		RedisKeys: []string{"meeting:*"}, MaxBytes: 1 << 20, MaxAge: time.Hour})
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(s.Close)
	srv := httptest.NewServer(s)
	t.Cleanup(srv.Close)
	return &world{redis: r, tap: s, client: NewClient(srv.URL), dataDir: dir}
}

func ctx(t *testing.T) context.Context {
	c, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	t.Cleanup(cancel)
	return c
}

func msg(name, meetingID string) string {
	return fmt.Sprintf(`{"envelope":{"name":%q,"routing":{"meetingId":%q}},"core":{"header":{"name":%q,"meetingId":%q},"body":{}}}`, name, meetingID, name, meetingID)
}

func TestMarkWaitsForTheSubscription(t *testing.T) {
	s, err := Start(Config{Redis: resp.Options{Addr: "127.0.0.1:1"}, MaxBytes: 1 << 20, MaxAge: time.Hour})
	if err != nil {
		t.Fatal(err)
	}
	defer s.Close()
	srv := httptest.NewServer(s)
	defer srv.Close()
	c := NewClient(srv.URL)
	short, cancel := context.WithTimeout(context.Background(), 300*time.Millisecond)
	defer cancel()
	var te *Error
	if _, err := c.Mark(short); err == nil || (!errors.As(err, &te) && !errors.Is(err, context.DeadlineExceeded)) {
		t.Errorf("a mark without redis: %v", err)
	}
	info, err := c.Info(ctx(t))
	if err != nil || info.Subscribed || info.RedisError == "" {
		t.Errorf("info: %+v %v", info, err)
	}
}

func TestBus(t *testing.T) {
	w := startWorld(t)
	m, err := w.client.Mark(ctx(t))
	if err != nil {
		t.Fatal(err)
	}
	w.redis.Publish("from-akka-apps-redis-channel", msg("MeetingCreatedEvtMsg", "m1"))
	w.redis.Publish("from-akka-apps-redis-channel", msg("MeetingCreatedEvtMsg", "m2"))
	w.redis.Publish("to-akka-apps-redis-channel", msg("CheckAlivePingSysMsg", ""))
	w.redis.Publish("not-followed", msg("MeetingCreatedEvtMsg", "m1"))

	r, err := w.client.Bus(ctx(t), BusQuery{Mark: m, After: m.Seq, Name: "MeetingCreatedEvtMsg", MeetingID: "m1", Wait: 3 * time.Second})
	if err != nil || len(r.Messages) != 1 || r.Messages[0].Channel != "from-akka-apps-redis-channel" || !strings.Contains(string(r.Messages[0].Message), `"m1"`) {
		t.Fatalf("%+v %v", r, err)
	}
	// Continuing from the answer's seq, a later message wakes the wait.
	go func() {
		time.Sleep(100 * time.Millisecond)
		w.redis.Publish("from-akka-apps-redis-channel", msg("MeetingEndedEvtMsg", "m1"))
	}()
	start := time.Now()
	r2, err := w.client.Bus(ctx(t), BusQuery{Mark: m, After: r.Seq, MeetingID: "m1", Wait: 5 * time.Second})
	if err != nil || len(r2.Messages) != 1 || !strings.Contains(string(r2.Messages[0].Message), "MeetingEndedEvtMsg") || time.Since(start) > 3*time.Second {
		t.Fatalf("%+v %v after %s", r2, err, time.Since(start))
	}
	// Nothing new: the wait runs out.
	r3, err := w.client.Bus(ctx(t), BusQuery{Mark: m, After: r2.Seq, MeetingID: "m1", Wait: 100 * time.Millisecond})
	if err != nil || len(r3.Messages) != 0 {
		t.Fatalf("%+v %v", r3, err)
	}
	// A channel the tap doesn't follow, and another instance's mark.
	var te *Error
	if _, err := w.client.Bus(ctx(t), BusQuery{Mark: m, Channel: "not-followed"}); !errors.As(err, &te) || te.Status != http.StatusBadRequest {
		t.Errorf("an unknown channel: %v", err)
	}
	if _, err := w.client.Bus(ctx(t), BusQuery{Mark: Mark{Instance: "other"}}); !errors.As(err, &te) || te.Status != http.StatusConflict {
		t.Errorf("another instance: %v", err)
	}
}

// A lost subscription is a gap: the tap may have missed messages.
func TestBusGap(t *testing.T) {
	w := startWorld(t)
	m, err := w.client.Mark(ctx(t))
	if err != nil {
		t.Fatal(err)
	}
	w.redis.Kill()
	for deadline := time.Now().Add(3 * time.Second); time.Now().Before(deadline); time.Sleep(10 * time.Millisecond) {
		if i, err := w.client.Info(ctx(t)); err == nil && i.Seq > m.Seq {
			break // the tap logged the gap
		}
	}
	m2, err := w.client.Mark(ctx(t)) // waits for the new subscription
	if err != nil {
		t.Fatal(err)
	}
	w.redis.Publish("from-akka-apps-redis-channel", msg("MeetingEndedEvtMsg", "m1"))
	r, err := w.client.Bus(ctx(t), BusQuery{Mark: m, After: m.Seq, MeetingID: "m1", Wait: 3 * time.Second})
	if err != nil || !r.Gap || len(r.Messages) != 1 {
		t.Errorf("across the reconnect: %+v %v", r, err)
	}
	r, err = w.client.Bus(ctx(t), BusQuery{Mark: m2, After: m2.Seq, MeetingID: "m1", Wait: time.Second})
	if err != nil || r.Gap {
		t.Errorf("after the reconnect: %+v %v", r, err)
	}
}

func TestRedis(t *testing.T) {
	w := startWorld(t)
	w.redis.HSet("meeting:info:m1", "meetingName", "Room", "test", "1")
	w.redis.SAdd("meeting:breakout:rooms:m1", "b2", "b1")
	w.redis.RPush("meeting:m1:recordings", "1", "2")
	w.redis.Set("meeting:s", "x")
	w.redis.Expire("meeting:s", time.Hour)
	for key, want := range map[string]RedisValue{
		"meeting:info:m1":           {Key: "meeting:info:m1", Type: "hash", TTL: -1, Value: map[string]any{"meetingName": "Room", "test": "1"}},
		"meeting:breakout:rooms:m1": {Key: "meeting:breakout:rooms:m1", Type: "set", TTL: -1, Value: []any{"b1", "b2"}},
		"meeting:m1:recordings":     {Key: "meeting:m1:recordings", Type: "list", TTL: -1, Value: []any{"1", "2"}},
		"meeting:s":                 {Key: "meeting:s", Type: "string", TTL: 3600, Value: "x"},
		"meeting:none":              {Key: "meeting:none", Type: "none", TTL: -2},
	} {
		got, err := w.client.Redis(ctx(t), key)
		if err != nil || !reflect.DeepEqual(*got, want) {
			t.Errorf("%s: %+v %v", key, got, err)
		}
	}
	var te *Error
	if _, err := w.client.Redis(ctx(t), "livekit:rooms"); !errors.As(err, &te) || te.Status != http.StatusForbidden {
		t.Errorf("a key outside the allowlist: %v", err)
	}
	for _, c := range w.redis.Commands() {
		if !slices.Contains([]string{"SUBSCRIBE", "PING", "TYPE", "TTL", "GET", "HGETALL", "SMEMBERS", "LLEN", "LRANGE"}, c) {
			t.Errorf("the tap sent %s", c)
		}
	}
}

func TestFiles(t *testing.T) {
	w := startWorld(t)
	write := func(rel, contents string) {
		t.Helper()
		p := filepath.Join(w.dataDir, rel)
		if err := os.MkdirAll(filepath.Dir(p), 0o755); err != nil {
			t.Fatal(err)
		}
		if err := os.WriteFile(p, []byte(contents), 0o644); err != nil {
			t.Fatal(err)
		}
	}
	m, err := w.client.Mark(ctx(t))
	if err != nil {
		t.Fatal(err)
	}
	write("learning-dashboard/m1/tok/learning_dashboard_data.json", `{"intId":"m1"}`)
	write("big.bin", strings.Repeat("\xff", MaxFile+10))
	r, err := w.client.FS(ctx(t), m, "learning-dashboard/*/*/learning_dashboard_data.json")
	if err != nil || len(r.Files) != 1 || r.Files[0].Contents != `{"intId":"m1"}` {
		t.Errorf("%+v %v", r, err)
	}
	r, err = w.client.FS(ctx(t), m, "big.bin")
	if err != nil || len(r.Files) != 1 || !r.Files[0].Truncated || r.Files[0].Encoding != "base64" {
		t.Errorf("a big binary file: %+v %v", r.Files, err)
	}
	// Nothing outside the data directory, even through a symlink.
	outside := t.TempDir()
	os.WriteFile(filepath.Join(outside, "secret"), []byte("x"), 0o644)
	os.Symlink(filepath.Join(outside, "secret"), filepath.Join(w.dataDir, "link"))
	if r, err := w.client.FS(ctx(t), m, "link"); err != nil || len(r.Files) != 0 {
		t.Errorf("an escaping symlink: %+v %v", r, err)
	}
	var te *Error
	for _, bad := range []string{"../x", "/etc/passwd", "a/../../x"} {
		if _, err := w.client.FS(ctx(t), m, bad); !errors.As(err, &te) || te.Status != http.StatusBadRequest {
			t.Errorf("%s: %v", bad, err)
		}
	}
	if !WatchSupported {
		return
	}
	// A marker deleted as soon as it appears, as rap-starter does.
	write("recording/status/recorded/m1.done", "")
	os.Remove(filepath.Join(w.dataDir, "recording/status/recorded/m1.done"))
	deadline := time.Now().Add(3 * time.Second)
	for {
		r, err = w.client.FS(ctx(t), m, "recording/status/recorded/m1.done")
		if err != nil || len(r.Appeared) > 0 || time.Now().After(deadline) {
			break
		}
		time.Sleep(20 * time.Millisecond)
	}
	if err != nil || len(r.Files) != 0 || len(r.Appeared) != 1 || !r.Watched {
		t.Errorf("a deleted marker: %+v %v", r, err)
	}
}

// The tap answers only requests sent to an IP address, localhost or a
// host name it was given.
func TestHosts(t *testing.T) {
	s, err := Start(Config{Redis: resp.Options{Addr: "127.0.0.1:1"}, Hosts: []string{"tap"}, MaxBytes: 1 << 20, MaxAge: time.Hour})
	if err != nil {
		t.Fatal(err)
	}
	defer s.Close()
	srv := httptest.NewServer(s)
	defer srv.Close()
	for host, want := range map[string]int{
		"127.0.0.1:8099": http.StatusOK, "[::1]:8099": http.StatusOK, "localhost:8099": http.StatusOK,
		"LOCALHOST.": http.StatusOK, "tap:8099": http.StatusOK, "10.0.0.5": http.StatusOK,
		"bbb.example.com:8099": http.StatusMisdirectedRequest, "tap.example.com": http.StatusMisdirectedRequest,
	} {
		req, _ := http.NewRequest(http.MethodGet, srv.URL+"/info", nil)
		req.Host = host
		res, err := http.DefaultClient.Do(req)
		if err != nil {
			t.Fatal(err)
		}
		res.Body.Close()
		if res.StatusCode != want {
			t.Errorf("Host %s: HTTP %d", host, res.StatusCode)
		}
	}
}

// One /fs answer reads a bounded number of files.
func TestFilesLimit(t *testing.T) {
	w := startWorld(t)
	for i := range maxFiles + 1 {
		if err := os.WriteFile(filepath.Join(w.dataDir, fmt.Sprintf("f%d", i)), []byte("x"), 0o644); err != nil {
			t.Fatal(err)
		}
	}
	m, err := w.client.Mark(ctx(t))
	if err != nil {
		t.Fatal(err)
	}
	var te *Error
	if _, err := w.client.FS(ctx(t), m, "f*"); !errors.As(err, &te) || te.Status != http.StatusBadRequest || !strings.Contains(te.Msg, "narrow it") {
		t.Errorf("too many files: %v", err)
	}
	if r, err := w.client.FS(ctx(t), m, "f1?"); err != nil || len(r.Files) != 10 || r.Watched {
		t.Errorf("ten files outside the watched directories: %+v %v", r, err)
	}
}

// Close returns even while the tap waits on a redis that accepts the
// connection and never answers.
func TestCloseWhileSubscribing(t *testing.T) {
	ln, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		t.Fatal(err)
	}
	defer ln.Close()
	var mu sync.Mutex
	var conns []net.Conn
	defer func() {
		mu.Lock()
		defer mu.Unlock()
		for _, c := range conns {
			c.Close()
		}
	}()
	go func() {
		for {
			c, err := ln.Accept()
			if err != nil {
				return
			}
			mu.Lock()
			conns = append(conns, c)
			mu.Unlock()
		}
	}()
	for i := range 30 {
		s, err := Start(Config{Redis: resp.Options{Addr: ln.Addr().String()}, MaxBytes: 1 << 20, MaxAge: time.Hour})
		if err != nil {
			t.Fatal(err)
		}
		time.Sleep(time.Duration(i%5) * time.Millisecond)
		done := make(chan struct{})
		go func() { s.Close(); close(done) }()
		select {
		case <-done:
		case <-time.After(3 * time.Second):
			t.Fatalf("Close hung, try %d", i)
		}
	}
}
