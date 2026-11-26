package expectations

import (
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/report"
)

func write(t *testing.T, body string) string {
	t.Helper()
	p := filepath.Join(t.TempDir(), "x.yaml")
	if err := os.WriteFile(p, []byte(body), 0o644); err != nil {
		t.Fatal(err)
	}
	return p
}

func TestLoadErrors(t *testing.T) {
	for body, want := range map[string]string{
		"expected: []\n":                                                  "target is required",
		"target: t\nexpected: [{reason: r}]\n":                            "id is required",
		"target: t\nexpected: [{id: a}]\n":                                "reason is required",
		"target: t\nexpected: [{id: a, reason: r}, {id: a, reason: r}]\n": "listed twice",
		"target: t\nexpected: [{id: '[', reason: r}]\n":                   "bad glob",
		"target: t\nexpectd: []\n":                                        "expectd",
	} {
		if _, err := Load(write(t, body)); err == nil || !strings.Contains(err.Error(), want) {
			t.Errorf("Load(%q) error = %v, want %q", body, err, want)
		}
	}
}

func TestApply(t *testing.T) {
	f, err := Load(write(t, `target: web
expected:
  - {id: "join.*", reason: join is missing}
  - {id: join.redirect.exact, reason: a known defect, issue: "https://example.com/1"}
  - {id: create.validation.name-length, reason: base id}
  - {id: end.never.used, reason: stale}
`))
	if err != nil {
		t.Fatal(err)
	}
	run := &report.Run{Cases: []*report.CaseResult{
		{ID: "join.redirect.exact", Status: report.Pass},
		{ID: "join.redirect.glob-fails", Status: report.Fail, Reason: "step 1: x"},
		{ID: "join.redirect.glob-passes", Status: report.Pass},
		{ID: "join.redirect.errors", Status: report.Error},
		{ID: "create.validation.name-length-257", Variant: "257", Status: report.Fail, Reason: "r"},
		{ID: "getMeetings.x.y", Status: report.Fail},
	}}
	var loaded []Case
	for _, c := range run.Cases {
		loaded = append(loaded, CaseOf(c))
	}
	f.Apply(run, loaded)
	want := []report.Status{report.XPass, report.XFail, report.Pass, report.Error, report.XFail, report.Fail}
	for i, c := range run.Cases {
		if c.Status != want[i] {
			t.Errorf("%s: status %s, want %s", c.ID, c.Status, want[i])
		}
	}
	if e := run.Cases[4].Expected; e == nil || !e.Group {
		t.Errorf("a base-ID entry should mark the variant as part of a group: %+v", e)
	}
	if e := run.Cases[0].Expected; e == nil || e.Glob || e.Issue != "https://example.com/1" {
		t.Errorf("exact entry = %+v", e)
	}
	if e := run.Cases[2].Expected; e == nil || !e.Glob {
		t.Errorf("a pass covered by a glob should be noted: %+v", e)
	}
	if !strings.HasPrefix(run.Cases[1].Reason, "join is missing (step 1: x)") {
		t.Errorf("reason = %q", run.Cases[1].Reason)
	}
	if !strings.Contains(run.Cases[0].Reason, "remove the entry") {
		t.Errorf("reason = %q", run.Cases[0].Reason)
	}
	if len(run.Warnings) != 1 || !strings.Contains(run.Warnings[0], "end.never.used matches no case") {
		t.Errorf("warnings = %v", run.Warnings)
	}
	if run.Counts.XPassed != 1 || run.Counts.XFailed != 2 || run.OK() {
		t.Errorf("counts = %+v, OK = %v", run.Counts, run.OK())
	}
}

// Variants listed by their base ID: one passing while another fails stays
// PASS; only when every variant runs and passes is the entry stale.
func TestBaseIDGroup(t *testing.T) {
	f, err := Load(write(t, "target: web\nexpected:\n  - {id: create.v.n, reason: some lengths fail}\n"))
	if err != nil {
		t.Fatal(err)
	}
	mixed := &report.Run{Cases: []*report.CaseResult{
		{ID: "create.v.n-1", Variant: "1", Status: report.Fail},
		{ID: "create.v.n-2", Variant: "2", Status: report.Pass},
	}}
	f.Apply(mixed, []Case{CaseOf(mixed.Cases[0]), CaseOf(mixed.Cases[1])})
	if mixed.Cases[0].Status != report.XFail || mixed.Cases[1].Status != report.Pass || !mixed.OK() {
		t.Errorf("mixed group: %s %s", mixed.Cases[0].Status, mixed.Cases[1].Status)
	}
	allPass := &report.Run{Cases: []*report.CaseResult{
		{ID: "create.v.n-1", Variant: "1", Status: report.Pass},
		{ID: "create.v.n-2", Variant: "2", Status: report.Pass},
	}}
	f.Apply(allPass, []Case{CaseOf(allPass.Cases[0]), CaseOf(allPass.Cases[1])})
	if allPass.Cases[0].Status != report.XPass || allPass.Cases[1].Status != report.XPass || allPass.OK() {
		t.Errorf("all-pass group: %s %s", allPass.Cases[0].Status, allPass.Cases[1].Status)
	}
	// Running one variant (--id) says nothing about the others: the entry
	// may still be needed.
	one := &report.Run{Cases: []*report.CaseResult{{ID: "create.v.n-2", Variant: "2", Status: report.Pass}}}
	f.Apply(one, []Case{CaseFor("create.v.n-1", "1"), CaseFor("create.v.n-2", "2")})
	if one.Cases[0].Status != report.Pass || !one.OK() {
		t.Errorf("one variant of the group: %s", one.Cases[0].Status)
	}
	if CaseFor("a.b.c-x", "x") != (Case{ID: "a.b.c-x", BaseID: "a.b.c"}) || CaseFor("a.b.c", "") != (Case{ID: "a.b.c"}) {
		t.Error("CaseFor")
	}
}
