// Package steps runs cases against a target.
package steps

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"fmt"
	"net/http"
	"sort"
	"strings"
	"sync"
	"time"

	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/assert"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/capture"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/client"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/observe"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/report"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/signer"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/spec"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/target"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/tmpl"
)

// DefaultTimeout applies to requests whose step sets no timeout.
const DefaultTimeout = 30 * time.Second

// Implemented lists the step types this runner can execute.
var Implemented = map[spec.StepKind]bool{spec.KindCall: true, spec.KindWait: true}

// Runner runs cases against one target.
type Runner struct {
	Target      *target.Target
	FixturesDir string
	Transport   http.RoundTripper
	Redactor    *tmpl.Redactor
	Version     string
	// NewUID returns the ${uid} of the i-th case. Tests make it predictable.
	NewUID func(i int) string
	// Area names the report group of a case, e.g. its cases/ subdirectory.
	Area func(*spec.Case) string
}

// NewRunner sets up a runner, registering the target's secrets for
// redaction.
func NewRunner(t *target.Target, fixturesDir, version string) (*Runner, error) {
	tr, err := client.NewTransport(t.TLS)
	if err != nil {
		return nil, err
	}
	red := &tmpl.Redactor{}
	red.Add("<salt>", t.Salt)
	for name, v := range t.Vars {
		if v.Secret {
			red.Add("<secret:"+name+">", v.Value)
		}
	}
	return &Runner{Target: t, FixturesDir: fixturesDir, Transport: tr, Redactor: red, Version: version, NewUID: randomUID}, nil
}

func randomUID(int) string {
	b := make([]byte, 6)
	_, _ = rand.Read(b) // never fails
	return "bbbc-" + hex.EncodeToString(b)
}

// Unimplemented lists what a case uses that this runner can't do yet:
// step types, route steps and response schemas.
func Unimplemented(c *spec.Case) []string {
	seen := map[string]bool{}
	for _, s := range append(append([]spec.Step{}, c.Steps...), c.Teardown...) {
		if !Implemented[s.Kind] {
			seen[string(s.Kind)] = true
			continue
		}
		if s.Call == nil {
			continue
		}
		if !s.Call.HasCall && s.Call.URL == "" {
			seen["route"] = true
		}
		if s.Expect != nil && s.Expect.Schema != "" {
			seen["schema"] = true
		}
		if ev := s.Call.Eventually; ev != nil && ev.Until != nil && ev.Until.Schema != "" {
			seen["schema"] = true
		}
	}
	out := make([]string, 0, len(seen))
	for k := range seen {
		out = append(out, k)
	}
	sort.Strings(out)
	return out
}

// RunAll runs cases in order on up to parallel workers. Cases tagged serial
// run afterwards, one at a time. Results keep the order of cases.
func (r *Runner) RunAll(ctx context.Context, cases []*spec.Case, parallel int) *report.Run {
	run := &report.Run{Target: r.Target.Name, Started: time.Now()}
	results := make([]*report.CaseResult, len(cases))
	uids := make([]string, len(cases))
	var parallelIdx, serialIdx []int
	for i, c := range cases {
		uids[i] = r.NewUID(i)
		if hasTag(c, "serial") {
			serialIdx = append(serialIdx, i)
		} else {
			parallelIdx = append(parallelIdx, i)
		}
	}
	if parallel < 1 {
		parallel = 1
	}
	work := make(chan int)
	var wg sync.WaitGroup
	for w := 0; w < parallel; w++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			for i := range work {
				results[i] = r.RunCase(ctx, cases[i], uids[i])
			}
		}()
	}
	for _, i := range parallelIdx {
		work <- i
	}
	close(work)
	wg.Wait()
	for _, i := range serialIdx {
		results[i] = r.RunCase(ctx, cases[i], uids[i])
	}
	run.Cases = results
	run.DurationMS = time.Since(run.Started).Milliseconds()
	run.Tally()
	return run
}

func hasTag(c *spec.Case, tag string) bool {
	for _, t := range c.Tags {
		if t == tag {
			return true
		}
	}
	return false
}

// exec is one case's run.
type exec struct {
	r        *Runner
	c        *spec.Case
	uid      string
	captured map[string]string
	session  *client.Session
	env      *tmpl.Env
}

// RunCase runs one case with the given ${uid}.
func (r *Runner) RunCase(ctx context.Context, c *spec.Case, uid string) *report.CaseResult {
	res := &report.CaseResult{ID: c.ID, Title: c.Title, Endpoint: c.Endpoint, Class: c.Class, Variant: c.Variant, File: c.File, Line: c.Line}
	if r.Area != nil {
		res.Area = r.Area(c)
	}
	if un := Unimplemented(c); len(un) > 0 {
		res.Status, res.Reason = report.Skip, "unimplemented: "+strings.Join(un, ", ")
		return res
	}
	var missing []string
	for _, capName := range c.Requires {
		if !r.Target.Has(capName) {
			missing = append(missing, capName)
		}
	}
	if len(missing) > 0 {
		res.Status, res.Reason = report.Skip, "target lacks "+strings.Join(missing, ", ")
		return res
	}

	x := &exec{r: r, c: c, uid: uid, captured: map[string]string{}, session: client.NewSession(r.Transport)}
	x.env = &tmpl.Env{
		Vars:        x.lookup,
		FixturesDir: r.FixturesDir,
		Checksum: func(alg, call, query string) (string, error) {
			return signer.Checksum(alg, call, query, r.Target.Salt)
		},
	}
	start := time.Now()
	for i, s := range c.Steps {
		sr := x.step(ctx, i, s)
		res.Steps = append(res.Steps, sr)
		if sr.Status == report.Pass {
			continue
		}
		if s.Call != nil && s.Call.IgnoreResult {
			res.Steps[len(res.Steps)-1].Ignored = true
			res.Warnings = append(res.Warnings, fmt.Sprintf("step %d (line %d), ignored: %s", i+1, s.Line, sr.Message))
			continue
		}
		res.Status, res.Reason = sr.Status, fmt.Sprintf("step %d (line %d): %s", i+1, s.Line, sr.Message)
		break
	}
	// Teardown runs whatever happened; its problems are warnings. A fresh
	// context lets it clean up after a cancelled run.
	tctx, cancel := context.WithTimeout(context.WithoutCancel(ctx), 2*DefaultTimeout)
	defer cancel()
	for i, s := range c.Teardown {
		sr := x.step(tctx, i, s)
		if sr.Status != report.Pass {
			sr.Ignored = true
			res.Warnings = append(res.Warnings, fmt.Sprintf("teardown step %d (line %d): %s", i+1, s.Line, sr.Message))
		}
		res.Teardown = append(res.Teardown, sr)
	}
	if res.Status == "" {
		res.Status = report.Pass
	}
	res.DurationMS = time.Since(start).Milliseconds()
	return res
}

// lookup resolves a template variable.
func (x *exec) lookup(name string) (string, bool) {
	t := x.r.Target
	switch name {
	case "uid":
		return x.uid, true
	case "salt":
		return t.Salt, true
	case "baseUrl":
		return t.BaseURL, true
	case "sinkUrl":
		return t.SinkURL, t.SinkURL != ""
	case "fixtureUrl":
		return t.FixtureURL, t.FixtureURL != ""
	}
	if v, ok := x.captured[name]; ok {
		return v, true
	}
	if v, ok := x.c.Vars[name]; ok {
		return v, true
	}
	if rest, ok := strings.CutPrefix(name, "target."); ok {
		if v, ok := t.Vars[rest]; ok {
			return v.Value, true
		}
	}
	return "", false
}

func (x *exec) expand(s string) (string, error) { return tmpl.Expand(s, x.env) }

func (x *exec) redact(s string) string { return x.r.Redactor.Redact(s) }

func (x *exec) step(ctx context.Context, i int, s spec.Step) report.StepResult {
	sr := report.StepResult{Index: i, Kind: string(s.Kind), Line: s.Line}
	start := time.Now()
	defer func() { sr.DurationMS = time.Since(start).Milliseconds() }()
	switch s.Kind {
	case spec.KindWait:
		select {
		case <-time.After(s.Wait):
			sr.Status = report.Pass
		case <-ctx.Done():
			sr.Status, sr.Message = report.Error, ctx.Err().Error()
		}
	case spec.KindCall:
		x.call(ctx, s, &sr)
	default:
		sr.Status, sr.Message = report.Skip, "unimplemented: "+string(s.Kind)
	}
	sr.Message = x.redact(sr.Message)
	return sr
}

func (x *exec) call(ctx context.Context, s spec.Step, sr *report.StepResult) {
	cs := s.Call
	p, err := x.prepare(cs)
	if err != nil {
		sr.Status, sr.Message = report.Error, err.Error()
		return
	}
	sr.Request = x.requestInfo(p)
	timeout := cs.Timeout
	if timeout <= 0 {
		timeout = DefaultTimeout
	}
	eval := assert.Eval(x.expand)

	var o *observe.Observation
	if ev := cs.Eventually; ev != nil {
		deadline := time.Now().Add(ev.Within)
		for attempt := 1; ; attempt++ {
			sr.Attempts = attempt
			obs, err := x.session.Do(ctx, p, cs.Client, cs.FollowRedirects, timeout)
			var until []assert.Result
			if err == nil {
				o = obs
				var aerr error
				if until, aerr = assert.Check(ev.Until, o, eval); aerr != nil {
					sr.Status, sr.Message = report.Error, aerr.Error()
					return
				}
				if assert.Passed(until) {
					break
				}
			}
			if time.Now().Add(ev.Every).After(deadline) {
				if err != nil {
					sr.Status, sr.Message = report.Error, x.redact(err.Error())
					return
				}
				sr.Response = x.responseInfo(o)
				sr.Assertions = x.redactResults(until)
				sr.Status = report.Fail
				sr.Message = fmt.Sprintf("eventually: not within %s (%d attempts): %s", ev.Within, attempt, assert.FirstFailure(until))
				return
			}
			select {
			case <-time.After(ev.Every):
			case <-ctx.Done():
				sr.Status, sr.Message = report.Error, ctx.Err().Error()
				return
			}
		}
	} else {
		o, err = x.session.Do(ctx, p, cs.Client, cs.FollowRedirects, timeout)
		if err != nil {
			sr.Status, sr.Message = report.Error, err.Error()
			return
		}
	}
	sr.Response = x.responseInfo(o)

	results, err := assert.Check(s.Expect, o, eval)
	if err != nil {
		sr.Status, sr.Message = report.Error, err.Error()
		return
	}
	sr.Assertions = x.redactResults(results)
	if !assert.Passed(results) {
		sr.Status, sr.Message = report.Fail, assert.FirstFailure(results)
		return
	}
	for _, c := range s.Capture {
		expr, err := x.expand(c.Expr)
		if err != nil {
			sr.Status, sr.Message = report.Error, err.Error()
			return
		}
		v, err := capture.Value(o, expr)
		if err != nil {
			var nf *capture.NotFound
			if errors.As(err, &nf) {
				sr.Status = report.Fail
			} else {
				sr.Status = report.Error
			}
			sr.Message = err.Error()
			return
		}
		x.captured[c.Name] = v
		if sr.Captured == nil {
			sr.Captured = map[string]string{}
		}
		sr.Captured[c.Name] = x.redact(v)
	}
	sr.Status = report.Pass
}

const (
	maxRequestBody  = 4 << 10
	maxResponseBody = 16 << 10
)

func (x *exec) requestInfo(p *client.Prepared) *report.Request {
	rq := &report.Request{Method: p.Method, URL: x.redact(p.URL), Headers: x.headerMap(p.Header), Chunked: p.Chunked}
	if p.HasBody {
		rq.Body = x.redact(clip(string(p.Body), maxRequestBody))
	}
	return rq
}

func (x *exec) responseInfo(o *observe.Observation) *report.Response {
	return &report.Response{Status: o.Status, Format: o.Format(), Headers: x.headerMap(o.Header), Body: x.redact(clip(string(o.Body), maxResponseBody))}
}

func (x *exec) headerMap(h http.Header) map[string]string {
	if len(h) == 0 {
		return nil
	}
	out := map[string]string{}
	for k, vs := range h {
		v := strings.Join(vs, "\n")
		if v == "" {
			continue
		}
		out[k] = x.redact(v)
	}
	return out
}

func (x *exec) redactResults(rs []assert.Result) []assert.Result {
	out := make([]assert.Result, len(rs))
	for i, r := range rs {
		out[i] = assert.Result{What: x.redact(r.What), Expected: x.redact(r.Expected), Actual: x.redact(r.Actual), OK: r.OK}
	}
	return out
}

func clip(s string, n int) string {
	if len(s) <= n {
		return s
	}
	return s[:n] + fmt.Sprintf("… (%d bytes more)", len(s)-n)
}
