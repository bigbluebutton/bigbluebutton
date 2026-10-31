package sink

import (
	"context"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"
)

type world struct {
	sink   *Server
	srv    *httptest.Server
	client *Client
	dir    string
}

// startWorld starts a sink over TLS, serving a fixtures directory with
// plugins/manifest.json in it, and a file outside it.
func startWorld(t *testing.T) *world {
	t.Helper()
	top := t.TempDir()
	dir := filepath.Join(top, "fixtures")
	if err := os.MkdirAll(filepath.Join(dir, "plugins"), 0o755); err != nil {
		t.Fatal(err)
	}
	write(t, filepath.Join(dir, "plugins", "manifest.json"), `{"name":"p"}`)
	write(t, filepath.Join(top, "secret.txt"), "outside")
	s, err := New(Config{Fixtures: dir, MaxBytes: 1 << 20, MaxAge: time.Hour})
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(s.Close)
	srv := httptest.NewTLSServer(s)
	t.Cleanup(srv.Close)
	tr := srv.Client().Transport.(*http.Transport)
	return &world{sink: s, srv: srv, client: NewClient(srv.URL, tr.TLSClientConfig), dir: dir}
}

func write(t *testing.T, path, contents string) {
	t.Helper()
	if err := os.WriteFile(path, []byte(contents), 0o644); err != nil {
		t.Fatal(err)
	}
}

func ctx(t *testing.T) context.Context {
	c, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	t.Cleanup(cancel)
	return c
}

// send makes a request to the sink, without following redirects, and
// returns the answer with its body read.
func (w *world) send(t *testing.T, method, path, body string) (*http.Response, string) {
	t.Helper()
	req, err := http.NewRequest(method, w.srv.URL+path, strings.NewReader(body))
	if err != nil {
		t.Fatal(err)
	}
	c := w.srv.Client()
	c.CheckRedirect = func(*http.Request, []*http.Request) error { return http.ErrUseLastResponse }
	resp, err := c.Do(req)
	if err != nil {
		t.Fatal(err)
	}
	defer resp.Body.Close()
	b, err := io.ReadAll(resp.Body)
	if err != nil {
		t.Fatal(err)
	}
	return resp, string(b)
}

func TestRecordsAndAnswers(t *testing.T) {
	w := startWorld(t)
	resp, body := w.send(t, "GET", "/k1/end?meetingID=m1&recordingmarks=false", "")
	if resp.StatusCode != 200 || body != "" {
		t.Errorf("default answer: %d %q", resp.StatusCode, body)
	}
	w.send(t, "POST", "/k2", "signed_parameters=x")
	w.send(t, "PUT", "/k1/again", "\xff\xfe")
	r, err := w.client.Received(ctx(t), Query{Key: "k1"})
	if err != nil {
		t.Fatal(err)
	}
	if len(r.Requests) != 2 || r.Seq != 3 || r.Instance == "" {
		t.Fatalf("k1: %+v", r)
	}
	first, second := r.Requests[0], r.Requests[1]
	if first.Method != "GET" || first.Path != "/k1/end" || first.RawQuery != "meetingID=m1&recordingmarks=false" ||
		first.Header.Get("Host") == "" || first.Body != "" || first.BodySize != 0 {
		t.Errorf("first: %+v", first)
	}
	if second.Body != "//4=" || second.BodyEncoding != "base64" || second.BodySize != 2 {
		t.Errorf("a binary body: %+v", second)
	}
	r, err = w.client.Received(ctx(t), Query{Key: "k2", Instance: r.Instance})
	if err != nil || len(r.Requests) != 1 || r.Requests[0].Body != "signed_parameters=x" {
		t.Errorf("k2: %+v %v", r, err)
	}
	// Continuing after the last answer finds nothing new.
	r, err = w.client.Received(ctx(t), Query{Key: "k1", After: 3})
	if err != nil || len(r.Requests) != 0 || r.Seq != 3 {
		t.Errorf("after 3: %+v %v", r, err)
	}
}

func TestLongBodyIsCut(t *testing.T) {
	w := startWorld(t)
	w.send(t, "POST", "/k", strings.Repeat("a", MaxBody+10))
	r, err := w.client.Received(ctx(t), Query{Key: "k"})
	if err != nil || len(r.Requests) != 1 {
		t.Fatalf("%+v %v", r, err)
	}
	if q := r.Requests[0]; len(q.Body) != MaxBody || q.BodySize != MaxBody+10 || !q.BodyTruncated {
		t.Errorf("body %d bytes, size %d, truncated %v", len(q.Body), q.BodySize, q.BodyTruncated)
	}
}

func TestReceivedWaits(t *testing.T) {
	w := startWorld(t)
	go func() {
		time.Sleep(200 * time.Millisecond)
		w.send(t, "GET", "/other", "")
		w.send(t, "GET", "/late", "")
	}()
	start := time.Now()
	r, err := w.client.Received(ctx(t), Query{Key: "late", Wait: 5 * time.Second})
	if err != nil || len(r.Requests) != 1 {
		t.Fatalf("%+v %v", r, err)
	}
	if took := time.Since(start); took > 4*time.Second {
		t.Errorf("waited %v for a request that came after 200ms", took)
	}
	start = time.Now()
	r, err = w.client.Received(ctx(t), Query{Key: "never", Wait: 300 * time.Millisecond})
	if err != nil || len(r.Requests) != 0 || r.Seq != 2 {
		t.Errorf("never: %+v %v", r, err)
	}
	if took := time.Since(start); took < 250*time.Millisecond {
		t.Errorf("gave up after %v of a 300ms wait", took)
	}
}

func TestReceivedErrors(t *testing.T) {
	w := startWorld(t)
	var se *Error
	if _, err := w.client.Received(ctx(t), Query{Key: "k", Instance: "restarted"}); !errors.As(err, &se) || se.Status != http.StatusConflict {
		t.Errorf("another instance: %v", err)
	}
	if _, err := w.client.Received(ctx(t), Query{}); !errors.As(err, &se) || se.Status != http.StatusBadRequest {
		t.Errorf("no key: %v", err)
	}
	for _, p := range []string{"/", "/_nothing", "/_received?key=k&after=-1", "/_received?key=k&wait=soon", "/_received?key=_x",
		"/_received?key=fixtures", "/_received?key=a%2Fb"} {
		resp, body := w.send(t, "GET", p, "")
		if resp.StatusCode/100 != 4 || !strings.Contains(body, `"error"`) {
			t.Errorf("%s: %d %s", p, resp.StatusCode, body)
		}
	}
	info, err := w.client.Info(ctx(t))
	if err != nil || info.Instance == "" || info.Seq != 0 || info.Fixtures != w.dir {
		t.Errorf("info: %+v %v", info, err)
	}
}

func TestModifiers(t *testing.T) {
	w := startWorld(t)
	tests := []struct {
		path     string
		status   int
		location string
		ctype    string
		inBody   string
	}{
		{"/k/a?_status=503", 503, "", "text/plain; charset=utf-8", ""},
		{"/k/a?_redirect=https://example.test/x", 302, "https://example.test/x", "", ""},
		{"/k/a?_redirect=https://example.test/y&_status=307", 307, "https://example.test/y", "", ""},
		{"/k/a?_type=application/json", 200, "", "application/json", ""},
		{"/k/a?_status=307", 307, "", "", ""},
		{"/k/a?_status=99", 400, "", "", "bad _status"},
		{"/k/a?_status=200&_redirect=https://example.test", 400, "", "", "isn't a redirect"},
		{"/k/a?_delay=1h", 400, "", "", "bad _delay"},
		{"/k/a?_failFirst=x", 400, "", "", "bad _failFirst"},
		{"/k/a?_stauts=500", 400, "", "", "unknown modifier _stauts"},
		{"/k/a?_size=10", 400, "", "", "_size is for generated files"},
		{"/k/generated/a.txt?_size=10", 400, "", "", "_size is for generated files"},
		{"/k/fixtures/plugins/manifest.json?_size=10", 400, "", "", "_size is for generated files"},
		{"/fixtures/plugins/manifest.json?_status=201", 201, "", "application/json", `{"name":"p"}`},
	}
	for _, tt := range tests {
		resp, body := w.send(t, "GET", tt.path, "")
		if resp.StatusCode != tt.status || resp.Header.Get("Location") != tt.location ||
			(tt.ctype != "" && resp.Header.Get("Content-Type") != tt.ctype) || !strings.Contains(body, tt.inBody) {
			t.Errorf("%s: %d, Location %q, Content-Type %q, body %q", tt.path, resp.StatusCode,
				resp.Header.Get("Location"), resp.Header.Get("Content-Type"), body)
		}
	}
	// _failFirst counts what the sink recorded, so it needs a key.
	if resp, body := w.send(t, "GET", "/fixtures/plugins/manifest.json?_failFirst=1", ""); resp.StatusCode != 400 || !strings.Contains(body, "needs a key") {
		t.Errorf("_failFirst without a key: %d %q", resp.StatusCode, body)
	}
	// Every request to a key is recorded, those it refused included.
	r, err := w.client.Received(ctx(t), Query{Key: "k"})
	if err != nil || len(r.Requests) != len(tests)-1 {
		t.Errorf("recorded %d of %d: %v", len(r.Requests), len(tests)-1, err)
	}
}

func TestFailFirst(t *testing.T) {
	w := startWorld(t)
	var got []int
	for range 4 {
		resp, _ := w.send(t, "GET", "/k/cb?_failFirst=2", "")
		got = append(got, resp.StatusCode)
	}
	// Another path counts on its own.
	resp, _ := w.send(t, "GET", "/k/other?_failFirst=1", "")
	got = append(got, resp.StatusCode)
	if want := "[500 500 200 200 500]"; fmt.Sprint(got) != want {
		t.Errorf("statuses %v, want %s", got, want)
	}
}

func TestDelay(t *testing.T) {
	w := startWorld(t)
	start := time.Now()
	if resp, _ := w.send(t, "GET", "/k?_delay=300ms", ""); resp.StatusCode != 200 {
		t.Errorf("status %d", resp.StatusCode)
	}
	if took := time.Since(start); took < 300*time.Millisecond {
		t.Errorf("answered after %v", took)
	}
	// The request is recorded on arrival, before the delay: a client that
	// gives up still counts as having called.
	req, _ := http.NewRequest("GET", w.srv.URL+"/slow?_delay=1m", nil)
	short, cancel := context.WithTimeout(context.Background(), 200*time.Millisecond)
	defer cancel()
	if _, err := w.srv.Client().Do(req.WithContext(short)); err == nil {
		t.Error("a 1m delay answered within 200ms")
	}
	r, err := w.client.Received(ctx(t), Query{Key: "slow", Wait: 2 * time.Second})
	if err != nil || len(r.Requests) != 1 {
		t.Errorf("the abandoned request: %+v %v", r, err)
	}
}

func TestFixtures(t *testing.T) {
	w := startWorld(t)
	if err := os.Symlink(filepath.Join(filepath.Dir(w.dir), "secret.txt"), filepath.Join(w.dir, "link.txt")); err != nil {
		t.Fatal(err)
	}
	for _, p := range []string{"/fixtures/plugins/manifest.json", "/k/fixtures/plugins/manifest.json"} {
		resp, body := w.send(t, "GET", p, "")
		if resp.StatusCode != 200 || body != `{"name":"p"}` || resp.Header.Get("Content-Type") != "application/json" {
			t.Errorf("%s: %d %q %q", p, resp.StatusCode, resp.Header.Get("Content-Type"), body)
		}
	}
	for _, p := range []string{
		"/fixtures/plugins/missing.json",
		"/fixtures/plugins",
		"/fixtures/../secret.txt",
		"/k/fixtures/plugins/../../secret.txt",
		"/k/fixtures//etc/passwd",
		"/k/fixtures/link.txt",
		"/k/fixtures/",
	} {
		resp, body := w.send(t, "GET", p, "")
		if resp.StatusCode != 404 || strings.Contains(body, "outside") || strings.Contains(body, "root:") {
			t.Errorf("%s: %d %q", p, resp.StatusCode, body)
		}
	}
	// Only keyed requests are recorded: the log holds k's and nothing else.
	r, err := w.client.Received(ctx(t), Query{Key: "k"})
	if err != nil || len(r.Requests) != 5 || r.Seq != 5 {
		t.Errorf("k: %d requests, seq %d, %v", len(r.Requests), r.Seq, err)
	}
}

func TestNoFixtures(t *testing.T) {
	s, err := New(Config{MaxBytes: 1 << 20, MaxAge: time.Hour})
	if err != nil {
		t.Fatal(err)
	}
	srv := httptest.NewServer(s)
	defer srv.Close()
	resp, err := http.Get(srv.URL + "/fixtures/x.pdf")
	if err != nil {
		t.Fatal(err)
	}
	resp.Body.Close()
	if resp.StatusCode != 404 {
		t.Errorf("status %d", resp.StatusCode)
	}
	if _, err := New(Config{Fixtures: filepath.Join(t.TempDir(), "missing")}); err == nil {
		t.Error("a missing fixtures directory was accepted")
	}
}

func TestGeneratedOverHTTP(t *testing.T) {
	w := startWorld(t)
	resp, body := w.send(t, "GET", "/k/fixtures/generated/big.pdf?_size=5000", "")
	if resp.StatusCode != 200 || len(body) != 5000 || resp.Header.Get("Content-Type") != "application/pdf" {
		t.Errorf("pdf: %d, %d bytes, %q", resp.StatusCode, len(body), resp.Header.Get("Content-Type"))
	}
	resp, body = w.send(t, "HEAD", "/fixtures/generated/a.json?_size=100", "")
	if resp.StatusCode != 200 || body != "" || resp.ContentLength != 100 {
		t.Errorf("HEAD json: %d %d %q", resp.StatusCode, resp.ContentLength, body)
	}
	for _, p := range []string{"/fixtures/generated/a.pdf", "/fixtures/generated/a.pdf?_size=10", "/fixtures/generated/a.txt?_size=-1"} {
		if resp, body := w.send(t, "GET", p, ""); resp.StatusCode != 400 {
			t.Errorf("%s: %d %q", p, resp.StatusCode, body)
		}
	}
}

func TestCheckKey(t *testing.T) {
	for _, key := range []string{"bbbc-0123", "uid-1-meta", "a.b"} {
		if err := CheckKey(key); err != nil {
			t.Errorf("%q: %v", key, err)
		}
	}
	for _, key := range []string{"", "a/b", "fixtures", "_received", "_x"} {
		if err := CheckKey(key); err == nil {
			t.Errorf("%q was accepted", key)
		}
	}
}
