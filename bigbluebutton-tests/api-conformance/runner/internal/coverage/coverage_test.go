package coverage

import (
	"bytes"
	"errors"
	"flag"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

var update = flag.Bool("update", false, "rewrite the golden files")

func load(t *testing.T) (*Report, *Config) {
	t.Helper()
	f, err := os.Open("testdata/jacoco.xml")
	if err != nil {
		t.Fatal(err)
	}
	defer f.Close()
	rep, err := ParseXML(f)
	if err != nil {
		t.Fatal(err)
	}
	cfg, err := LoadConfig("testdata/triage.yaml")
	if err != nil {
		t.Fatal(err)
	}
	return rep, cfg
}

func TestParseXML(t *testing.T) {
	rep, _ := load(t)
	if rep.Name != "bbb-web" || len(rep.Methods) != 9 {
		t.Fatalf("name %q, %d methods", rep.Name, len(rep.Methods))
	}
	m := rep.Methods[0]
	if m.Class != "org.bigbluebutton.api.MeetingService" || m.Package != "org.bigbluebutton.api" || m.Name != "createMeeting" ||
		!m.Reached || m.Branches != (Counter{3, 1}) || m.Line != 550 {
		t.Errorf("first method %+v", m)
	}
	// The package's own line counter; its source file's isn't added again.
	if l := rep.Lines["org.bigbluebutton.api"]; l != (Counter{9, 5}) {
		t.Errorf("api package lines %+v", l)
	}
	if rep.Methods[1].Reached {
		t.Error("endMeeting has METHOD covered 0, so it isn't reached")
	}
}

func TestSummarize(t *testing.T) {
	rep, cfg := load(t)
	s, probs := Summarize(rep, cfg)
	if len(probs) > 0 {
		t.Fatalf("problems: %v", probs)
	}
	// common2 is out of scope; Thing.copy is ignored.
	if len(s.Packages) != 3 || s.Ignored != 1 {
		t.Fatalf("%d packages, %d ignored", len(s.Packages), s.Ignored)
	}
	api := s.Packages[0]
	if api.Package != "org.bigbluebutton.api" || api.Methods != (Counter{1, 3}) || api.Untriaged != 1 ||
		api.Triaged[OutcomeCase] != 1 || api.Triaged[OutcomeExcluded] != 1 {
		t.Errorf("api row %+v", api)
	}
	if got := s.Untriaged; len(got) != 1 || got[0].ID(true) != "org.bigbluebutton.api.MeetingService#log(Ljava/lang/String;I)V" {
		t.Errorf("untriaged %+v", got)
	}
	// Lines are the packages' counters: the two log overloads share a
	// line, which counts once (their own counters add up to 2). Branches
	// are the kept methods'.
	if s.Total.Methods != (Counter{3, 4}) || s.Total.Lines != (Counter{90, 14}) || s.Total.Branches != (Counter{43, 8}) {
		t.Errorf("total %+v", s.Total)
	}
}

func TestTriageProblems(t *testing.T) {
	rep, cfg := load(t)
	cfg.Methods = append(cfg.Methods,
		Entry{Class: "org.bigbluebutton.api.MeetingService", Method: "endMeeting", Outcome: OutcomeCase, Ref: "x"}, // twice
		Entry{Class: "org.bigbluebutton.api.MeetingService", Method: "log", Outcome: OutcomeExcluded, Reason: "x"}, // overloaded
		Entry{Class: "org.bigbluebutton.api.Nope", Method: "x", Outcome: OutcomeExcluded, Reason: "x"},             // unknown
		Entry{Class: "org.bigbluebutton.api2.domain.Thing", Method: "copy", Outcome: OutcomeExcluded, Reason: "x"}, // ignored
		Entry{Class: "org.bigbluebutton.common2.msgs.Msg", Method: "apply", Outcome: OutcomeExcluded, Reason: "x"}, // out of scope
		Entry{Class: "org.bigbluebutton.api.MeetingService", Method: "log", Desc: "()V", Outcome: OutcomeExcluded, Reason: "x"},
		Entry{Class: "org.bigbluebutton.api.MeetingService", Method: "createMeeting", Outcome: OutcomeCase, Ref: "x"}, // reached
		// The same method again, now with its desc.
		Entry{Class: "org.bigbluebutton.api.MeetingService", Method: "endMeeting", Desc: "(Ljava/lang/String;)V", Outcome: OutcomeExcluded, Reason: "x"},
		// An ignored method named with its desc.
		Entry{Class: "org.bigbluebutton.api2.domain.Thing", Method: "copy", Desc: "()Lorg/bigbluebutton/api2/domain/Thing;", Outcome: OutcomeExcluded, Reason: "x"},
	)
	s, probs := Summarize(rep, cfg)
	want := []string{"claimed by an earlier entry", "overloaded; give desc", "Nope#x: no such method", "ignore rule", "Msg#apply: no such method",
		"no overload has this desc", "claimed by an earlier entry", "ignore rule"}
	if len(probs) != len(want) {
		t.Fatalf("problems %q", probs)
	}
	for i, w := range want {
		if !strings.Contains(probs[i], w) {
			t.Errorf("problem %d = %q, want %q", i, probs[i], w)
		}
	}
	if len(s.Stale) != 1 || !strings.HasSuffix(s.Stale[0], "#createMeeting") {
		t.Errorf("stale %v", s.Stale)
	}
}

func TestLoadConfigProblems(t *testing.T) {
	dir := t.TempDir()
	name := filepath.Join(dir, "triage.yaml")
	for _, tt := range []struct{ yaml, want string }{
		{"methods: []\n", "scope: name at least one package"},
		{"scope: [a]\nignore: [{classes: a, methods: '(', reason: r}]\n", "ignore[0].methods"},
		{"scope: [a]\nignore: [{classes: a, methods: x}]\n", "say why"},
		{"scope: [a]\nmethods: [{class: a.B, method: m, outcome: case}]\n", "needs ref"},
		{"scope: [a]\nmethods: [{class: a.B, method: m, outcome: excluded}]\n", "needs reason"},
		{"scope: [a]\nmethods: [{class: a.B, method: m, outcome: maybe}]\n", "isn't one of"},
		{"scope: [a]\nextra: 1\n", "not found"},
	} {
		if err := os.WriteFile(name, []byte(tt.yaml), 0o644); err != nil {
			t.Fatal(err)
		}
		if _, err := LoadConfig(name); err == nil || !strings.Contains(err.Error(), tt.want) {
			t.Errorf("%q: err %v, want %q", tt.yaml, err, tt.want)
		}
	}
}

func TestBaseline(t *testing.T) {
	rep, cfg := load(t)
	s, _ := Summarize(rep, cfg)
	var buf bytes.Buffer
	if err := WriteBaseline(&buf, s.Baseline(cfg.Scope)); err != nil {
		t.Fatal(err)
	}
	name := filepath.Join(t.TempDir(), "baseline.json")
	if err := os.WriteFile(name, buf.Bytes(), 0o644); err != nil {
		t.Fatal(err)
	}
	b, err := LoadBaseline(name)
	if err != nil {
		t.Fatal(err)
	}
	if drops := Compare(b, s, cfg, 0); len(drops) != 0 {
		t.Errorf("a run compared with its own baseline drops: %+v", drops)
	}
	// Fewer reached methods in api: a drop there and in the total, past
	// the tolerance; within a wide tolerance, none.
	b.Packages["org.bigbluebutton.api"] = Totals{Methods: Counter{3, 1}}
	b.Total.Methods = Counter{6, 1}
	drops := Compare(b, s, cfg, 0.5)
	if len(drops) != 2 || drops[0].Package != "org.bigbluebutton.api" || drops[1].Package != "total" {
		t.Errorf("drops %+v", drops)
	}
	if drops := Compare(b, s, cfg, 60); len(drops) != 0 {
		t.Errorf("within tolerance: %+v", drops)
	}
	// A package gone from the report dropped to nothing; one no longer in
	// scope is left out.
	b.Packages["org.bigbluebutton.api.gone"] = Totals{Methods: Counter{1, 0}}
	b.Packages["org.bigbluebutton.elsewhere"] = Totals{Methods: Counter{1, 0}}
	if drops := Compare(b, s, cfg, 60); len(drops) != 1 || drops[0].Package != "org.bigbluebutton.api.gone" {
		t.Errorf("gone package: %+v", drops)
	}
	if why := b.Mismatch(cfg); why != "" {
		t.Errorf("mismatch %q", why)
	}
	b.Scope = b.Scope[1:]
	if why := b.Mismatch(cfg); !strings.Contains(why, "scope") {
		t.Errorf("mismatch %q, want the scope", why)
	}
}

func TestMarkdown(t *testing.T) {
	rep, cfg := load(t)
	s, _ := Summarize(rep, cfg)
	b := s.Baseline(cfg.Scope)
	b.Packages["org.bigbluebutton.api"] = Totals{Methods: Counter{3, 1}}
	var buf bytes.Buffer
	if err := WriteMarkdown(&buf, s, Compare(&b, s, cfg, 0.5), true); err != nil {
		t.Fatal(err)
	}
	buf.WriteString("\n---\n")
	if err := WriteUntriaged(&buf, s); err != nil {
		t.Fatal(err)
	}
	golden := "testdata/summary.md"
	if *update {
		if err := os.WriteFile(golden, buf.Bytes(), 0o644); err != nil {
			t.Fatal(err)
		}
	}
	want, err := os.ReadFile(golden)
	if err != nil {
		t.Fatal(err)
	}
	if buf.String() != string(want) {
		t.Errorf("got:\n%s\nwant:\n%s", buf.String(), want)
	}
}

// failAfter accepts n bytes, then fails every write.
type failAfter struct{ n int }

func (f *failAfter) Write(p []byte) (int, error) {
	if len(p) > f.n {
		n := f.n
		f.n = 0
		return n, errors.New("disk full")
	}
	f.n -= len(p)
	return len(p), nil
}

func TestWriteErrors(t *testing.T) {
	rep, cfg := load(t)
	s, _ := Summarize(rep, cfg)
	// A failure at the first write and one part-way through both surface.
	for _, n := range []int{0, 100} {
		if err := WriteMarkdown(&failAfter{n}, s, nil, false); err == nil {
			t.Errorf("WriteMarkdown after %d bytes: no error", n)
		}
	}
	if err := WriteUntriaged(&failAfter{0}, s); err == nil {
		t.Error("WriteUntriaged: no error")
	}
}

func TestResolveClosures(t *testing.T) {
	f, err := os.Open("testdata/closures.xml")
	if err != nil {
		t.Fatal(err)
	}
	defer f.Close()
	rep, err := ParseXML(f)
	if err != nil {
		t.Fatal(err)
	}
	if n := ResolveClosures(rep, []string{"testdata/nowhere", "testdata/src"}); n != 1 {
		t.Errorf("%d unresolved, want 1 (Lost.groovy isn't there)", n)
	}
	var got []string
	for _, m := range rep.Methods {
		got = append(got, m.ID(true))
	}
	want := []string{
		// A closure's constructor keeps its class's name.
		"org.bigbluebutton.web.controllers.DemoController$_closure1#<init>(Ljava/lang/Object;Ljava/lang/Object;)V",
		// The action and its nested closures, numbered in line order, then
		// on one line by the compiler's numbers as numbers (9 before 10).
		"org.bigbluebutton.web.controllers.DemoController#create{}{1}",
		"org.bigbluebutton.web.controllers.DemoController#create{}{3}",
		"org.bigbluebutton.web.controllers.DemoController#create{}{2}",
		"org.bigbluebutton.web.controllers.DemoController#create{}{5}",
		"org.bigbluebutton.web.controllers.DemoController#create{}{4}",
		// A static field's closure, placed by its line.
		"org.bigbluebutton.web.controllers.DemoController#mappings{}{1}",
		// A closure in a method carries the method's name.
		"org.bigbluebutton.web.controllers.DemoController#helper{}{1}",
		// After an empty class, a class whose first member is typed: a
		// closure field is placed at the class body's indent, not at a
		// local declaration's.
		"org.bigbluebutton.web.controllers.TypedController#helper{}{1}",
		"org.bigbluebutton.web.controllers.TypedController#create{}{1}",
		"org.bigbluebutton.web.controllers.Lost$_closure1#doCall()Ljava/lang/Object;",
		// A tab-indented file with CRLF line ends.
		"org.bigbluebutton.web.services.DemoService#deleteDirectory{}{1}",
		// Java lambdas and Scala functions, by member, line and number.
		"org.bigbluebutton.api.Svc#start->{2}",
		"org.bigbluebutton.api.Svc#start->{1}",
		"org.bigbluebutton.api.Svc#stop->{1}",
		"org.bigbluebutton.api.Svc#build=>{2}",
		"org.bigbluebutton.api.Svc#build=>{1}",
	}
	if strings.Join(got, "\n") != strings.Join(want, "\n") {
		t.Errorf("got:\n%s\nwant:\n%s", strings.Join(got, "\n"), strings.Join(want, "\n"))
	}
	// A triage entry names a closure by member and number.
	cfg := &Config{Scope: []string{"org.bigbluebutton.web"}, Methods: []Entry{
		{Class: "org.bigbluebutton.web.controllers.DemoController", Method: "create{}", Desc: "{3}", Outcome: OutcomeExcluded, Reason: "x"},
		{Class: "org.bigbluebutton.web.controllers.DemoController", Method: "helper{}", Outcome: OutcomeExcluded, Reason: "x"},
	}}
	s, probs := Summarize(rep, cfg)
	if len(probs) > 0 || s.Total.Untriaged != 5 {
		t.Errorf("problems %v, %d untriaged (want create{}{4,5}, mappings{}, Lost and DemoService's)", probs, s.Total.Untriaged)
	}
}
