package golden

import (
	"net/http"
	"strings"
	"testing"

	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/client"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/normalize"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/observe"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/spec"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/steps"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/target"
)

const base = "https://bbb.test"

func testTarget() *target.Target {
	return &target.Target{Name: "t", BaseURL: base, APIPrefix: "/bigbluebutton/api/", Salt: "s4lt"}
}

func event(c *spec.Case, index int, mode, query, body string) steps.Observed {
	h := http.Header{}
	h.Set("Content-Type", "text/xml;charset=utf-8")
	return steps.Observed{
		Case: c, UID: "bbbc-1a2b3c", Phase: "steps", Index: index, Golden: mode,
		Request: &client.Prepared{Method: "GET", URL: base + "/bigbluebutton/api/x?" + query, Header: http.Header{}},
		Obs:     &observe.Observation{Status: 200, Header: h, Body: []byte(body)},
	}
}

// An off step isn't compared, but what it sent is still known, so a later
// step that echoes it reads the same whatever the earlier step's setting.
func TestOffStepStillSends(t *testing.T) {
	c := &spec.Case{ID: "getMeetingInfo.x.y", Steps: []spec.Step{{Kind: spec.KindCall, Line: 5}, {Kind: spec.KindCall, Line: 9}}}
	col := NewCollector(testTarget(), normalize.Default(), nil)
	col.Observe(event(c, 0, "off", "meetingID=bbbc-1a2b3c&attendeePW=Sekr3t", "<response/>"))
	col.Observe(event(c, 1, "compare", "meetingID=bbbc-1a2b3c", "<response><attendeePW>Sekr3t</attendeePW></response>"))
	got := col.Steps(c.ID)
	if len(got) != 1 || got[0].Key != (Key{"steps", 1}) || got[0].Line != 9 {
		t.Fatalf("steps = %+v, want only step 1 (line 9)", got)
	}
	want := `/response/attendeePW "Sekr3t"`
	if last := got[0].Lines[len(got[0].Lines)-1]; last != want {
		t.Errorf("last line = %s, want %s", last, want)
	}
}

// A presence or graphql step's document has no status or headers.
func TestCollectDocument(t *testing.T) {
	c := &spec.Case{ID: "create.x.y", Steps: []spec.Step{{Kind: spec.KindGraphQL, Line: 3}}}
	col := NewCollector(testTarget(), normalize.Default(), nil)
	got := col.Add(steps.Observed{Case: c, UID: "bbbc-1a2b3c", Phase: "steps", Index: 0, Golden: "compare",
		Obs: &observe.Observation{Body: []byte(`{"data":{"user_current":[{"userId":"w_abcdefghijkl"}]}}`)}})
	if want := []string{`$.data.user_current[].userId "w_<id>"`}; strings.Join(got, "\n") != strings.Join(want, "\n") {
		t.Errorf("got %q", got)
	}
}
