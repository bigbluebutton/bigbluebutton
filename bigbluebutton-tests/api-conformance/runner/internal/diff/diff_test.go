package diff

import (
	"testing"

	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/golden"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/normalize"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/report"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/target"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/tmpl"
)

// A case that ERRORs on a side before anything differs wasn't compared to
// its end, so it isn't identical, and it fails --fail-on-diff.
func TestErroredIsNotIdentical(t *testing.T) {
	col := func() *golden.Collector {
		return golden.NewCollector(&target.Target{Name: "t", BaseURL: "https://h"}, normalize.Default(), &tmpl.Redactor{})
	}
	run := func(name string, st report.Status, reason string) *report.Run {
		return &report.Run{Target: name, Cases: []*report.CaseResult{
			{ID: "getMeetings.x.ok", Status: report.Pass},
			{ID: "getMeetings.x.down", Status: st, Reason: reason},
		}}
	}
	rep := Compare(run("a", report.Error, "step 1: connection refused"), run("b", report.Error, "step 1: timeout"), col(), col())
	if c := rep.Cases[1]; c.Outcome != "errored" || c.Note != "A: step 1: connection refused; B: step 1: timeout" {
		t.Errorf("%+v", c)
	}
	if rep.Counts != (Counts{Identical: 1, Errored: 1}) || !rep.Differs() {
		t.Errorf("counts %+v, differs %t", rep.Counts, rep.Differs())
	}
	rep = Compare(run("a", report.Pass, ""), run("b", report.Pass, ""), col(), col())
	if rep.Counts != (Counts{Identical: 2}) || rep.Differs() {
		t.Errorf("both pass: counts %+v, differs %t", rep.Counts, rep.Differs())
	}
}
