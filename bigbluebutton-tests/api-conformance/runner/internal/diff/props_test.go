package diff

import (
	"context"
	"crypto/sha1"
	"encoding/hex"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/client"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/fakeredis"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/golden"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/normalize"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/observe"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/report"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/resp"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/spec"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/steps"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/tap"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/target"
)

// side is one target: a redis, a tap and a collector.
type side struct {
	redis *fakeredis.Server
	tap   *tap.Client
	col   *golden.Collector
}

func startSide(t *testing.T) side {
	t.Helper()
	r, err := fakeredis.Start()
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(r.Close)
	s, err := tap.Start(tap.Config{Redis: resp.Options{Addr: r.Addr()}, MaxBytes: 1 << 20, MaxAge: time.Hour})
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(s.Close)
	srv := httptest.NewServer(s)
	t.Cleanup(srv.Close)
	c := tap.NewClient(srv.URL)
	if _, err := c.Mark(t.Context()); err != nil { // subscribed
		t.Fatal(err)
	}
	tg := &target.Target{Name: "t", BaseURL: "https://bbb.test", APIPrefix: "/bigbluebutton/api/", Salt: "props-test-salt-1"}
	return side{redis: r, tap: c, col: golden.NewCollector(tg, normalize.Default(), nil)}
}

// create observes a create step that made meeting intID, after akka-apps
// announced it with these voice props.
func (s side) create(t *testing.T, c *spec.Case, uid, intID, voiceProp string) {
	t.Helper()
	if voiceProp != "" {
		s.redis.Publish("from-akka-apps-redis-channel", fmt.Sprintf(`{"envelope":{"name":"MeetingCreatedEvtMsg","routing":{}},`+
			`"core":{"header":{"name":"MeetingCreatedEvtMsg"},"body":{"props":{"meetingProp":{"intId":%q,"extId":%q},"voiceProp":%s}}}}`, intID, uid, voiceProp))
	}
	h := http.Header{"Content-Type": {"text/xml"}}
	obs := &observe.Observation{Status: 200, Header: h, Body: []byte("<response><returncode>SUCCESS</returncode><internalMeetingID>" + intID + "</internalMeetingID></response>")}
	req := &client.Prepared{Method: "GET", URL: "https://bbb.test/bigbluebutton/api/create?meetingID=" + uid, Header: http.Header{}}
	p := NewProps(t.Context(), s.col, s.tap)
	p.Observe(steps.Observed{Case: c, UID: uid, Phase: "steps", Index: 0, Golden: "compare", Request: req, Obs: obs})
	p.Wait()
}

func TestPropsCompared(t *testing.T) {
	propsWait = 300 * time.Millisecond
	t.Cleanup(func() { propsWait = 5 * time.Second })
	a, b := startSide(t), startSide(t)
	c := &spec.Case{ID: "create.x.y", Endpoint: "create", Steps: []spec.Step{{Kind: spec.KindCall, Line: 7, Call: &spec.CallStep{HasCall: true, Call: "create"}}}}
	id := func(uid string, ts int64) string {
		h := sha1.Sum([]byte(uid))
		return hex.EncodeToString(h[:]) + fmt.Sprintf("-%d", ts)
	}
	a.create(t, c, "bbbc-ua", id("bbbc-ua", 1792520978099), `{"muteOnStart":true,"voiceConf":"71234"}`)
	b.create(t, c, "bbbc-ub", id("bbbc-ub", 1792520978777), `{"muteOnStart":false,"voiceConf":"75555"}`)
	run := func(target string) *report.Run {
		return &report.Run{Target: target, Cases: []*report.CaseResult{{ID: c.ID, Endpoint: "create", Status: report.Pass}}}
	}
	rep := Compare(run("web"), run("api"), a.col, b.col)
	if len(rep.Cases) != 1 || len(rep.Cases[0].Steps) != 1 {
		t.Fatalf("%+v", rep.Cases)
	}
	d := rep.Cases[0].Steps[0]
	if d.Part != PropsPart || strings.Join(d.Hunk, "\n") != "- $.voiceProp.muteOnStart true\n+ $.voiceProp.muteOnStart false" {
		t.Errorf("the props difference: %+v", d)
	}
	var md strings.Builder
	rep.WriteMarkdown(&md)
	if !strings.Contains(md.String(), "step 1 (line 7), MeetingCreatedEvtMsg props, differing:") {
		t.Errorf("markdown:\n%s", md.String())
	}

	// A meeting akka-apps never announced is a difference too.
	c2 := &spec.Case{ID: "create.x.z", Endpoint: "create", Steps: c.Steps}
	a.create(t, c2, "bbbc-uc", id("bbbc-uc", 1), `{"muteOnStart":false}`)
	b.create(t, c2, "bbbc-ud", id("bbbc-ud", 2), "")
	if got := b.col.Props(c2.ID); len(got) != 1 || !strings.Contains(strings.Join(got[0].Lines, " "), "no MeetingCreatedEvtMsg within") {
		t.Errorf("an unannounced meeting: %+v", got)
	}
}

// Reading props never holds up a case, and stops when the run does.
func TestPropsInBackground(t *testing.T) {
	s := startSide(t)
	c := &spec.Case{ID: "create.x.y", Endpoint: "create", Steps: []spec.Step{{Kind: spec.KindCall, Line: 7, Call: &spec.CallStep{HasCall: true, Call: "create"}}}}
	ctx, cancel := context.WithCancel(t.Context())
	p := NewProps(ctx, s.col, s.tap)
	h := http.Header{"Content-Type": {"text/xml"}}
	obs := &observe.Observation{Status: 200, Header: h, Body: []byte("<response><internalMeetingID>never-announced-1</internalMeetingID></response>")}
	req := &client.Prepared{Method: "GET", URL: "https://bbb.test/bigbluebutton/api/create?meetingID=u", Header: http.Header{}}
	start := time.Now()
	p.Observe(steps.Observed{Case: c, UID: "u", Phase: "steps", Index: 0, Golden: "compare", Request: req, Obs: obs})
	if d := time.Since(start); d > time.Second {
		t.Errorf("Observe took %s: it waited for the props", d)
	}
	cancel()
	start = time.Now()
	p.Wait()
	if d := time.Since(start); d > 2*time.Second {
		t.Errorf("Wait took %s after the run was cancelled", d)
	}
	if got := s.col.Props(c.ID); len(got) != 1 || !strings.Contains(strings.Join(got[0].Lines, " "), "context canceled") {
		t.Errorf("props of a cancelled run: %+v", got)
	}
}
