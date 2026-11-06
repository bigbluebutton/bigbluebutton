// Package golden holds the normalized output of a case's steps: what diff
// compares between targets, and what record mode stores and checks against.
package golden

import (
	"sort"
	"sync"

	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/assert"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/normalize"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/spec"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/steps"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/target"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/tmpl"
)

// Key identifies a step within a case.
type Key struct {
	Phase string `json:"phase"`
	Index int    `json:"index"`
}

// Less orders steps before teardown, then by index.
func (k Key) Less(o Key) bool {
	if k.Phase != o.Phase {
		return k.Phase == "steps"
	}
	return k.Index < o.Index
}

// Step is one step's normalized response.
type Step struct {
	Key
	Line  int // the step's line in its case file
	Lines []string
}

// Pair is one step of a case in two collections; A or B is nil when that
// collection lacks it.
type Pair struct {
	Key  Key
	A, B *Step
}

// Pairs lines up two collections of a case's steps, in step order.
func Pairs(a, b []Step) []Pair {
	idx := map[Key]int{}
	var out []Pair
	at := func(k Key) *Pair {
		i, ok := idx[k]
		if !ok {
			i = len(out)
			idx[k] = i
			out = append(out, Pair{Key: k})
		}
		return &out[i]
	}
	for i := range a {
		at(a[i].Key).A = &a[i]
	}
	for i := range b {
		at(b[i].Key).B = &b[i]
	}
	sort.Slice(out, func(i, j int) bool { return out[i].Key.Less(out[j].Key) })
	return out
}

// Collector gathers one target's normalized responses.
type Collector struct {
	rules  *normalize.Rules
	target *target.Target
	red    *tmpl.Redactor

	// discard, when set, makes Add return lines without keeping them.
	discard bool

	mu    sync.Mutex
	ctxs  map[string]*normalize.Context
	cases map[string]map[Key]Step
	props map[string]map[Key]Step // what akka-apps made of each create, by step
}

// NewCollector returns a collector; diff hooks it up with r.Observe =
// c.Observe. Its lines are redacted with red, which may be nil.
func NewCollector(t *target.Target, rules *normalize.Rules, red *tmpl.Redactor) *Collector {
	return &Collector{rules: rules, target: t, red: red, ctxs: map[string]*normalize.Context{}, cases: map[string]map[Key]Step{},
		props: map[string]map[Key]Step{}}
}

// AddProps records the meeting props akka-apps announced for the meeting
// a create step made, normalized with the case's own context. Call it
// after Observe or Add has seen the step.
func (c *Collector) AddProps(ev steps.Observed, doc []byte) {
	c.mu.Lock()
	ctx := c.ctxs[ev.Case.ID]
	c.mu.Unlock()
	if ctx == nil {
		return
	}
	lines := normalize.Document(doc, ctx, c.rules)
	for i, l := range lines {
		lines[i] = c.red.Redact(l)
	}
	k := Key{ev.Phase, ev.Index}
	line := 0
	if ev.Index < len(ev.Case.Steps) {
		line = ev.Case.Steps[ev.Index].Line
	}
	c.mu.Lock()
	if c.props[ev.Case.ID] == nil {
		c.props[ev.Case.ID] = map[Key]Step{}
	}
	c.props[ev.Case.ID][k] = Step{Key: k, Line: line, Lines: lines}
	c.mu.Unlock()
}

// Props returns the meeting props recorded for a case, in step order.
func (c *Collector) Props(id string) []Step {
	c.mu.Lock()
	defer c.mu.Unlock()
	return sorted(c.props[id])
}

// Observe records one response and never fails a step.
func (c *Collector) Observe(ev steps.Observed) ([]assert.Result, error) {
	c.Add(ev)
	return nil, nil
}

// Add records one response and returns its lines. A case's events arrive in
// order, from one goroutine; cases run in parallel. An off step's response
// isn't kept, and Add returns nil for it, but what it sent still counts as
// sent, so later steps that echo it read the same either way.
func (c *Collector) Add(ev steps.Observed) []string {
	c.mu.Lock()
	ctx := c.ctxs[ev.Case.ID]
	if ctx == nil {
		ctx = normalize.NewContext(ev.UID, c.target.Bases(), c.target.APIPrefix, c.target.Salt)
		c.ctxs[ev.Case.ID] = ctx
		c.cases[ev.Case.ID] = map[Key]Step{}
	}
	c.mu.Unlock()
	// The context is only touched by this case's goroutine.
	if ev.Request != nil { // a graphql step sends no HTTP request
		ctx.AddSent(ev.Request.URL, ev.Request.Header.Get("Content-Type"), ev.Request.Body)
	}
	if ev.Golden == "off" {
		return nil
	}
	if c.discard && ev.Golden != "compare" {
		return nil // nobody reads it
	}
	steps := ev.Case.Steps
	if ev.Phase == "teardown" {
		steps = ev.Case.Teardown
	}
	var lines []string
	if ev.Index < len(steps) && steps[ev.Index].Kind != spec.KindCall { // a document, not an HTTP response
		lines = normalize.Document(ev.Obs.Body, ctx, c.rules)
		if b := steps[ev.Index].Bus; b != nil && len(b.Select) > 0 {
			lines = selectLines(lines, b.Select)
		}
	} else {
		lines = normalize.Response(ev.Obs, ctx, c.rules)
	}
	for i, l := range lines {
		lines[i] = c.red.Redact(l)
	}
	if c.discard {
		return lines
	}
	line := 0
	if ev.Index < len(steps) {
		line = steps[ev.Index].Line
	}
	k := Key{ev.Phase, ev.Index}
	c.mu.Lock()
	c.cases[ev.Case.ID][k] = Step{Key: k, Line: line, Lines: lines}
	c.mu.Unlock()
	return lines
}

// Steps returns what was collected for a case, in step order.
func (c *Collector) Steps(id string) []Step {
	c.mu.Lock()
	defer c.mu.Unlock()
	return sorted(c.cases[id])
}

func sorted(m map[Key]Step) []Step {
	out := make([]Step, 0, len(m))
	for _, s := range m {
		out = append(out, s)
	}
	sort.Slice(out, func(i, j int) bool { return out[i].Less(out[j].Key) })
	return out
}
