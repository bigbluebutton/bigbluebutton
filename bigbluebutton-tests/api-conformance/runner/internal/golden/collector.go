// Package golden holds the normalized output of a case's steps: what diff
// compares between targets, and what record mode stores and checks against.
package golden

import (
	"sort"
	"sync"

	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/assert"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/normalize"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/steps"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/target"
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
	Golden string // compare | document
	Line   int    // the step's line in its case file
	Lines  []string
}

// Collector gathers one target's normalized responses.
type Collector struct {
	rules  *normalize.Rules
	target *target.Target

	mu    sync.Mutex
	ctxs  map[string]*normalize.Context
	cases map[string]map[Key]Step
}

// NewCollector returns a collector; diff hooks it up with r.Observe =
// c.Observe.
func NewCollector(t *target.Target, rules *normalize.Rules) *Collector {
	return &Collector{rules: rules, target: t, ctxs: map[string]*normalize.Context{}, cases: map[string]map[Key]Step{}}
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
	ctx.AddSent(ev.Request.URL, ev.Request.Header.Get("Content-Type"), ev.Request.Body)
	if ev.Golden == "off" {
		return nil
	}
	lines := normalize.Response(ev.Obs, ctx, c.rules)
	line := 0
	steps := ev.Case.Steps
	if ev.Phase == "teardown" {
		steps = ev.Case.Teardown
	}
	if ev.Index < len(steps) {
		line = steps[ev.Index].Line
	}
	k := Key{ev.Phase, ev.Index}
	c.mu.Lock()
	c.cases[ev.Case.ID][k] = Step{Key: k, Golden: ev.Golden, Line: line, Lines: lines}
	c.mu.Unlock()
	return lines
}

// Steps returns what was collected for a case, in step order.
func (c *Collector) Steps(id string) []Step {
	c.mu.Lock()
	defer c.mu.Unlock()
	out := make([]Step, 0, len(c.cases[id]))
	for _, s := range c.cases[id] {
		out = append(out, s)
	}
	sort.Slice(out, func(i, j int) bool { return out[i].Less(out[j].Key) })
	return out
}
