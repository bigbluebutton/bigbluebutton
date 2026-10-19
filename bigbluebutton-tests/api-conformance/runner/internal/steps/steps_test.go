package steps

import (
	"context"
	"crypto/sha1"
	"encoding/hex"
	"fmt"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"sync/atomic"
	"testing"
	"time"

	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/fakebbb"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/report"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/spec"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/target"
)

const salt = "steps-test-salt"

const fixtures = "../../testdata/fixtures"

// runYAML runs one case against a fresh fake and returns what the fake saw.
func runYAML(t *testing.T, src string) (*report.CaseResult, []fakebbb.Seen) {
	t.Helper()
	fake := fakebbb.New(salt)
	srv := httptest.NewServer(fake)
	defer srv.Close()
	cases, probs := spec.LoadBytes("case.yaml", []byte(src), spec.Options{FixturesDir: fixtures})
	if len(probs) > 0 {
		t.Fatalf("problems: %v", probs)
	}
	tg := &target.Target{Name: "fake", BaseURL: srv.URL, APIPrefix: "/bigbluebutton/api/", Salt: salt, DefaultSign: "sha1",
		Capabilities: []string{"akka"}, FixtureURL: "https://fixtures.test"}
	r, err := NewRunner(tg, fixtures, "test")
	if err != nil {
		t.Fatal(err)
	}
	res := r.RunCase(context.Background(), cases[0], "uid-1")
	return res, fake.Requests
}

func header(src string) string {
	return "id: create.x.y\ntitle: t\nendpoint: create\nclass: contract\n" + src
}

func TestQueryAndSigning(t *testing.T) {
	res, seen := runYAML(t, header(`steps:
  - call: getMeetings
    params: {b: "x y", a: "é&", u: "${uid}"}
  - call: stuns
    params: {sessionToken: t}
  - call: ""
`))
	if res.Status != report.Pass {
		t.Fatalf("status %s: %s", res.Status, res.Reason)
	}
	q := "b=x+y&a=%C3%A9%26&u=uid-1"
	sum := sha1.Sum([]byte("getMeetings" + q + salt))
	if want := q + "&checksum=" + hex.EncodeToString(sum[:]); seen[0].RawQuery != want {
		t.Errorf("query = %q, want %q", seen[0].RawQuery, want)
	}
	if seen[1].RawQuery != "sessionToken=t" {
		t.Errorf("stuns should not be signed by default: %q", seen[1].RawQuery)
	}
	if seen[2].Path != "/bigbluebutton/api" || seen[2].RawQuery != "" {
		t.Errorf("version endpoint: %s?%s", seen[2].Path, seen[2].RawQuery)
	}
	if got := seen[0].Header.Get("User-Agent"); got != "bbb-conform/test" {
		t.Errorf("User-Agent = %q", got)
	}
	if got := seen[0].Header.Get("Accept"); got != "*/*" {
		t.Errorf("Accept = %q", got)
	}
	if got := seen[0].Header.Get("Accept-Encoding"); got != "" {
		t.Errorf("Accept-Encoding = %q, want none", got)
	}
}

func TestHeaderRemoval(t *testing.T) {
	_, seen := runYAML(t, header(`steps:
  - call: getMeetings
    headers: {Accept: null, User-Agent: null, X-Forwarded-For: "203.0.113.7"}
`))
	h := seen[0].Header
	if _, ok := h["Accept"]; ok {
		t.Errorf("Accept was sent: %q", h.Get("Accept"))
	}
	if _, ok := h["User-Agent"]; ok {
		t.Errorf("User-Agent was sent: %q", h.Get("User-Agent"))
	}
	if h.Get("X-Forwarded-For") != "203.0.113.7" {
		t.Errorf("X-Forwarded-For = %q", h.Get("X-Forwarded-For"))
	}
}

func TestBodies(t *testing.T) {
	res, seen := runYAML(t, header(`steps:
  - {call: create, method: POST, params: {meetingID: m1, name: Bodies}, body: {xml: "<a>${uid}</a>"}}
  - {call: create, method: POST, params: {meetingID: m1, name: Bodies}, body: {xmlFile: bodies/one-document.xml}}
  - {call: create, method: POST, body: {form: {meetingID: m2, name: "a b"}}}
  - call: create
    method: POST
    params: {meetingID: m3, name: Bodies}
    body:
      json: {meta: {k: v}, list: [1, true, "${uid}", null, 2.5]}
  - {call: insertDocument, method: POST, params: {meetingID: m1}, body: {raw: <modules/>, contentType: text/xml, chunked: true}}
  - call: putRecordingTextTrack
    method: POST
    params: {recordID: r1}
    body:
      multipart:
        fields: {label: English}
        files:
          - {field: file, path: captions/sample.vtt}
          - {field: extra, content: "WEBVTT ${uid}", filename: x.vtt, contentType: text/vtt}
`))
	if res.Status != report.Pass {
		t.Fatalf("status %s: %s", res.Status, res.Reason)
	}
	check := func(i int, ctype, body string) {
		t.Helper()
		if seen[i].ContentType != ctype {
			t.Errorf("request %d: Content-Type = %q, want %q", i, seen[i].ContentType, ctype)
		}
		if seen[i].Body != body {
			t.Errorf("request %d: body =\n%q\nwant\n%q", i, seen[i].Body, body)
		}
	}
	check(0, "application/xml", "<a>uid-1</a>")
	if b := seen[1].Body; !strings.Contains(b, `url="https://fixtures.test/presentations/a.pdf"`) ||
		!strings.Contains(b, "SGVsbG8gZnJvbSBhIGJhc2U2NCBkb2N1bWVudC4K") {
		t.Errorf("xmlFile body was not templated:\n%s", b)
	}
	check(2, "application/x-www-form-urlencoded", "meetingID=m2&name=a+b")
	check(3, "application/json", `{"meta":{"k":"v"},"list":[1,true,"uid-1",null,2.5]}`)
	check(4, "text/xml", "<modules/>")
	if !seen[4].Chunked || seen[3].Chunked {
		t.Errorf("chunked: request 4 = %v, request 3 = %v", seen[4].Chunked, seen[3].Chunked)
	}
	wantMultipart := "--" + multipartBoundary + "\r\n" +
		"Content-Disposition: form-data; name=\"label\"\r\n\r\nEnglish\r\n" +
		"--" + multipartBoundary + "\r\n" +
		"Content-Disposition: form-data; name=\"file\"; filename=\"sample.vtt\"\r\nContent-Type: application/octet-stream\r\n\r\n" +
		"WEBVTT\n\n00:00.000 --> 00:01.000\nHello\n\r\n" +
		"--" + multipartBoundary + "\r\n" +
		"Content-Disposition: form-data; name=\"extra\"; filename=\"x.vtt\"\r\nContent-Type: text/vtt\r\n\r\nWEBVTT uid-1\r\n" +
		"--" + multipartBoundary + "--\r\n"
	check(5, "multipart/form-data; boundary="+multipartBoundary, wantMultipart)
}

func TestOutcomes(t *testing.T) {
	tests := []struct {
		name, src  string
		status     report.Status
		reasonPart string
	}{
		{"capture feeds later steps", `steps:
  - {call: create, params: {meetingID: "${uid}", name: Cap}, capture: {intId: /response/internalMeetingID}}
  - {call: getMeetingInfo, params: {meetingID: "${uid}"}, expect: {xpath: {/response/internalMeetingID: "${intId}"}}}
`, report.Pass, ""},
		{"failed check", `steps:
  - {call: getMeetings, expect: {returncode: FAILED}}
`, report.Fail, `returncode: expected "FAILED", got "SUCCESS"`},
		{"value matcher needs one node", `steps:
  - {call: getMeetings, expect: {xpath: {/response/*: SUCCESS}}}
`, report.Fail, "4 values"},
		{"count and absent", `steps:
  - {call: getMeetings, expect: {xpath: {/response/*: {count: 4}, /response/nope: {absent: true}, "count(/response/*)": "4"}}}
`, report.Pass, ""},
		{"template error", `steps:
  - {call: getMeetings, params: {a: '${repeat("x", -1)}'}}
`, report.Error, "repeat: count"},
		{"eventually polls", `steps:
  - {call: create, params: {meetingID: "${uid}", name: Ev}}
  - {call: end, params: {meetingID: "${uid}"}}
  - call: isMeetingRunning
    params: {meetingID: "${uid}"}
    eventually: {within: 5s, every: 10ms, until: {xpath: {/response/running: "false"}}}
`, report.Pass, ""},
		{"redirect and cookies", `steps:
  - {call: create, params: {meetingID: "${uid}", name: Join}, expect: {returncode: SUCCESS}}
  - call: join
    params: {meetingID: "${uid}", fullName: Ann}
    expect:
      status: 302
      headers: {Set-Cookie: {regex: Secure}}
      redirect: {path: /html5client/join, query: {sessionToken: {regex: "^st"}}}
    capture: {tok: location:query.sessionToken, js: cookie:JSESSIONID, st: status}
  - {call: getJoinUrl, params: {sessionToken: "${tok}", fullName: Bob}, capture: {link: $.response.url}}
  - {url: "${link}", expect: {status: 302}}
`, report.Pass, ""},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			res, _ := runYAML(t, header(tt.src))
			if res.Status != tt.status || !strings.Contains(res.Reason, tt.reasonPart) {
				t.Errorf("status %s, reason %q; want %s containing %q", res.Status, res.Reason, tt.status, tt.reasonPart)
			}
		})
	}
}

func TestEventuallyAttempts(t *testing.T) {
	res, _ := runYAML(t, header(`steps:
  - {call: create, params: {meetingID: "${uid}", name: Ev}}
  - {call: end, params: {meetingID: "${uid}"}}
  - call: isMeetingRunning
    params: {meetingID: "${uid}"}
    eventually: {within: 5s, every: 10ms, until: {xpath: {/response/running: "false"}}}
`))
	// The fake answers true for two polls after end, then false.
	if got := res.Steps[2].Attempts; got != 3 {
		t.Errorf("attempts = %d, want 3", got)
	}
}

func TestJavaStyleEncoding(t *testing.T) {
	_, seen := runYAML(t, header(`steps:
  - {call: stuns, params: {s: "a*b~c d"}}
`))
	if got := seen[0].RawQuery; got != "s=a*b%7Ec+d" {
		t.Errorf("query = %q, want URLEncoder's s=a*b%%7Ec+d", got)
	}
}

func TestTemplatedHeaderKey(t *testing.T) {
	res, _ := runYAML(t, header(`steps:
  - call: getMeetings
    expect:
      headers:
        '${urlencode("Content-Type")}': {contains: xml}
`))
	if res.Status != report.Pass {
		t.Errorf("status %s: %s", res.Status, res.Reason)
	}
}

// runAgainst runs one case against handler, as an eventually test needs.
func runAgainst(t *testing.T, handler http.Handler, src string) *report.CaseResult {
	t.Helper()
	srv := httptest.NewServer(handler)
	defer srv.Close()
	cases, probs := spec.LoadBytes("case.yaml", []byte(header(src)), spec.Options{})
	if len(probs) > 0 {
		t.Fatalf("problems: %v", probs)
	}
	r, err := NewRunner(&target.Target{Name: "h", BaseURL: srv.URL, APIPrefix: "/bigbluebutton/api/", Salt: salt, DefaultSign: "sha1"}, "", "test")
	if err != nil {
		t.Fatal(err)
	}
	return r.RunCase(context.Background(), cases[0], "uid-1")
}

const pollCase = `steps:
  - call: isMeetingRunning
    eventually: {within: 300ms, every: 50ms, until: {xpath: {/response/running: "false"}}}
`

func TestEventuallyStopsAtDeadline(t *testing.T) {
	stall := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		select {
		case <-r.Context().Done():
		case <-time.After(5 * time.Second):
		}
	})
	start := time.Now()
	res := runAgainst(t, stall, pollCase)
	if took := time.Since(start); took > 2*time.Second {
		t.Errorf("took %s; an attempt must not outlast within by much", took)
	}
	if res.Status != report.Error {
		t.Errorf("status %s, want ERROR when the server never answers: %s", res.Status, res.Reason)
	}
}

func TestEventuallyKeepsLastAnswer(t *testing.T) {
	var calls atomic.Int32
	flaky := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if calls.Add(1) <= 2 {
			w.Header().Set("Content-Type", "text/xml")
			w.Write([]byte("<response><returncode>SUCCESS</returncode><running>true</running></response>"))
			return
		}
		conn, _, err := w.(http.Hijacker).Hijack()
		if err == nil {
			conn.Close() // later attempts can't connect properly
		}
	})
	res := runAgainst(t, flaky, pollCase)
	if res.Status != report.Fail || !strings.Contains(res.Reason, `expected "false", got "true"`) || !strings.Contains(res.Reason, "the last attempt failed") {
		t.Errorf("status %s, reason %q; want FAIL with the last real answer", res.Status, res.Reason)
	}
	if res.Steps[0].Response == nil || res.Steps[0].Response.Status != 200 {
		t.Errorf("the last real response should be in the report: %+v", res.Steps[0].Response)
	}
}

func TestClip(t *testing.T) {
	if got := clip("ééé", 3); got != "é… (4 bytes more)" {
		t.Errorf("clip = %q", got)
	}
	if got := clip("abc", 3); got != "abc" {
		t.Errorf("clip = %q", got)
	}
}

func TestEncodedSecretsRedacted(t *testing.T) {
	const secretValue = `t0p+se/cr=t"x`
	fake := fakebbb.New(salt)
	srv := httptest.NewServer(fake)
	defer srv.Close()
	cases, probs := spec.LoadBytes("case.yaml", []byte(header(`steps:
  - call: create
    params: {meetingID: "${target.turn}", name: Secret}
  - call: getMeetings
    method: POST
    body:
      json: {s: "${target.turn}"}
`)), spec.Options{})
	if len(probs) > 0 {
		t.Fatal(probs)
	}
	tg := &target.Target{Name: "f", BaseURL: srv.URL, APIPrefix: "/bigbluebutton/api/", Salt: salt, DefaultSign: "sha1",
		Vars: map[string]target.Var{"turn": {Value: secretValue, Secret: true}}}
	r, err := NewRunner(tg, "", "test")
	if err != nil {
		t.Fatal(err)
	}
	res := r.RunCase(context.Background(), cases[0], "u")
	// The URL has the query-encoded form, the fake's XML response the
	// XML-escaped one, and the JSON body the JSON-escaped one.
	for _, s := range []string{res.Steps[0].Request.URL, res.Steps[0].Response.Body, res.Steps[1].Request.Body} {
		if strings.Contains(s, "t0p") || !strings.Contains(s, "[secret:turn]") {
			t.Errorf("not redacted: %q", s)
		}
	}
	if !strings.Contains(fake.Requests[0].RawQuery, "t0p%2Bse%2Fcr%3Dt%22x") {
		t.Errorf("the secret should still be sent: %q", fake.Requests[0].RawQuery)
	}
}

func TestRoutes(t *testing.T) {
	main := httptest.NewServer(fakebbb.New(salt))
	defer main.Close()
	direct := fakebbb.New(salt)
	directSrv := httptest.NewServer(direct)
	defer directSrv.Close()
	t.Setenv("STEPS_TEST_DIRECT", directSrv.URL)
	t.Setenv("STEPS_TEST_UNSET", "")

	tf := filepath.Join(t.TempDir(), "r.yaml")
	body := "name: r\nbaseUrl: " + main.URL + "\nsalt: " + salt + "\nroutes:\n" +
		"  presentation-download: {path: \"/bigbluebutton/presentation/download/{meetingId}/{presId}\"}\n" +
		"  presentation-direct: {path: /bigbluebutton/presentation/direct, baseEnv: STEPS_TEST_DIRECT}\n" +
		"  presentation-unset: {path: /bigbluebutton/presentation/x, baseEnv: STEPS_TEST_UNSET}\n"
	if err := os.WriteFile(tf, []byte(body), 0o644); err != nil {
		t.Fatal(err)
	}
	tg, err := target.Load(tf)
	if err != nil {
		t.Fatal(err)
	}
	r, err := NewRunner(tg, "", "test")
	if err != nil {
		t.Fatal(err)
	}
	if got := tg.Bases(); len(got) != 2 || got[1] != main.URL && got[0] != main.URL {
		t.Errorf("Bases = %v, want baseUrl and the direct base", got)
	}
	run := func(src string) *report.CaseResult {
		t.Helper()
		cases, probs := spec.LoadBytes("case.yaml", []byte(header(src)), spec.Options{})
		if len(probs) > 0 {
			t.Fatal(probs)
		}
		return r.RunCase(context.Background(), cases[0], "uid-1")
	}

	res := run(`steps:
  - route: presentation-download
    pathParams: {meetingId: "m ${uid}", presId: "p/1", unused: x}
    expect: {status: 200, body: "presentation/download/m%20uid-1/p%2F1"}
  - route: presentation-direct
    expect: {status: 200}
`)
	if res.Status != report.Pass {
		t.Errorf("status %s: %s", res.Status, res.Reason)
	}
	if len(direct.Requests) != 1 || direct.Requests[0].Path != "/bigbluebutton/presentation/direct" {
		t.Errorf("the baseEnv route should go to the other host: %+v", direct.Requests)
	}
	if res := run("steps:\n  - route: presentation-unset\n  - route: nowhere\n"); res.Status != report.Skip || res.Reason != "not-routed: nowhere, presentation-unset" {
		t.Errorf("status %s, reason %q", res.Status, res.Reason)
	}
	if res := run("steps:\n  - route: presentation-download\n    pathParams: {meetingId: m}\n"); res.Status != report.Error || !strings.Contains(res.Reason, "needs pathParams presId") {
		t.Errorf("status %s, reason %q", res.Status, res.Reason)
	}
}

func TestProfiles(t *testing.T) {
	srv := httptest.NewServer(fakebbb.New(salt))
	defer srv.Close()
	dir := t.TempDir()
	tg := &target.Target{Name: "p", BaseURL: srv.URL, APIPrefix: "/bigbluebutton/api/", Salt: salt, DefaultSign: "sha1", Dir: dir,
		Profiles: map[string]target.Profile{
			"fast":    {Command: "echo fast >> marker"},
			"broken":  {Command: "echo broken >> marker; echo oops; exit 3"},
			"default": {Command: "echo default >> marker"},
		}}
	r, err := NewRunner(tg, "", "test")
	if err != nil {
		t.Fatal(err)
	}
	var cases []*spec.Case
	for i, profile := range []string{"fast", "", "broken", "fast", "missing"} {
		src := fmt.Sprintf("id: getMeetings.p.c%d\ntitle: t\nendpoint: getMeetings\nclass: contract\n", i)
		if profile != "" {
			src += "profile: " + profile + "\n"
		}
		src += "steps: [{call: getMeetings, expect: {returncode: SUCCESS}}]\n"
		cs, probs := spec.LoadBytes("c.yaml", []byte(src), spec.Options{})
		if len(probs) > 0 {
			t.Fatal(probs)
		}
		cases = append(cases, cs...)
	}
	run := r.RunAll(context.Background(), cases, 2)
	var got []string
	for _, c := range run.Cases {
		got = append(got, string(c.Status))
	}
	if want := []string{"PASS", "PASS", "ERROR", "PASS", "SKIP"}; strings.Join(got, ",") != strings.Join(want, ",") {
		t.Errorf("statuses = %v, want %v", got, want)
	}
	if !strings.Contains(run.Cases[2].Reason, "profile broken: command failed") || !strings.Contains(run.Cases[2].Reason, "oops") {
		t.Errorf("reason = %q", run.Cases[2].Reason)
	}
	if run.Cases[4].Reason != "no-profile: missing" {
		t.Errorf("reason = %q", run.Cases[4].Reason)
	}
	marker, _ := os.ReadFile(filepath.Join(dir, "marker"))
	if got := strings.Fields(string(marker)); strings.Join(got, ",") != "fast,broken,default" {
		t.Errorf("profile commands ran as %v, want fast,broken,default (one switch per group, default last)", got)
	}
}

func TestProfileDefaultAfterCancel(t *testing.T) {
	srv := httptest.NewServer(fakebbb.New(salt))
	defer srv.Close()
	dir := t.TempDir()
	tg := &target.Target{Name: "p", BaseURL: srv.URL, APIPrefix: "/bigbluebutton/api/", Salt: salt, DefaultSign: "sha1", Dir: dir,
		Profiles: map[string]target.Profile{
			"slow":    {Command: "sleep 5"},
			"default": {Command: "echo default >> marker"},
		}}
	r, err := NewRunner(tg, "", "test")
	if err != nil {
		t.Fatal(err)
	}
	cases, _ := spec.LoadBytes("c.yaml", []byte("id: getMeetings.p.c\ntitle: t\nendpoint: getMeetings\nclass: contract\nprofile: slow\nsteps: [{call: getMeetings}]\n"), spec.Options{})
	ctx, cancel := context.WithTimeout(context.Background(), 200*time.Millisecond)
	defer cancel()
	run := r.RunAll(ctx, cases, 1)
	if run.Cases[0].Status != report.Error {
		t.Errorf("status %s", run.Cases[0].Status)
	}
	if marker, _ := os.ReadFile(filepath.Join(dir, "marker")); strings.TrimSpace(string(marker)) != "default" {
		t.Errorf("the default profile must be restored after a cancelled run; marker = %q", marker)
	}
}

// A profile switch can restart services, so it is skipped when no case in
// the group would run.
func TestProfileSkippedWhenNothingRuns(t *testing.T) {
	srv := httptest.NewServer(fakebbb.New(salt))
	defer srv.Close()
	dir := t.TempDir()
	tg := &target.Target{Name: "p", BaseURL: srv.URL, APIPrefix: "/bigbluebutton/api/", Salt: salt, DefaultSign: "sha1", Dir: dir,
		Profiles: map[string]target.Profile{"slow": {Command: "echo slow >> marker"}, "default": {Command: "echo default >> marker"}}}
	r, err := NewRunner(tg, "", "test")
	if err != nil {
		t.Fatal(err)
	}
	cases, _ := spec.LoadBytes("c.yaml", []byte("id: getMeetings.p.c\ntitle: t\nendpoint: getMeetings\nclass: contract\nprofile: slow\nrequires: [clamav]\nsteps: [{call: getMeetings}]\n"), spec.Options{})
	run := r.RunAll(context.Background(), cases, 1)
	if run.Cases[0].Status != report.Skip {
		t.Errorf("status %s", run.Cases[0].Status)
	}
	if marker, _ := os.ReadFile(filepath.Join(dir, "marker")); len(marker) > 0 {
		t.Errorf("no profile command should run when every case in the group is skipped: %q", marker)
	}
}
