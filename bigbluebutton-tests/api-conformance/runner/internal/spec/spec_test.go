package spec

import (
	"encoding/json"
	"os"
	"path/filepath"
	"reflect"
	"regexp"
	"strconv"
	"strings"
	"testing"
	"time"
)

const (
	exampleCases    = "../../testdata/cases"
	exampleFixtures = "../../testdata/fixtures"
)

var wantRe = regexp.MustCompile(`(?m)^# want: (\d+): (.*)$`)

// Each file in testdata/invalid lists the problems it must produce, as
// "# want: LINE: TEXT" comments, and must produce no others.
func TestInvalidCases(t *testing.T) {
	files, err := filepath.Glob("testdata/invalid/*.yaml")
	if err != nil || len(files) == 0 {
		t.Fatalf("no invalid cases found: %v", err)
	}
	for _, file := range files {
		t.Run(filepath.Base(file), func(t *testing.T) {
			data, err := os.ReadFile(file)
			if err != nil {
				t.Fatal(err)
			}
			cases, probs := LoadBytes(file, data, Options{FixturesDir: exampleFixtures})
			if len(cases) != 0 {
				t.Errorf("loaded %d case(s) from an invalid file", len(cases))
			}
			wants := wantRe.FindAllStringSubmatch(string(data), -1)
			if len(wants) == 0 {
				t.Fatal("the file has no # want: lines")
			}
			for _, w := range wants {
				line, _ := strconv.Atoi(w[1])
				found := false
				for _, p := range probs {
					if p.Line == line && strings.Contains(p.Msg, w[2]) {
						found = true
					}
				}
				if !found {
					t.Errorf("missing problem at line %d containing %q; got:\n%s", line, w[2], dump(probs))
				}
			}
			if len(probs) != len(wants) {
				t.Errorf("got %d problem(s), want %d:\n%s", len(probs), len(wants), dump(probs))
			}
		})
	}
}

func dump(probs []Problem) string {
	var b strings.Builder
	for _, p := range probs {
		b.WriteString("  " + p.String() + "\n")
	}
	return b.String()
}

func loadExamples(t *testing.T) map[string]*Case {
	t.Helper()
	res, err := LoadDir(exampleCases, Options{FixturesDir: exampleFixtures})
	if err != nil {
		t.Fatal(err)
	}
	if len(res.Problems) > 0 {
		t.Fatalf("example cases have problems:\n%s", dump(res.Problems))
	}
	byID := map[string]*Case{}
	for _, c := range res.Cases {
		byID[c.ID] = c
	}
	return byID
}

func TestExampleCases(t *testing.T) {
	byID := loadExamples(t)
	if len(byID) != 24 {
		t.Errorf("loaded %d example cases, want 24", len(byID))
	}
}

func TestBusSelect(t *testing.T) {
	b := loadExamples(t)["create.props.selected"].Steps[1].Bus
	if want := []string{"$.core.body.props.voiceProp", "$.core.body.props.noSuchProp"}; b == nil || !reflect.DeepEqual(b.Select, want) {
		t.Errorf("bus step = %+v, want select %q", b, want)
	}
}

func TestVariants(t *testing.T) {
	byID := loadExamples(t)

	for _, v := range []struct{ id, len, rc string }{{"1", "1", "FAILED"}, {"256", "256", "SUCCESS"}} {
		c := byID["create.validation.name-length-"+v.id]
		if c == nil {
			t.Fatalf("variant %s missing", v.id)
		}
		if c.Variant != v.id || c.Vars["len"] != v.len {
			t.Errorf("variant %s: Variant=%q Vars=%v", v.id, c.Variant, c.Vars)
		}
		call := c.Steps[0].Call
		// The variant var inside a function call resolves at run time.
		if got := call.Params[1]; got != (KV{"name", `${repeat("n", len)}`}) {
			t.Errorf("variant %s: name param = %+v", v.id, got)
		}
		if got := c.Steps[0].Expect.Returncode.Arg; got != v.rc {
			t.Errorf("variant %s: returncode = %q, want %q", v.id, got, v.rc)
		}
	}

	missing := byID["create.validation.meeting-id-missing"]
	if got := missing.Steps[0].Call.Params; !reflect.DeepEqual(got, []KV{{"name", "n"}}) {
		t.Errorf("a null var should remove its param; params = %+v", got)
	}
	comma := byID["create.validation.meeting-id-with-comma"]
	if comma.Class != "compat" || missing.Class != "contract" {
		t.Errorf("class override: with-comma=%q missing=%q", comma.Class, missing.Class)
	}
	if !reflect.DeepEqual(comma.Tags, []string{"ci"}) || len(missing.Tags) != 0 {
		t.Errorf("tags: with-comma=%v missing=%v", comma.Tags, missing.Tags)
	}
	if got := comma.Steps[0].Call.Params[0].Value; got != "a,b" {
		t.Errorf("meetingID = %q", got)
	}

	sign := byID["getMeetings.checksum.modes-sha384-middle"].Steps[0].Call.Sign
	if sign != (Sign{Alg: "sha384", Mode: "valid", Position: "middle", Set: true}) {
		t.Errorf("sign = %+v", sign)
	}
}

// An unquoted ${var} takes the YAML type of its value, so a variant can
// fill a number field; a quoted one stays a string. Unquoted templates only
// work in block style: in flow style ({...}) the braces are YAML syntax.
func TestVariantTyping(t *testing.T) {
	src := `id: create.x.y
title: t
endpoint: create
class: contract
variants:
  - {id: a, vars: {n: 2, code: 404, ver: "1.0"}}
steps:
  - call: create
    params: {v: "${ver}", w: '${ver}'}
    expect:
      status: ${code}
      xpath:
        /response/x:
          count: ${n}
`
	cases, probs := LoadBytes("typing.yaml", []byte(src), Options{})
	if len(probs) > 0 {
		t.Fatalf("problems:\n%s", dump(probs))
	}
	e := cases[0].Steps[0].Expect
	if e.Status.Arg != "404" || e.XPath[0].M.N != 2 {
		t.Errorf("status = %+v, count = %+v", e.Status, e.XPath[0].M)
	}
	if p := cases[0].Steps[0].Call.Params; p[0].Value != "1.0" || p[1].Value != "1.0" {
		t.Errorf("params = %+v", p)
	}

	// A var keeps the type it has in vars: an empty string stays a string,
	// not null, and a quoted "0x10" isn't a number.
	src = `id: create.x.y
title: t
endpoint: create
class: contract
variants:
  - {id: a, vars: {v: "", n: 0x10}}
steps:
  - call: create
    headers:
      Accept: ${v}
    expect:
      xpath:
        /response/x:
          count: ${n}
`
	cases, probs = LoadBytes("typing.yaml", []byte(src), Options{})
	if len(probs) > 0 {
		t.Fatalf("problems:\n%s", dump(probs))
	}
	if h := cases[0].Steps[0].Call.Headers; len(h) != 1 || h[0].Remove || h[0].Value != "" {
		t.Errorf("headers = %+v", h)
	}
	if n := cases[0].Steps[0].Expect.XPath[0].M.N; n != 16 {
		t.Errorf("count = %d", n)
	}
	src = strings.Replace(src, "n: 0x10", `n: "0x10"`, 1)
	if _, probs = LoadBytes("typing.yaml", []byte(src), Options{}); !strings.Contains(dump(probs), "count: got string, want integer") {
		t.Errorf("a quoted number as a count: %s", dump(probs))
	}
}

func TestMergeKeys(t *testing.T) {
	c := loadExamples(t)["getMeetingInfo.fields.metadata"]
	keys := func(kvs []KV) []string {
		var out []string
		for _, kv := range kvs {
			out = append(out, kv.Key)
		}
		return out
	}
	if got, want := keys(c.Steps[0].Call.Params), []string{"meetingID", "name", "meta_Color"}; !reflect.DeepEqual(got, want) {
		t.Errorf("create params = %v, want %v", got, want)
	}
	if got, want := keys(c.Teardown[0].Call.Params), []string{"meetingID", "name"}; !reflect.DeepEqual(got, want) {
		t.Errorf("end params = %v, want %v", got, want)
	}

	src := `id: create.x.y
title: t
endpoint: create
class: contract
defs:
  base: &base {a: "1", b: "2"}
steps:
  - call: create
    params:
      b: own
      <<: *base
      c: "3"
`
	cases, probs := LoadBytes("merge.yaml", []byte(src), Options{})
	if len(probs) > 0 {
		t.Fatalf("problems:\n%s", dump(probs))
	}
	want := []KV{{"b", "own"}, {"a", "1"}, {"c", "3"}}
	if got := cases[0].Steps[0].Call.Params; !reflect.DeepEqual(got, want) {
		t.Errorf("params = %+v, want %+v (explicit keys win, merged keys land at <<)", got, want)
	}
}

func TestImplicitRequires(t *testing.T) {
	c := loadExamples(t)["create.props.mute-on-start"]
	want := []string{"akka", "bus", "redis", "presence", "fs", "callbacks"}
	if !reflect.DeepEqual(c.Requires, want) {
		t.Errorf("requires = %v, want %v", c.Requires, want)
	}
	var kinds []StepKind
	for _, s := range c.Steps {
		kinds = append(kinds, s.Kind)
	}
	if want := []StepKind{KindCall, KindBus, KindRedis, KindPresence, KindGraphQL, KindCall, KindFS, KindSink, KindEnv}; !reflect.DeepEqual(kinds, want) {
		t.Errorf("kinds = %v", kinds)
	}
	if b := c.Steps[1].Bus; b == nil || !reflect.DeepEqual(*b, BusStep{Name: "MeetingCreatedEvtMsg", MeetingID: "${intId}", Within: 5 * time.Second}) {
		t.Errorf("bus step = %+v", b)
	}
	if r := c.Steps[2]; r.Redis == nil || r.Redis.Key != "meeting:info:${intId}" || len(r.Expect.Hash) != 1 || r.Expect.TTL == nil || r.Expect.TTL.Arg != "-1" {
		t.Errorf("redis step = %+v, expect %+v", r.Redis, r.Expect)
	}
	if f := c.Steps[6]; f.FS == nil || f.FS.Path != "recording/status/recorded/${intId}*.done" || f.Expect.Exists == nil || !*f.Expect.Exists {
		t.Errorf("fs step = %+v", f.FS)
	}
	if c.Steps[6].Golden != "document" {
		t.Errorf("golden = %q", c.Steps[6].Golden)
	}
}

func TestCallDecoding(t *testing.T) {
	byID := loadExamples(t)
	join := byID["join.redirect.session-token"].Steps[1].Call
	if join.Client != "ann" || join.Method != "GET" || join.Sign.Set {
		t.Errorf("join = %+v", join)
	}
	if want := []Header{{Name: "Accept", Remove: true}, {Name: "X-Forwarded-For", Value: "203.0.113.7"}}; !reflect.DeepEqual(join.Headers, want) {
		t.Errorf("headers = %+v", join.Headers)
	}
	caps := byID["join.redirect.session-token"].Steps[1].Capture
	if len(caps) != 3 || caps[0] != (Capture{Name: "sessionToken", Expr: "location:query.sessionToken", Line: caps[0].Line}) {
		t.Errorf("captures = %+v", caps)
	}
	if u := byID["join.redirect.session-token"].Steps[4].Call; u.URL != "${joinUrl}" || u.HasCall {
		t.Errorf("url step = %+v", u)
	}
	version := byID["version.index.fields"].Steps[0].Call
	if !version.HasCall || version.Call != "" {
		t.Errorf("version call = %+v", version)
	}

	bodies := byID["create.body.forms"].Steps
	var kinds []string
	for _, s := range bodies {
		kinds = append(kinds, s.Call.Body.Kind)
	}
	if want := []string{"xml", "xmlFile", "form", "json", "raw", "multipart"}; !reflect.DeepEqual(kinds, want) {
		t.Errorf("body kinds = %v", kinds)
	}
	wantJSON := []Member{
		{"meta", []Member{{"k", "v"}}},
		{"list", []any{json.Number("1"), true, "${uid}"}},
	}
	if got := bodies[3].Call.Body.JSON; !reflect.DeepEqual(got, wantJSON) {
		t.Errorf("json body = %#v", got)
	}
	if b := bodies[4].Call.Body; b.ContentType != "text/xml" || !b.Chunked {
		t.Errorf("raw body = %+v", b)
	}
	mp := bodies[5].Call.Body.Multipart
	if len(mp.Files) != 2 || mp.Files[0].Path != "captions/sample.vtt" || !mp.Files[1].HasContent || mp.Files[1].Filename != "x.vtt" {
		t.Errorf("multipart = %+v", mp)
	}

	ev := byID["isMeetingRunning.lifecycle.after-end"].Steps[3].Call.Eventually
	if ev == nil || ev.Within.String() != "5s" || ev.Every.String() != "200ms" || ev.Until.XPath[0].M.Arg != "false" {
		t.Errorf("eventually = %+v", ev)
	}
	if w := byID["isMeetingRunning.lifecycle.after-end"].Steps[2]; w.Kind != KindWait || w.Wait.String() != "100ms" {
		t.Errorf("wait = %+v", w)
	}
	msg := byID["getMeetings.checksum.errors"].Steps[4].Expect.Message
	if msg.Op != "oneOf" || len(msg.Args) != 2 {
		t.Errorf("message matcher = %+v", msg)
	}
}

func TestDuplicateIDs(t *testing.T) {
	dir := t.TempDir()
	body := "id: create.x.y\ntitle: t\nendpoint: create\nclass: contract\nsteps: [{call: create}]\n"
	for _, name := range []string{"a.yaml", "b.yml"} {
		if err := os.WriteFile(filepath.Join(dir, name), []byte(body), 0o644); err != nil {
			t.Fatal(err)
		}
	}
	if err := os.Mkdir(filepath.Join(dir, ".hidden"), 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(filepath.Join(dir, ".hidden", "c.yaml"), []byte("not: a case"), 0o644); err != nil {
		t.Fatal(err)
	}
	res, err := LoadDir(dir, Options{})
	if err != nil {
		t.Fatal(err)
	}
	if res.Files != 2 || len(res.Cases) != 1 || len(res.Problems) != 1 || !strings.Contains(res.Problems[0].Msg, `case id "create.x.y" is already used by`) {
		t.Errorf("files=%d cases=%d problems:\n%s", res.Files, len(res.Cases), dump(res.Problems))
	}
}

// A serial case runs alone, so its side-effect steps may look at every
// meeting's messages and files.
func TestSerialSideEffects(t *testing.T) {
	src := `id: create.x.y
title: t
endpoint: create
class: contract
tags: [serial]
steps:
  - bus: {name: MeetingCreatedEvtMsg, within: 1s}
  - fs: {path: "recording/status/ended/*.done", within: 1s}
    expect: {absent: true}
`
	cases, probs := LoadBytes("serial.yaml", []byte(src), Options{})
	if len(probs) != 0 || len(cases) != 1 {
		t.Errorf("cases=%d problems:\n%s", len(cases), dump(probs))
	}
}
