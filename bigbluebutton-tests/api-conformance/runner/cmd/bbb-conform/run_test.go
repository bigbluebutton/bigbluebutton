package main

import (
	"bytes"
	"context"
	"encoding/pem"
	"flag"
	"fmt"
	"net"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"testing"
	"time"

	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/expectations"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/fakebbb"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/fakeredis"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/resp"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/sink"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/tap"
)

var update = flag.Bool("update", false, "rewrite the golden reports in testdata/golden")

const fakeSalt = "fake-salt-6f1d0c9a"

// startFake serves the fake over TLS and writes its certificate to a CA
// file, so the run goes through the target's caFile like a real one. With
// withSink, the target has a sink the fake calls back.
func startFake(t *testing.T, caps string, withSink bool) string {
	t.Helper()
	fake := fakebbb.New(fakeSalt)
	tapURL := startTap(t, fake)
	sinkLine := ""
	if withSink {
		sinkLine = startSink(t, fake)
	}
	srv := httptest.NewTLSServer(fake)
	t.Cleanup(srv.Close)
	dir := t.TempDir()
	ca := filepath.Join(dir, "ca.pem")
	if err := os.WriteFile(ca, pem.EncodeToMemory(&pem.Block{Type: "CERTIFICATE", Bytes: srv.Certificate().Raw}), 0o644); err != nil {
		t.Fatal(err)
	}
	tf := filepath.Join(dir, "fake.yaml")
	body := fmt.Sprintf("name: fake\nbaseUrl: %s\nsalt: %s\ntls: {caFile: ca.pem}\ncapabilities: [%s]\nfixtureUrl: https://fixtures.test\ntapUrl: %s\n%s",
		srv.URL, fakeSalt, caps, tapURL, sinkLine)
	if err := os.WriteFile(tf, []byte(body), 0o644); err != nil {
		t.Fatal(err)
	}
	return tf
}

// startTap gives the fake a redis and a data directory, as a real server
// has, and starts a tap next to it. It returns the tap's URL.
func startTap(t *testing.T, fake *fakebbb.Server) string {
	t.Helper()
	r, err := fakeredis.Start()
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(r.Close)
	fake.Redis, fake.DataDir = r, t.TempDir()
	for _, d := range []string{"recording/status/recorded", "recording/status/ended"} {
		if err := os.MkdirAll(filepath.Join(fake.DataDir, d), 0o755); err != nil {
			t.Fatal(err)
		}
	}
	s, err := tap.Start(tap.Config{Redis: resp.Options{Addr: r.Addr()}, DataDir: fake.DataDir, Watch: []string{"recording/status"},
		RedisKeys: []string{"meeting:*"}, MaxBytes: 16 << 20, MaxAge: time.Hour})
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(s.Close)
	srv := httptest.NewServer(s)
	t.Cleanup(srv.Close)
	return srv.URL
}

// startSink starts a sink the fake sends its end callbacks to, and returns
// the target's lines for it. The fake reaches it as http://sink.test, as a
// server reaches a sink by name, so the URLs cases send, and their
// checksums, don't change with its port; the runner reads it where it
// listens.
func startSink(t *testing.T, fake *fakebbb.Server) string {
	t.Helper()
	s, err := sink.New(sink.Config{MaxBytes: 16 << 20, MaxAge: time.Hour})
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(s.Close)
	srv := httptest.NewServer(s)
	t.Cleanup(srv.Close)
	tr := srv.Client().Transport.(*http.Transport).Clone()
	tr.DialContext = func(ctx context.Context, network, _ string) (net.Conn, error) {
		return (&net.Dialer{}).DialContext(ctx, network, srv.Listener.Addr().String())
	}
	fake.Callbacks = &http.Client{Transport: tr}
	return "sinkUrl: http://sink.test\nsinkReadUrl: " + srv.URL + "\n"
}

var normalizers = []struct {
	re   *regexp.Regexp
	repl string
}{
	{regexp.MustCompile(`127\.0\.0\.1:\d{2,5}`), "fake.test"},
	{regexp.MustCompile(`"duration_ms": \d+`), `"duration_ms": 0`},
	{regexp.MustCompile(`"started": "[^"]+"`), `"started": "2026-01-01T00:00:00Z"`},
	{regexp.MustCompile(`time="[0-9.]+"`), `time="0.000"`},
	{regexp.MustCompile(`\((\d+(\.\d+)?(ns|µs|ms|s))+\)`), "(0s)"},
	// Polling against a deadline depends on timing; TestEventuallyAttempts
	// checks the count where it is deterministic.
	{regexp.MustCompile(`"attempts": \d+`), `"attempts": 0`},
	{regexp.MustCompile(`\(\d+ attempts\)`), "(N attempts)"},
}

func scrub(s string) string {
	// The transport-error case dials 127.0.0.1:1 on purpose; keep it.
	s = strings.ReplaceAll(s, "127.0.0.1:1/", "PORT-ONE/")
	for _, n := range normalizers {
		s = n.re.ReplaceAllString(s, n.repl)
	}
	return strings.ReplaceAll(s, "PORT-ONE/", "127.0.0.1:1/")
}

func TestRunGolden(t *testing.T) {
	newUID = func(i int) string { return fmt.Sprintf("uid-%03d", i) }
	t.Cleanup(func() { newUID = nil })
	for _, set := range []struct {
		name, cases string
		code        int
		extra       []string
	}{
		{"cases", "cases", exitOK, nil},
		{"failing", "failing", exitFailed, nil},
		{"smoke", "smoke", exitOK, nil},
		{"failing-expected", "failing", exitFailed, []string{"--expect", "../../testdata/expectations/failing.yaml"}},
	} {
		t.Run(set.name, func(t *testing.T) {
			// The failing set shows a case skipped for want of a sink.
			tf := startFake(t, "akka, presence", !strings.HasPrefix(set.name, "failing"))
			out := t.TempDir()
			var stdout, stderr bytes.Buffer
			// One worker: the fake's counters (create times, tokens) then
			// advance in case order, so reports repeat exactly.
			args := append([]string{"run", "--target", tf, "--cases", "../../testdata/" + set.cases, "--fixtures", "../../testdata/fixtures",
				"--parallel", "1", "-v", "--junit", filepath.Join(out, "r.xml"), "--json", filepath.Join(out, "r.json")}, set.extra...)
			code := run(args, &stdout, &stderr)
			if code != set.code {
				t.Fatalf("exit %d, want %d\nstdout:\n%s\nstderr:\n%s", code, set.code, stdout.String(), stderr.String())
			}
			outputs := map[string]string{"txt": stdout.String()}
			for _, ext := range []string{"xml", "json"} {
				data, err := os.ReadFile(filepath.Join(out, "r."+ext))
				if err != nil {
					t.Fatal(err)
				}
				outputs[ext] = string(data)
			}
			for ext, got := range outputs {
				if strings.Contains(got, fakeSalt) {
					t.Errorf("the %s report contains the salt", ext)
				}
				golden := filepath.Join("testdata", "golden", set.name+"."+ext)
				got = scrub(got)
				if *update {
					if err := os.MkdirAll(filepath.Dir(golden), 0o755); err != nil {
						t.Fatal(err)
					}
					if err := os.WriteFile(golden, []byte(got), 0o644); err != nil {
						t.Fatal(err)
					}
					continue
				}
				want, err := os.ReadFile(golden)
				if err != nil {
					t.Fatalf("%v (run go test -update to create it)", err)
				}
				if got != string(want) {
					t.Errorf("%s differs from %s; run go test ./cmd/bbb-conform -update and review the diff", ext, golden)
				}
			}
		})
	}
}

// Parallel runs must give the same outcomes as the golden serial run.
func TestRunParallel(t *testing.T) {
	tf := startFake(t, "akka, presence", true)
	var stdout, stderr bytes.Buffer
	code := run([]string{"run", "--target", tf, "--cases", "../../testdata/cases", "--fixtures", "../../testdata/fixtures", "--parallel", "8"}, &stdout, &stderr)
	if code != exitOK {
		t.Fatalf("exit %d\n%s%s", code, stdout.String(), stderr.String())
	}
	if !strings.Contains(stdout.String(), "25 case(s): 24 passed, 0 failed, 0 errors, 1 skipped") {
		t.Errorf("summary:\n%s", stdout.String())
	}
}

func TestRunFilters(t *testing.T) {
	tf := startFake(t, "akka, presence", true)
	tests := []struct {
		args    []string
		summary string
	}{
		{[]string{"--tags", "ci"}, "14 case(s)"},
		{[]string{"--tags", "ci", "--exclude-tags", "ci"}, "0 case(s)"},
		{[]string{"--id", "getMeetings.checksum.*,version.*"}, "6 case(s)"},
	}
	for _, tt := range tests {
		var stdout, stderr bytes.Buffer
		args := append([]string{"run", "--target", tf, "--cases", "../../testdata/cases"}, tt.args...)
		if code := run(args, &stdout, &stderr); code != exitOK {
			t.Errorf("%v: exit %d\n%s", tt.args, code, stderr.String())
		}
		if !strings.Contains(stdout.String(), tt.summary) {
			t.Errorf("%v: summary %q not in\n%s", tt.args, tt.summary, stdout.String())
		}
	}
}

func TestRunUsage(t *testing.T) {
	tf := startFake(t, "akka, presence", true)
	for _, args := range [][]string{
		{"run"},
		{"run", "--target", "missing.yaml"},
		{"run", "--target", tf, "--cases", "../../internal/spec/testdata/invalid"},
		{"run", "--target", tf, "--id", "["},
		{"run", "--target", tf, "--expect", "../../../expectations/bbb-web.yaml"}, // for another target
		{"run", "--target", tf, "--expect", "missing.yaml"},
	} {
		var stdout, stderr bytes.Buffer
		if code := run(args, &stdout, &stderr); code != exitUsage {
			t.Errorf("%v: exit %d, want %d\n%s", args, code, exitUsage, stderr.String())
		}
	}
}

func TestCommittedExpectations(t *testing.T) {
	for _, name := range []string{"bbb-web", "bbb-api"} {
		f, err := expectations.Load("../../../expectations/" + name + ".yaml")
		if err != nil {
			t.Fatal(err)
		}
		if f.Target != name {
			t.Errorf("%s.yaml is for target %q", name, f.Target)
		}
	}
}
