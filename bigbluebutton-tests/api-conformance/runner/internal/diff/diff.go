// Package diff compares how two targets answer the same cases, on
// normalized responses, so it shows differences no check was written for.
package diff

import (
	"encoding/json"
	"fmt"
	"io"
	"sort"
	"strings"

	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/golden"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/report"
)

// Report is the comparison of two targets.
type Report struct {
	Sides    [2]string  `json:"targets"`
	Counts   Counts     `json:"counts"`
	Warnings []string   `json:"warnings,omitempty"` // from both runs, prefixed with the target
	Cases    []CaseDiff `json:"cases"`
}

// Counts tallies cases by outcome.
type Counts struct {
	Identical int `json:"identical"`
	Differing int `json:"differing"`
	OneSided  int `json:"one_sided"`
	Errored   int `json:"errored"`
	Skipped   int `json:"skipped"`
}

// CaseDiff is one case's comparison.
type CaseDiff struct {
	ID       string        `json:"id"`
	Endpoint string        `json:"endpoint"`
	Outcome  string        `json:"outcome"` // identical | differing | one-sided | errored | skipped
	StatusA  report.Status `json:"status_a"`
	StatusB  report.Status `json:"status_b"`
	Note     string        `json:"note,omitempty"`
	Steps    []StepDiff    `json:"steps,omitempty"`
}

// StepDiff is one step that differs.
type StepDiff struct {
	golden.Key
	Part string `json:"part,omitempty"` // what of the step differs, when not its answer
	Line int    `json:"line"`
	// Kind is differing, only-a or only-b.
	Kind string   `json:"kind"`
	Hunk []string `json:"hunk"` // "-" for A's lines, "+" for B's
}

// Compare builds the report from both runs, in the order of a's cases.
func Compare(a, b *report.Run, ca, cb *golden.Collector) *Report {
	rep := &Report{Sides: [2]string{a.Target, b.Target}}
	for _, run := range []*report.Run{a, b} {
		for _, w := range run.Warnings {
			rep.Warnings = append(rep.Warnings, run.Target+": "+w)
		}
	}
	resB := map[string]*report.CaseResult{}
	for _, c := range b.Cases {
		resB[c.ID] = c
	}
	for _, ra := range a.Cases {
		rb := resB[ra.ID]
		cd := CaseDiff{ID: ra.ID, Endpoint: ra.Endpoint, StatusA: ra.Status}
		if rb != nil {
			cd.StatusB = rb.Status
		}
		switch {
		case ra.Status == report.Skip || rb == nil || rb.Status == report.Skip:
			cd.Outcome = "skipped"
			cd.Note = skipNote(ra, rb)
			rep.Counts.Skipped++
			rep.Cases = append(rep.Cases, cd)
			continue
		}
		oneSided := false
		for _, part := range []struct {
			name   string
			ra, rb []golden.Step
		}{{"", ca.Steps(ra.ID), cb.Steps(ra.ID)}, {PropsPart, ca.Props(ra.ID), cb.Props(ra.ID)}} {
			for _, p := range golden.Pairs(part.ra, part.rb) {
				switch {
				case p.B == nil:
					cd.Steps = append(cd.Steps, StepDiff{Key: p.Key, Part: part.name, Line: p.A.Line, Kind: "only-a", Hunk: prefix("-", p.A.Lines)})
					oneSided = true
				case p.A == nil:
					cd.Steps = append(cd.Steps, StepDiff{Key: p.Key, Part: part.name, Line: p.B.Line, Kind: "only-b", Hunk: prefix("+", p.B.Lines)})
					oneSided = true
				default:
					if h := golden.Lines(p.A.Lines, p.B.Lines); len(h) > 0 {
						cd.Steps = append(cd.Steps, StepDiff{Key: p.Key, Part: part.name, Line: p.A.Line, Kind: "differing", Hunk: h})
					}
				}
			}
		}
		switch {
		case oneSided:
			cd.Outcome = "one-sided"
			rep.Counts.OneSided++
		case len(cd.Steps) > 0:
			cd.Outcome = "differing"
			rep.Counts.Differing++
		case ra.Status == report.Error || rb.Status == report.Error:
			// Nothing differs in what both got, but a side stopped short:
			// the steps after it weren't compared.
			cd.Outcome, cd.Note = "errored", errorNote(ra, rb)
			rep.Counts.Errored++
		default:
			cd.Outcome = "identical"
			rep.Counts.Identical++
		}
		rep.Cases = append(rep.Cases, cd)
	}
	return rep
}

func errorNote(a, b *report.CaseResult) string {
	var parts []string
	for _, side := range []struct {
		name string
		r    *report.CaseResult
	}{{"A", a}, {"B", b}} {
		if side.r.Status == report.Error {
			parts = append(parts, side.name+": "+side.r.Reason)
		}
	}
	return strings.Join(parts, "; ")
}

func skipNote(a, b *report.CaseResult) string {
	var parts []string
	if a.Status == report.Skip {
		parts = append(parts, "A: "+a.Reason)
	}
	if b == nil {
		parts = append(parts, "B: not run")
	} else if b.Status == report.Skip {
		parts = append(parts, "B: "+b.Reason)
	}
	return strings.Join(parts, "; ")
}

func prefix(p string, lines []string) []string {
	out := make([]string, len(lines))
	for i, l := range lines {
		out[i] = p + " " + l
	}
	return out
}

// Differs reports whether any case differs, was one-sided, or couldn't be
// compared to its end because a side ERRORed.
func (r *Report) Differs() bool { return r.Counts.Differing+r.Counts.OneSided+r.Counts.Errored > 0 }

// WriteConsole writes the summary and the cases that differ.
func (r *Report) WriteConsole(w io.Writer) {
	for _, c := range r.Cases {
		switch c.Outcome {
		case "differing", "one-sided":
			fmt.Fprintf(w, "%-9s %s (%s / %s)\n", strings.ToUpper(c.Outcome), c.ID, c.StatusA, c.StatusB)
		case "errored":
			fmt.Fprintf(w, "%-9s %s (%s / %s): %s\n", strings.ToUpper(c.Outcome), c.ID, c.StatusA, c.StatusB, c.Note)
		}
	}
	for _, warn := range r.Warnings {
		fmt.Fprintf(w, "warning: %s\n", warn)
	}
	fmt.Fprintf(w, "\n%s vs %s: %d identical, %d differing, %d one-sided, %d errored, %d skipped\n",
		r.Sides[0], r.Sides[1], r.Counts.Identical, r.Counts.Differing, r.Counts.OneSided, r.Counts.Errored, r.Counts.Skipped)
}

// WriteJSON writes the whole report.
func (r *Report) WriteJSON(w io.Writer) error {
	enc := json.NewEncoder(w)
	enc.SetEscapeHTML(false)
	enc.SetIndent("", "  ")
	return enc.Encode(r)
}

// WriteMarkdown writes the report grouped by endpoint, with one diff block
// per differing step.
func (r *Report) WriteMarkdown(w io.Writer) error {
	fmt.Fprintf(w, "# %s vs %s\n\n", r.Sides[0], r.Sides[1])
	fmt.Fprintf(w, "| Identical | Differing | One-sided | Errored | Skipped |\n|---|---|---|---|---|\n| %d | %d | %d | %d | %d |\n\n",
		r.Counts.Identical, r.Counts.Differing, r.Counts.OneSided, r.Counts.Errored, r.Counts.Skipped)
	fmt.Fprintf(w, "Lines starting with `-` are %s's, with `+` %s's.\n", r.Sides[0], r.Sides[1])
	for _, warn := range r.Warnings {
		fmt.Fprintf(w, "\n> Warning: %s\n", warn)
	}
	byEndpoint := map[string][]CaseDiff{}
	var endpoints []string
	for _, c := range r.Cases {
		if byEndpoint[c.Endpoint] == nil {
			endpoints = append(endpoints, c.Endpoint)
		}
		byEndpoint[c.Endpoint] = append(byEndpoint[c.Endpoint], c)
	}
	sort.Strings(endpoints)
	for _, e := range endpoints {
		fmt.Fprintf(w, "\n## %s\n\n", e)
		for _, c := range byEndpoint[e] {
			fmt.Fprintf(w, "- **%s**: %s (%s / %s)", c.ID, c.Outcome, c.StatusA, c.StatusB)
			if c.Note != "" {
				fmt.Fprintf(w, ". %s", c.Note)
			}
			fmt.Fprintln(w)
			for _, s := range c.Steps {
				phase := ""
				if s.Phase == "teardown" {
					phase = "teardown "
				}
				part := ""
				if s.Part != "" {
					part = ", " + s.Part
				}
				fmt.Fprintf(w, "\n  %sstep %d (line %d)%s, %s:\n\n  ```diff\n", phase, s.Index+1, s.Line, part, s.Kind)
				for _, l := range s.Hunk {
					fmt.Fprintf(w, "  %s\n", l)
				}
				fmt.Fprintf(w, "  ```\n")
			}
		}
	}
	return nil
}
