package steps

import (
	"context"
	"crypto/sha1"
	"encoding/hex"
	"net/http/httptest"
	"strings"
	"testing"

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
