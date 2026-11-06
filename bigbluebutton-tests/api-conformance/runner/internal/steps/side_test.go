package steps

import (
	"context"
	"fmt"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/fakebbb"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/fakeredis"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/report"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/resp"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/spec"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/tap"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/target"
)

// sideWorld is a fake server with its redis and data directory, and a tap
// next to it.
type sideWorld struct {
	fake   *fakebbb.Server
	redis  *fakeredis.Server
	tap    *tap.Server
	tapURL string
	runs   int
}

func startSide(t *testing.T) *sideWorld {
	t.Helper()
	r, err := fakeredis.Start()
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(r.Close)
	fake := fakebbb.New(salt)
	fake.Redis, fake.DataDir = r, t.TempDir()
	// A real server has these before any meeting ends.
	for _, d := range []string{"recording/status/recorded", "recording/status/ended"} {
		if err := os.MkdirAll(filepath.Join(fake.DataDir, d), 0o755); err != nil {
			t.Fatal(err)
		}
	}
	tp, err := tap.Start(tap.Config{Redis: resp.Options{Addr: r.Addr()}, DataDir: fake.DataDir, Watch: []string{"recording/status"},
		RedisKeys: []string{"meeting:*"}, MaxBytes: 1 << 20, MaxAge: time.Hour})
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(tp.Close)
	ts := httptest.NewServer(tp)
	t.Cleanup(ts.Close)
	return &sideWorld{fake: fake, redis: r, tap: tp, tapURL: ts.URL}
}

func (w *sideWorld) run(t *testing.T, src string) *report.CaseResult {
	t.Helper()
	srv := httptest.NewServer(w.fake)
	defer srv.Close()
	cases, probs := spec.LoadBytes("case.yaml", []byte(header(src)), spec.Options{})
	if len(probs) > 0 {
		t.Fatalf("problems: %v", probs)
	}
	tg := &target.Target{Name: "fake", BaseURL: srv.URL, APIPrefix: "/bigbluebutton/api/", Salt: salt, DefaultSign: "sha1",
		TapURL: w.tapURL, Capabilities: []string{"bus", "fs", "redis"}}
	r, err := NewRunner(tg, "", "test")
	if err != nil {
		t.Fatal(err)
	}
	w.runs++ // each case its own meetings
	return r.RunCase(context.Background(), cases[0], fmt.Sprintf("uid-%d", w.runs))
}

const sideEffects = `steps:
  - call: create
    params: {meetingID: "${uid}", name: Props, record: "true", muteOnStart: "true", meta_Color: blue}
    capture: {intId: /response/internalMeetingID}
  - bus: {name: MeetingCreatedEvtMsg, meetingId: "${intId}", within: 3s}
    expect:
      jsonpath:
        $.core.body.props.voiceProp.muteOnStart: "true"
    capture: {voiceConf: $.core.body.props.voiceProp.voiceConf}
  - redis: {key: "meeting:info:${intId}", within: 2s}
    expect:
      hash: {color: blue, meetingName: Props}
      ttl: "-1"
  - call: end
    params: {meetingID: "${uid}"}
  - bus: {name: MeetingEndedEvtMsg, meetingId: "${intId}", within: 3s}
  - fs: {path: "recording/status/recorded/${intId}.done", within: 2s}
    expect: {exists: true}
  - bus: {name: MeetingCreatedEvtMsg, meetingId: "${intId}", within: 300ms}
    expect: {count: 1}
  - bus: {name: MeetingDestroyedEvtMsg, meetingId: "${intId}", within: 300ms}
    expect: {absent: true}
`

func TestSideEffectSteps(t *testing.T) {
	w := startSide(t)
	res := w.run(t, sideEffects)
	if res.Status != report.Pass {
		for _, s := range res.Steps {
			t.Logf("step %d %s %s: %s %s", s.Index+1, s.Kind, s.Status, s.Message, s.Document)
		}
		t.Fatalf("%s: %s", res.Status, res.Reason)
	}
	if v := res.Steps[1].Captured["voiceConf"]; !strings.HasPrefix(v, "7") {
		t.Errorf("voiceConf = %q", v)
	}
	if d := res.Steps[1].Document; !strings.Contains(d, `"channel":"from-akka-apps-redis-channel"`) {
		t.Errorf("the bus document: %s", d)
	}
	if r := res.Steps[1].Request; r == nil || r.Method != "BUS" {
		t.Errorf("the bus request: %+v", r)
	}
	if d := res.Steps[5].Document; !strings.Contains(d, `"found":true`) {
		t.Errorf("the fs document: %s", d)
	}
}

// A marker deleted the moment it appears, as record-and-playback does on
// a full install, still counts.
func TestDeletedMarker(t *testing.T) {
	if !tap.WatchSupported {
		t.Skip("needs inotify")
	}
	w := startSide(t)
	w.fake.DeleteMarkers = true
	res := w.run(t, `steps:
  - call: create
    params: {meetingID: "${uid}", name: Gone, record: "true"}
    capture: {intId: /response/internalMeetingID}
  - call: end
    params: {meetingID: "${uid}"}
  - fs: {path: "recording/status/recorded/${intId}.done", within: 2s}
`)
	if res.Status != report.Pass {
		t.Fatalf("%s: %s", res.Status, res.Reason)
	}
}

func TestSideEffectFailures(t *testing.T) {
	w := startSide(t)
	for _, tt := range []struct{ src, want string }{
		{`steps:
  - call: create
    params: {meetingID: "${uid}", name: Props}
    capture: {intId: /response/internalMeetingID}
  - bus: {name: MeetingEndedEvtMsg, meetingId: "${intId}", within: 300ms}
`, "bus MeetingEndedEvtMsg: expected a message within 300ms, got none; the meeting got CreateMeetingReqMsg, MeetingCreatedEvtMsg"},
		{`steps:
  - call: create
    params: {meetingID: "${uid}", name: Props}
    capture: {intId: /response/internalMeetingID}
  - bus: {name: MeetingCreatedEvtMsg, meetingId: "${intId}", within: 300ms}
    expect:
      jsonpath:
        $.core.body.props.voiceProp.muteOnStart: "true"
`, "got 1 message(s) of that name, none passing the filters"},
		{`steps:
  - call: create
    params: {meetingID: "${uid}", name: Props}
    capture: {intId: /response/internalMeetingID}
  - redis: {key: "meeting:info:${intId}", within: 300ms}
`, "redis meeting:info:<sha1>: expected present within 300ms, got absent"},
		{`steps:
  - call: create
    params: {meetingID: "${uid}", name: Props, record: "true"}
    capture: {intId: /response/internalMeetingID}
  - call: end
    params: {meetingID: "${uid}"}
  - fs: {path: "recording/status/recorded/${intId}.done", within: 300ms}
    expect: {absent: true}
`, "expected none within 300ms, got recording/status/recorded/"},
		{`steps:
  - redis: {key: "livekit:rooms"}
`, "the tap only reads keys matching meeting:*"},
	} {
		res := w.run(t, tt.src)
		reason := res.Reason
		if i := strings.Index(reason, "meeting:info:"); i >= 0 {
			reason = reason[:i+13] + "<sha1>" + reason[i+13+54:]
		}
		if res.Status == report.Pass || !strings.Contains(reason, tt.want) {
			t.Errorf("%s: %s, want %q", res.Status, reason, tt.want)
		}
	}
}

// Without the tap, a case that needs a mark sends nothing.
func TestMarkFailureSendsNothing(t *testing.T) {
	w := startSide(t)
	w.tapURL = "http://127.0.0.1:1"
	res := w.run(t, sideEffects)
	if res.Status != report.Error || len(res.Steps) != 0 || len(w.fake.Requests) != 0 {
		t.Errorf("%s after %d step(s), %d request(s): %s", res.Status, len(res.Steps), len(w.fake.Requests), res.Reason)
	}
}

// A tap that doesn't answer before the run makes each of its cases an
// ERROR at once, before anything is sent; other cases run.
func TestTapDownBeforeTheRun(t *testing.T) {
	w := startSide(t)
	srv := httptest.NewServer(w.fake)
	defer srv.Close()
	var cases []*spec.Case
	for _, src := range []string{header(sideEffects), "id: getMeetings.x.y\ntitle: t\nendpoint: getMeetings\nclass: contract\nsteps:\n  - call: getMeetings\n"} {
		c, probs := spec.LoadBytes("case.yaml", []byte(src), spec.Options{})
		if len(probs) > 0 {
			t.Fatalf("problems: %v", probs)
		}
		cases = append(cases, c...)
	}
	tg := &target.Target{Name: "fake", BaseURL: srv.URL, APIPrefix: "/bigbluebutton/api/", Salt: salt, DefaultSign: "sha1",
		TapURL: "http://127.0.0.1:1", Capabilities: []string{"bus", "fs", "redis"}}
	r, err := NewRunner(tg, "", "test")
	if err != nil {
		t.Fatal(err)
	}
	start := time.Now()
	run := r.RunAll(context.Background(), cases, 2)
	if c := run.Cases[0]; c.Status != report.Error || !strings.Contains(c.Reason, "didn't answer before the run") || len(c.Steps) != 0 {
		t.Errorf("the tap's case: %s %s", c.Status, c.Reason)
	}
	if c := run.Cases[1]; c.Status != report.Pass {
		t.Errorf("the other case: %s %s", c.Status, c.Reason)
	}
	if len(w.fake.Requests) != 1 || time.Since(start) > 5*time.Second {
		t.Errorf("%d request(s) in %s", len(w.fake.Requests), time.Since(start))
	}
}

// When the tap loses its subscription during an absent step's window, it
// can't say nothing was published.
func TestGapIsAnError(t *testing.T) {
	w := startSide(t)
	go func() {
		time.Sleep(300 * time.Millisecond)
		w.redis.Kill()
	}()
	res := w.run(t, `steps:
  - call: create
    params: {meetingID: "${uid}", name: Gap}
    capture: {intId: /response/internalMeetingID}
  - bus: {name: MeetingDestroyedEvtMsg, meetingId: "${intId}", within: 2s}
    expect: {absent: true}
`)
	if res.Status != report.Error || !strings.Contains(res.Reason, "may have missed messages") {
		t.Errorf("%s: %s", res.Status, res.Reason)
	}
}

// Where the tap was asked to watch but can't, a file that came and went
// would be missed, so an fs step that rests on finding nothing is an
// ERROR. Elsewhere only the files there now count, so it fails as usual.
func TestUnwatchedIsAnError(t *testing.T) {
	w := startSide(t)
	dir := t.TempDir()
	if err := os.MkdirAll(filepath.Join(dir, "recording"), 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(filepath.Join(dir, "recording/status"), nil, 0o644); err != nil { // not a directory
		t.Fatal(err)
	}
	tp, err := tap.Start(tap.Config{Redis: resp.Options{Addr: w.redis.Addr()}, DataDir: dir, Watch: []string{"recording/status"},
		MaxBytes: 1 << 20, MaxAge: time.Hour})
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(tp.Close)
	ts := httptest.NewServer(tp)
	t.Cleanup(ts.Close)
	w.tapURL = ts.URL
	for _, tt := range []struct {
		src    string
		status report.Status
		want   string
	}{
		{"  - fs: {path: \"recording/status/recorded/${uid}.done\", within: 300ms}\n", report.Error, "the tap would miss a file that came and went: "},
		{"  - fs: {path: \"recording/status/recorded/${uid}.done\", within: 300ms}\n    expect: {absent: true}\n", report.Error, "the tap would miss a file that came and went: "},
		{"  - fs: {path: \"published/${uid}/metadata.xml\", within: 300ms}\n", report.Fail, "expected a file within 300ms, got none"},
	} {
		res := w.run(t, "steps:\n"+tt.src)
		if res.Status != tt.status || !strings.Contains(res.Reason, tt.want) {
			t.Errorf("%s: %s, want %s %q", tt.src, res.Status, tt.status, tt.want)
		}
	}
}

// File events lost during a find's window make finding nothing an ERROR.
func TestFileGapIsAnError(t *testing.T) {
	if !tap.WatchSupported {
		t.Skip("needs inotify")
	}
	w := startSide(t)
	go func() {
		time.Sleep(200 * time.Millisecond)
		os.RemoveAll(filepath.Join(w.fake.DataDir, "recording/status"))
	}()
	res := w.run(t, `steps:
  - fs: {path: "recording/status/ended/${uid}.done", within: 1s}
`)
	if res.Status != report.Error || !strings.Contains(res.Reason, "lost file events") {
		t.Errorf("%s: %s", res.Status, res.Reason)
	}
}

// An fs or redis step looks one last time at the end of its window: a
// file that turns up just before then still fails an absent step.
func TestAbsentLooksToTheEnd(t *testing.T) {
	w := startSide(t)
	go func() {
		time.Sleep(590 * time.Millisecond)
		os.WriteFile(filepath.Join(w.fake.DataDir, "recording/status/ended/uid-1.done"), nil, 0o644)
	}()
	res := w.run(t, `steps:
  - fs: {path: "recording/status/ended/${uid}.done", within: 600ms}
    expect: {absent: true}
`)
	if res.Status != report.Fail || !strings.Contains(res.Reason, "got recording/status/ended/uid-1.done") {
		t.Errorf("%s after %d step(s): %s", res.Status, len(res.Steps), res.Reason)
	}
}
