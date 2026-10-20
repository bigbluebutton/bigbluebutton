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
	Skipped   int `json:"skipped"`
}

// CaseDiff is one case's comparison.
type CaseDiff struct {
	ID       string        `json:"id"`
	Endpoint string        `json:"endpoint"`
	Outcome  string        `json:"outcome"` // identical | differing | one-sided | skipped
	StatusA  report.Status `json:"status_a"`
	StatusB  report.Status `json:"status_b"`
	Note     string        `json:"note,omitempty"`
	Steps    []StepDiff    `json:"steps,omitempty"`
}

// StepDiff is one step that differs.
type StepDiff struct {
	golden.Key
	Line int `json:"line"`
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
		la, lb := byKey(ca.Steps(ra.ID)), byKey(cb.Steps(ra.ID))
		switch {
		case ra.Status == report.Skip || rb == nil || rb.Status == report.Skip:
			cd.Outcome = "skipped"
			cd.Note = skipNote(ra, rb)
			rep.Counts.Skipped++
			rep.Cases = append(rep.Cases, cd)
			continue
		}
		keys := map[golden.Key]bool{}
		for k := range la {
			keys[k] = true
		}
		for k := range lb {
			keys[k] = true
		}
		sorted := make([]golden.Key, 0, len(keys))
		for k := range keys {
			sorted = append(sorted, k)
		}
		sort.Slice(sorted, func(i, j int) bool { return sorted[i].Less(sorted[j]) })
		oneSided := false
		for _, k := range sorted {
			sa, okA := la[k]
			sb, okB := lb[k]
			switch {
			case okA && !okB:
				cd.Steps = append(cd.Steps, StepDiff{Key: k, Line: sa.Line, Kind: "only-a", Hunk: prefix("-", sa.Lines)})
				oneSided = true
			case okB && !okA:
				cd.Steps = append(cd.Steps, StepDiff{Key: k, Line: sb.Line, Kind: "only-b", Hunk: prefix("+", sb.Lines)})
				oneSided = true
			default:
				if h := golden.Lines(sa.Lines, sb.Lines); len(h) > 0 {
					cd.Steps = append(cd.Steps, StepDiff{Key: k, Line: sa.Line, Kind: "differing", Hunk: h})
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
		default:
			cd.Outcome = "identical"
			rep.Counts.Identical++
		}
		rep.Cases = append(rep.Cases, cd)
	}
	return rep
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

func byKey(steps []golden.Step) map[golden.Key]golden.Step {
	m := make(map[golden.Key]golden.Step, len(steps))
	for _, s := range steps {
		m[s.Key] = s
	}
	return m
}

func prefix(p string, lines []string) []string {
	out := make([]string, len(lines))
	for i, l := range lines {
		out[i] = p + " " + l
	}
	return out
}

// Differs reports whether any case differs or was one-sided.
func (r *Report) Differs() bool { return r.Counts.Differing+r.Counts.OneSided > 0 }

// WriteConsole writes the summary and the cases that differ.
func (r *Report) WriteConsole(w io.Writer) {
	for _, c := range r.Cases {
		if c.Outcome == "differing" || c.Outcome == "one-sided" {
			fmt.Fprintf(w, "%-9s %s (%s / %s)\n", strings.ToUpper(c.Outcome), c.ID, c.StatusA, c.StatusB)
		}
	}
	for _, warn := range r.Warnings {
		fmt.Fprintf(w, "warning: %s\n", warn)
	}
	fmt.Fprintf(w, "\n%s vs %s: %d identical, %d differing, %d one-sided, %d skipped\n",
		r.Sides[0], r.Sides[1], r.Counts.Identical, r.Counts.Differing, r.Counts.OneSided, r.Counts.Skipped)
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
	fmt.Fprintf(w, "| Identical | Differing | One-sided | Skipped |\n|---|---|---|---|\n| %d | %d | %d | %d |\n\n",
		r.Counts.Identical, r.Counts.Differing, r.Counts.OneSided, r.Counts.Skipped)
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
				fmt.Fprintf(w, "\n  %sstep %d (line %d), %s:\n\n  ```diff\n", phase, s.Index+1, s.Line, s.Kind)
				for _, l := range s.Hunk {
					fmt.Fprintf(w, "  %s\n", l)
				}
				fmt.Fprintf(w, "  ```\n")
			}
		}
	}
	return nil
}
