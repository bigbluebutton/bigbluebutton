// Package diff compares how two targets answer the same cases, on
// normalized responses, so it shows differences no check was written for.
package diff

import (
	"encoding/json"
	"fmt"
	"io"
	"sort"
	"strings"
	"sync"

	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/normalize"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/report"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/steps"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/target"
)

// Key identifies a step within a case.
type Key struct {
	Phase string `json:"phase"`
	Index int    `json:"index"`
}

func (k Key) less(o Key) bool {
	if k.Phase != o.Phase {
		return k.Phase == "steps" // steps before teardown
	}
	return k.Index < o.Index
}

type stepLines struct {
	lines  []string
	golden string
	line   int
}

// Collector gathers one target's normalized responses.
type Collector struct {
	rules  *normalize.Rules
	target *target.Target

	mu    sync.Mutex
	ctxs  map[string]*normalize.Context
	cases map[string]map[Key]stepLines
}

// NewCollector returns a collector; hook it up with r.Observe = c.Observe.
func NewCollector(t *target.Target, rules *normalize.Rules) *Collector {
	return &Collector{rules: rules, target: t, ctxs: map[string]*normalize.Context{}, cases: map[string]map[Key]stepLines{}}
}

// Observe records one response. A case's events arrive in order, from one
// goroutine; cases run in parallel.
func (c *Collector) Observe(ev steps.Observed) {
	if ev.Golden == "off" {
		return // never compared
	}
	c.mu.Lock()
	ctx := c.ctxs[ev.Case.ID]
	if ctx == nil {
		ctx = normalize.NewContext(ev.UID, c.target.Bases(), c.target.APIPrefix, c.target.Salt)
		c.ctxs[ev.Case.ID] = ctx
		c.cases[ev.Case.ID] = map[Key]stepLines{}
	}
	c.mu.Unlock()
	// The context is only touched by this case's goroutine.
	ctx.AddSent(ev.Request.URL, ev.Request.Header.Get("Content-Type"), ev.Request.Body)
	lines := normalize.Response(ev.Obs, ctx, c.rules)
	line := 0
	steps := ev.Case.Steps
	if ev.Phase == "teardown" {
		steps = ev.Case.Teardown
	}
	if ev.Index < len(steps) {
		line = steps[ev.Index].Line
	}
	c.mu.Lock()
	c.cases[ev.Case.ID][Key{ev.Phase, ev.Index}] = stepLines{lines: lines, golden: ev.Golden, line: line}
	c.mu.Unlock()
}

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
	Key
	Line int `json:"line"`
	// Kind is differing, only-a or only-b.
	Kind string   `json:"kind"`
	Hunk []string `json:"hunk"` // "-" for A's lines, "+" for B's
}

// Compare builds the report from both runs, in the order of a's cases.
func Compare(a, b *report.Run, ca, cb *Collector) *Report {
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
		la, lb := ca.cases[ra.ID], cb.cases[ra.ID]
		switch {
		case ra.Status == report.Skip || rb == nil || rb.Status == report.Skip:
			cd.Outcome = "skipped"
			cd.Note = skipNote(ra, rb)
			rep.Counts.Skipped++
			rep.Cases = append(rep.Cases, cd)
			continue
		}
		keys := map[Key]bool{}
		for k := range la {
			keys[k] = true
		}
		for k := range lb {
			keys[k] = true
		}
		sorted := make([]Key, 0, len(keys))
		for k := range keys {
			sorted = append(sorted, k)
		}
		sort.Slice(sorted, func(i, j int) bool { return sorted[i].less(sorted[j]) })
		oneSided := false
		for _, k := range sorted {
			sa, okA := la[k]
			sb, okB := lb[k]
			if (okA && sa.golden == "off") || (okB && sb.golden == "off") {
				continue
			}
			switch {
			case okA && !okB:
				cd.Steps = append(cd.Steps, StepDiff{Key: k, Line: sa.line, Kind: "only-a", Hunk: prefix("-", sa.lines)})
				oneSided = true
			case okB && !okA:
				cd.Steps = append(cd.Steps, StepDiff{Key: k, Line: sb.line, Kind: "only-b", Hunk: prefix("+", sb.lines)})
				oneSided = true
			default:
				if h := Lines(sa.lines, sb.lines); len(h) > 0 {
					cd.Steps = append(cd.Steps, StepDiff{Key: k, Line: sa.line, Kind: "differing", Hunk: h})
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

func prefix(p string, lines []string) []string {
	out := make([]string, len(lines))
	for i, l := range lines {
		out[i] = p + " " + l
	}
	return out
}

// Lines diffs two line sequences by their longest common subsequence and
// returns the changed lines, "-" for a and "+" for b, in order. It returns
// nil when they are equal.
func Lines(a, b []string) []string {
	// Only the middle that differs goes through the quadratic table.
	for len(a) > 0 && len(b) > 0 && a[0] == b[0] {
		a, b = a[1:], b[1:]
	}
	for len(a) > 0 && len(b) > 0 && a[len(a)-1] == b[len(b)-1] {
		a, b = a[:len(a)-1], b[:len(b)-1]
	}
	n, m := len(a), len(b)
	lcs := make([][]int, n+1)
	for i := range lcs {
		lcs[i] = make([]int, m+1)
	}
	for i := n - 1; i >= 0; i-- {
		for j := m - 1; j >= 0; j-- {
			if a[i] == b[j] {
				lcs[i][j] = lcs[i+1][j+1] + 1
			} else {
				lcs[i][j] = max(lcs[i+1][j], lcs[i][j+1])
			}
		}
	}
	var out []string
	i, j := 0, 0
	for i < n || j < m {
		switch {
		case i < n && j < m && a[i] == b[j]:
			i++
			j++
		case i < n && (j == m || lcs[i+1][j] >= lcs[i][j+1]):
			out = append(out, "- "+a[i])
			i++
		default:
			out = append(out, "+ "+b[j])
			j++
		}
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
