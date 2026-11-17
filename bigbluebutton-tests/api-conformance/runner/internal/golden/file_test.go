package golden

import (
	"os"
	"path/filepath"
	"reflect"
	"strings"
	"testing"

	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/spec"
)

func loadCases(t *testing.T, src string) []*spec.Case {
	t.Helper()
	cases, probs := spec.LoadBytes("case.yaml", []byte(src), spec.Options{})
	if len(probs) > 0 {
		t.Fatalf("problems: %v", probs)
	}
	return cases
}

const sectionsCase = `id: create.x.sections
title: t
endpoint: create
class: contract
variants:
  - {id: plain}
  - {id: defect, class: defect}
steps:
  - call: create
    params: {meetingID: "${uid}", name: n}
  - wait: 10ms
  - call: end
    params: {meetingID: "${uid}"}
    ignoreResult: true
  - route: presentation-download
    method: HEAD
    pathParams: {presId: p1}
  - url: "${baseUrl}/x"
    golden: off
  - call: ""
  - fs: {path: "a/${uid}"}
    expect: {exists: true}
    golden: document
teardown:
  - call: end
    params: {meetingID: "${uid}"}
  - call: getMeetingInfo
    params: {meetingID: "${uid}"}
    golden: compare
`

func titles(secs []Section) string {
	var out []string
	for _, s := range secs {
		out = append(out, s.title())
	}
	return strings.Join(out, "\n")
}

func TestSections(t *testing.T) {
	cases := loadCases(t, sectionsCase)
	want := map[string]string{
		"create.x.sections-plain": `step 1: call create
step 4: route presentation-download (HEAD)
step 6: call ""
step 7: fs a/${uid} (document)
teardown 2: call getMeetingInfo`,
		"create.x.sections-defect": `step 1: call create (document)
step 4: route presentation-download (HEAD) (document)
step 6: call "" (document)
step 7: fs a/${uid} (document)
teardown 2: call getMeetingInfo`,
	}
	for _, c := range cases {
		if got := titles(Sections(c)); got != want[c.ID] {
			t.Errorf("%s:\n%s\nwant:\n%s", c.ID, got, want[c.ID])
		}
	}
}

func TestFormatAndParse(t *testing.T) {
	f := &File{Case: "create.x.y", Target: "bbb-web", Sections: []Section{
		{Key: Key{"steps", 0}, Label: "call create", Lines: []string{"status 200", "body xml", `/response/returncode "SUCCESS"`}},
		{Key: Key{"steps", 2}, Label: `call ""`, Document: true, Lines: []string{"status 200", "# not a comment here"}},
		{Key: Key{"steps", 3}, Label: "call create (POST)", Document: true, Lines: []string{"status 200"}},
		{Key: Key{"teardown", 0}, Label: "url ${baseUrl}/x", Lines: []string{"status 302", "body (redirect)"}},
	}}
	data, err := f.Format()
	if err != nil {
		t.Fatal(err)
	}
	want := header + `case create.x.y
target bbb-web

== step 1: call create
status 200
body xml
/response/returncode "SUCCESS"

== step 3: call "" (document)
status 200
# not a comment here

== step 4: call create (POST) (document)
status 200

== teardown 1: url ${baseUrl}/x
status 302
body (redirect)
`
	if string(data) != want {
		t.Fatalf("got:\n%s\nwant:\n%s", data, want)
	}
	back, err := Parse("dir/create/create.x.y.txt", []byte(strings.ReplaceAll(string(data), "\n", "\r\n")))
	if err != nil {
		t.Fatal(err)
	}
	if !reflect.DeepEqual(back, f) {
		t.Errorf("parsed back:\n%+v\nwant:\n%+v", back, f)
	}
	for _, bad := range []string{"", "a\nb", "== step 2: x"} {
		g := &File{Case: "c", Sections: []Section{{Key: Key{"steps", 0}, Label: "call x", Lines: []string{bad}}}}
		if _, err := g.Format(); err == nil {
			t.Errorf("Format accepted the line %q", bad)
		}
	}
}

func TestParseErrors(t *testing.T) {
	for body, want := range map[string]string{
		"case create.x.y\nstatus 200\n":                                           `expected case, target or a section, got "status 200"`,
		"case create.x.y\n== step 1: call a\nx\n== step 1: call a\ny\n":           "step 1 appears twice",
		"case create.x.z\n== step 1: call a\nx\n":                                 `records case "create.x.z", but the file is named for "create.x.y"`,
		"== step 1: call a\nx\n":                                                  `records case ""`,
		"case create.x.y\n== step 0: call a\nx\n":                                 `expected case, target or a section, got "== step 0: call a"`,
		"case create.x.y\n== step 1: call a\n" + strings.Repeat("x", 20e6) + "\n": "token too long",
	} {
		_, err := Parse("create.x.y.txt", []byte(body))
		if err == nil || !strings.Contains(err.Error(), want) {
			t.Errorf("Parse(%.60q) error = %v, want %q", body, err, want)
		}
	}
}

func TestBuildAndStale(t *testing.T) {
	c := loadCases(t, sectionsCase)[0] // plain
	got := []Step{
		{Key: Key{"steps", 0}, Lines: []string{"a"}},
		{Key: Key{"steps", 3}, Lines: []string{"b"}},
		{Key: Key{"steps", 5}, Lines: []string{"c"}},
		{Key: Key{"steps", 6}, Lines: []string{"d"}},
	}
	if _, err := Build(c, "fake", got); err == nil || err.Error() != "teardown 2: call getMeetingInfo wasn't reached" {
		t.Errorf("Build error = %v", err)
	}
	got = append(got, Step{Key: Key{"teardown", 1}, Lines: []string{"e"}})
	f, err := Build(c, "fake", got)
	if err != nil {
		t.Fatal(err)
	}
	if len(f.Sections) != 5 || f.Sections[3].Lines[0] != "d" || !f.Sections[3].Document {
		t.Errorf("built %+v", f.Sections)
	}
	if s := Stale(f, c); s != "" {
		t.Errorf("a fresh recording is stale: %s", s)
	}

	edited := *c
	edited.Steps = append([]spec.Step{{Kind: spec.KindWait}}, c.Steps...)
	if s := Stale(f, &edited); s != "it has step 1: call create where the case has step 2: call create" {
		t.Errorf("stale after inserting a wait: %q", s)
	}
	edited = *c
	edited.Teardown = c.Teardown[1:]
	if s := Stale(f, &edited); s != "it has teardown 2: call getMeetingInfo where the case has teardown 1: call getMeetingInfo" {
		t.Errorf("stale after dropping a teardown step: %q", s)
	}
	edited = *c
	edited.Teardown = nil
	if s := Stale(f, &edited); s != "it has teardown 2: call getMeetingInfo where the case has nothing" {
		t.Errorf("stale with a step gone: %q", s)
	}
	edited = *c
	edited.Teardown = append(append([]spec.Step{}, c.Teardown...), spec.Step{Kind: spec.KindCall, Call: &spec.CallStep{HasCall: true, Call: "end"}})
	if s := Stale(f, &edited); s != "" {
		t.Errorf("an added teardown step (off) made it stale: %q", s)
	}
}

func TestLeaks(t *testing.T) {
	for line, want := range map[string]bool{
		`/response/meetingName "${salt}"`:     true,
		`/response/meetingName "x[salt]"`:     true,
		"header X-Key [secret:apiKey]":        true,
		`/response/meetingName "${uid}-salt"`: false,
	} {
		if got := Leaks([]string{"status 200", line}); got != want {
			t.Errorf("Leaks(%q) = %v", line, got)
		}
	}
}

func TestWriteAndList(t *testing.T) {
	dir := filepath.Join(t.TempDir(), "golden")
	name := filepath.Join(dir, "create", "create.x.y.txt")
	if wrote, err := Write(name, []byte("one\n")); err != nil || !wrote {
		t.Fatalf("first write: %v %v", wrote, err)
	}
	if wrote, err := Write(name, []byte("one\n")); err != nil || wrote {
		t.Errorf("same bytes again: wrote=%v err=%v; want no write", wrote, err)
	}
	if wrote, err := Write(name, []byte("two\n")); err != nil || !wrote {
		t.Errorf("new bytes: wrote=%v err=%v", wrote, err)
	}
	if data, _ := os.ReadFile(name); string(data) != "two\n" {
		t.Errorf("file holds %q", data)
	}
	entries, _ := os.ReadDir(filepath.Dir(name))
	if len(entries) != 1 {
		t.Errorf("left %d files behind, want 1", len(entries))
	}
	got, err := List(dir)
	if err != nil || !reflect.DeepEqual(got, map[string]string{"create.x.y": name}) {
		t.Errorf("List = %v, %v", got, err)
	}
	if got, err := List(filepath.Join(dir, "missing")); err != nil || len(got) != 0 {
		t.Errorf("List(missing) = %v, %v", got, err)
	}
}

func TestPresenceLabels(t *testing.T) {
	c := loadCases(t, `id: create.x.labels
title: t
endpoint: create
class: contract
steps:
  - presence: {action: join, as: ann, args: {meetingID: m, fullName: Ann}}
  - graphql: {as: ann, query: "query Me { user_current { name } }"}
  - graphql: {as: ann, query: "mutation Leave { userLeaveMeeting }"}
teardown:
  - presence: {action: disconnect, as: ann}
`)[0]
	want := "step 1: presence join as ann\nstep 2: graphql query Me as ann\nstep 3: graphql mutation Leave as ann"
	if got := titles(Sections(c)); got != want {
		t.Errorf("got:\n%s\nwant:\n%s", got, want)
	}
}

// A bus step's select is in its label, so a recording made with another
// select is stale. A path can go through a list's items.
func TestBusSelectLabel(t *testing.T) {
	src := `id: create.x.select
title: t
endpoint: create
class: contract
steps:
  - bus: {name: MeetingCreatedEvtMsg, meetingId: i, within: 1s}
    select: [$.core.body.props.voiceProp, "$.core.body.props.groups[].groupId"]
  - bus: {name: MeetingEndedEvtMsg, meetingId: i, within: 1s}
`
	c := loadCases(t, src)[0]
	want := "step 1: bus MeetingCreatedEvtMsg select $.core.body.props.voiceProp, $.core.body.props.groups[].groupId\nstep 2: bus MeetingEndedEvtMsg"
	if got := titles(Sections(c)); got != want {
		t.Errorf("got:\n%s\nwant:\n%s", got, want)
	}
	f, err := Build(c, "fake", []Step{{Key: Key{"steps", 0}, Lines: []string{"a"}}, {Key: Key{"steps", 1}, Lines: []string{"b"}}})
	if err != nil {
		t.Fatal(err)
	}
	other := loadCases(t, strings.Replace(src, "$.core.body.props.voiceProp, ", "", 1))[0]
	want = "it has step 1: bus MeetingCreatedEvtMsg select $.core.body.props.voiceProp, $.core.body.props.groups[].groupId" +
		" where the case has step 1: bus MeetingCreatedEvtMsg select $.core.body.props.groups[].groupId"
	if s := Stale(f, other); s != want {
		t.Errorf("stale after changing the select: %q", s)
	}
}
