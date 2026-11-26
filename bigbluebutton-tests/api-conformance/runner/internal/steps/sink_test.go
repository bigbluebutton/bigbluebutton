package steps

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"sync/atomic"
	"testing"
	"time"

	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/fakebbb"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/report"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/sink"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/spec"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/target"
)

// sinkWorld is a fake server that sends its end callbacks to a sink.
type sinkWorld struct {
	fake    *fakebbb.Server
	sinkURL string
	runs    int
}

func startSink(t *testing.T, handler func(*sink.Server) http.Handler) *sinkWorld {
	t.Helper()
	s, err := sink.New(sink.Config{MaxBytes: 1 << 20, MaxAge: time.Hour})
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(s.Close)
	var h http.Handler = s
	if handler != nil {
		h = handler(s)
	}
	srv := httptest.NewServer(h)
	t.Cleanup(srv.Close)
	fake := fakebbb.New(salt)
	fake.Callbacks = srv.Client()
	return &sinkWorld{fake: fake, sinkURL: srv.URL}
}

func (w *sinkWorld) target(baseURL string) *target.Target {
	return &target.Target{Name: "fake", BaseURL: baseURL, APIPrefix: "/bigbluebutton/api/", Salt: salt, DefaultSign: "sha1",
		SinkURL: w.sinkURL, SinkReadURL: w.sinkURL, Capabilities: []string{"callbacks"}}
}

func (w *sinkWorld) run(t *testing.T, src string) *report.CaseResult {
	t.Helper()
	srv := httptest.NewServer(w.fake)
	defer srv.Close()
	cases, probs := spec.LoadBytes("case.yaml", []byte(header(src)), spec.Options{})
	if len(probs) > 0 {
		t.Fatalf("problems: %v", probs)
	}
	r, err := NewRunner(w.target(srv.URL), "", "test")
	if err != nil {
		t.Fatal(err)
	}
	w.runs++
	return r.RunCase(context.Background(), cases[0], fmt.Sprintf("uid-%d", w.runs))
}

// endWithCallbacks creates a meeting with both end callbacks, under keys
// ${uid}-meta and ${uid}-param, and ends it; checks follow.
const endWithCallbacks = `steps:
  - call: create
    params: {meetingID: "${uid}", name: Callback, meta_endCallbackUrl: "${sinkUrl}/${uid}-meta/end?from=meta", meetingEndedURL: "${sinkUrl}/${uid}-param"}
    expect: {returncode: SUCCESS}
  - call: end
    params: {meetingID: "${uid}"}
    expect: {returncode: SUCCESS}
`

func logSteps(t *testing.T, res *report.CaseResult) {
	t.Helper()
	for _, s := range res.Steps {
		t.Logf("step %d %s %s: %s %s", s.Index+1, s.Kind, s.Status, s.Message, s.Document)
	}
}

func TestSinkSteps(t *testing.T) {
	w := startSink(t, nil)
	res := w.run(t, endWithCallbacks+`  - sink: {key: "${uid}-meta", within: 3s}
    expect:
      method: GET
      path: /${uid}-meta/end
      query: {from: meta, meetingID: "${uid}", recordingmarks: "false"}
      headers: {user-agent: {regex: "^Go-http-client/"}}
    capture: {marks: $.query.recordingmarks}
  - sink: {key: "${uid}-param", within: 300ms}
    expect: {count: 1, query: {recordingmarks: "${marks}"}}
  - sink: {key: "${uid}-meta", within: 300ms}
    expect: {count: 0, method: POST}
  - sink: {key: "${uid}-param", within: 300ms}
    expect: {absent: true, method: POST}
`)
	if res.Status != report.Pass {
		logSteps(t, res)
		t.Fatalf("%s: %s", res.Status, res.Reason)
	}
	got := res.Steps[2]
	if got.Captured["marks"] != "false" || got.Request.Method != "SINK" || !strings.HasSuffix(got.Request.URL, "/_received?key=uid-1-meta") {
		t.Errorf("step 3: captured %v, request %+v", got.Captured, got.Request)
	}
	// The document is what is recorded: no headers.
	if want := `{"method":"GET","path":"/uid-1-meta/end","query":{"from":"meta","meetingID":"uid-1","recordingmarks":"false"}}`; got.Document != want {
		t.Errorf("document %s\nwant %s", got.Document, want)
	}
}

// A request the sink couldn't answer as its URL asked (here, a misspelt
// modifier) makes the step that looks at its key ERROR: the server got an
// error from the sink, not the answer the case wanted. A body filter
// narrows what counts.
func TestSinkStepSinkError(t *testing.T) {
	w := startSink(t, nil)
	res := w.run(t, `steps:
  - call: create
    params: {meetingID: "${uid}", name: Callback, meta_endCallbackUrl: "${sinkUrl}/${uid}/end?_stauts=500"}
    expect: {returncode: SUCCESS}
  - call: end
    params: {meetingID: "${uid}"}
    expect: {returncode: SUCCESS}
  - sink: {key: "${uid}", within: 3s}
    expect: {method: GET}
`)
	if res.Status != report.Error || !strings.Contains(res.Steps[2].Message, "unknown modifier _stauts") {
		logSteps(t, res)
		t.Errorf("%s: %s", res.Status, res.Reason)
	}
	res = w.run(t, endWithCallbacks+`  - sink: {key: "${uid}-meta", within: 3s}
    expect: {method: GET, body: {absent: true}}
  - sink: {key: "${uid}-meta", within: 300ms}
    expect: {absent: true, body: {contains: x}}
`)
	if res.Status != report.Pass {
		logSteps(t, res)
		t.Errorf("body filter: %s: %s", res.Status, res.Reason)
	}
}

// ${sinkHttpUrl} is the sink's plain-HTTP listener: a case that uses it is
// skipped on a target that doesn't name one, and fails at once with a sink
// that serves no plain HTTP, where a check that nothing came would pass
// whatever the server did.
func TestSinkHTTPURL(t *testing.T) {
	cases, probs := spec.LoadBytes("case.yaml", []byte(header(`steps:
  - call: create
    params: {meetingID: "${uid}", name: Callback, meta_endCallbackUrl: "${sinkHttpUrl}/${uid}/end"}
  - call: end
    params: {meetingID: "${uid}"}
  - sink: {key: "${uid}", within: 3s}
    expect: {path: "/${uid}/end"}
`)), spec.Options{})
	if len(probs) > 0 {
		t.Fatalf("problems: %v", probs)
	}
	if got := strings.Join(cases[0].Uses, ","); got != "sinkHttpUrl" {
		t.Errorf("uses %q", got)
	}
	for _, tt := range []struct {
		name     string
		httpURL  bool   // the target names the sink's URL as sinkHttpUrl
		httpAddr string // where the sink says it serves plain HTTP; "self" for its own listener
		status   report.Status
		reason   string
	}{
		{"unset", false, "self", report.Skip, "not-configured: sinkHttpUrl"},
		{"no listener", true, "", report.Error, "serves no plain HTTP"},
		{"another port", true, "127.0.0.1:1", report.Error, "serves plain HTTP on 127.0.0.1:1"},
		{"listener", true, "self", report.Pass, ""},
	} {
		sinkSrv := httptest.NewUnstartedServer(nil)
		addr := tt.httpAddr
		if addr == "self" {
			addr = sinkSrv.Listener.Addr().String()
		}
		s, err := sink.New(sink.Config{MaxBytes: 1 << 20, MaxAge: time.Hour, HTTPAddr: addr})
		if err != nil {
			t.Fatal(err)
		}
		sinkSrv.Config.Handler = s
		sinkSrv.Start()
		fake := fakebbb.New(salt)
		fake.Callbacks = sinkSrv.Client()
		srv := httptest.NewServer(fake)
		w := &sinkWorld{fake: fake, sinkURL: sinkSrv.URL}
		tg := w.target(srv.URL)
		if tt.httpURL {
			tg.SinkHTTPURL = sinkSrv.URL
		}
		r, err := NewRunner(tg, "", "test")
		if err != nil {
			t.Fatal(err)
		}
		res := r.RunAll(context.Background(), cases, 1).Cases[0]
		if res.Status != tt.status || !strings.Contains(res.Reason, tt.reason) {
			logSteps(t, res)
			t.Errorf("%s: %s %q, want %s %q", tt.name, res.Status, res.Reason, tt.status, tt.reason)
		}
		srv.Close()
		sinkSrv.Close()
		s.Close()
	}
}

func TestSinkStepFailures(t *testing.T) {
	w := startSink(t, nil)
	for _, tt := range []struct {
		step, actual string
	}{
		{`  - sink: {key: "${uid}-meta", within: 2s}
    expect: {query: {recordingmarks: "true"}}
`, "1 request(s), none passing the filters"},
		{`  - sink: {key: "${uid}-nothing", within: 300ms}
`, "none"},
		{`  - sink: {key: "${uid}-param", within: 2s}
    expect: {absent: true}
`, "GET /uid-"},
		{`  - sink: {key: "${uid}-param", within: 300ms}
    expect: {count: 2}
`, "1"},
	} {
		res := w.run(t, endWithCallbacks+tt.step)
		last := res.Steps[len(res.Steps)-1]
		if res.Status != report.Fail || len(last.Assertions) == 0 || !strings.Contains(last.Assertions[0].Actual, tt.actual) {
			logSteps(t, res)
			t.Errorf("%q: %s, checks %+v", tt.step, res.Status, last.Assertions)
		}
	}
}

// A sink that restarts during a case has lost what it recorded: its sink
// steps are errors, not misses.
func TestSinkRestarted(t *testing.T) {
	var infos atomic.Int32
	other, err := sink.New(sink.Config{MaxBytes: 1 << 20, MaxAge: time.Hour})
	if err != nil {
		t.Fatal(err)
	}
	w := startSink(t, func(s *sink.Server) http.Handler {
		return http.HandlerFunc(func(rw http.ResponseWriter, r *http.Request) {
			if r.URL.Path == "/_info" && infos.Add(1) == 1 {
				s.ServeHTTP(rw, r)
				return
			}
			other.ServeHTTP(rw, r)
		})
	})
	res := w.run(t, endWithCallbacks+`  - sink: {key: "${uid}-meta", within: 2s}
`)
	last := res.Steps[len(res.Steps)-1]
	if res.Status != report.Error || !strings.Contains(last.Message, "the sink restarted") {
		logSteps(t, res)
		t.Errorf("%s: %s", res.Status, last.Message)
	}
}

// A sink that doesn't answer before the run makes its cases errors at
// once; cases without sink steps still run.
func TestSinkDown(t *testing.T) {
	w := startSink(t, nil)
	srv := httptest.NewServer(w.fake)
	defer srv.Close()
	tg := w.target(srv.URL)
	tg.SinkReadURL = "http://127.0.0.1:1"
	r, err := NewRunner(tg, "", "test")
	if err != nil {
		t.Fatal(err)
	}
	var cases []*spec.Case
	for _, src := range []string{
		"id: end.b.sink\ntitle: t\nendpoint: end\nclass: contract\nsteps: [{sink: {key: \"${uid}\", within: 1s}}]\n",
		"id: getMeetings.b.plain\ntitle: t\nendpoint: getMeetings\nclass: contract\nsteps: [{call: getMeetings, expect: {returncode: SUCCESS}}]\n",
	} {
		cs, probs := spec.LoadBytes("c.yaml", []byte(src), spec.Options{})
		if len(probs) > 0 {
			t.Fatalf("problems: %v", probs)
		}
		cases = append(cases, cs...)
	}
	run := r.RunAll(context.Background(), cases, 1)
	if s := run.Cases[0]; s.Status != report.Error || !strings.Contains(s.Reason, "the sink at http://127.0.0.1:1 didn't answer before the run") {
		t.Errorf("sink case: %s %s", s.Status, s.Reason)
	}
	if p := run.Cases[1]; p.Status != report.Pass {
		t.Errorf("plain case: %s %s", p.Status, p.Reason)
	}
}

// A key that expands to something the sink can't record under is an
// error, not a miss.
func TestSinkKeyAtRunTime(t *testing.T) {
	w := startSink(t, nil)
	res := w.run(t, `steps:
  - sink: {key: "${baseUrl}", within: 1s}
`)
	if s := res.Steps[0]; res.Status != report.Error || !strings.Contains(s.Message, "isn't one path segment") {
		t.Errorf("%s: %s", res.Status, s.Message)
	}
}
