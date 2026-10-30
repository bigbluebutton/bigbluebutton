// Package steps runs cases against a target.
package steps

import (
	"context"
	"crypto/rand"
	"crypto/tls"
	"encoding/hex"
	"errors"
	"fmt"
	"net/http"
	osexec "os/exec"
	"slices"
	"sort"
	"strings"
	"sync"
	"syscall"
	"time"
	"unicode/utf8"

	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/assert"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/capture"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/client"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/observe"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/presence"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/report"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/signer"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/sink"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/spec"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/tap"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/target"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/tmpl"
)

// DefaultTimeout applies to requests whose step sets no timeout.
const DefaultTimeout = 30 * time.Second

// minAttempt is the shortest timeout an eventually attempt gets, even when
// less than that is left before its deadline.
const minAttempt = 250 * time.Millisecond

// Implemented lists the step types this runner can execute.
var Implemented = map[spec.StepKind]bool{spec.KindCall: true, spec.KindWait: true, spec.KindPresence: true, spec.KindGraphQL: true,
	spec.KindBus: true, spec.KindFS: true, spec.KindRedis: true, spec.KindSink: true}

// Runner runs cases against one target.
type Runner struct {
	Target      *target.Target
	FixturesDir string
	Transport   http.RoundTripper
	TLS         *tls.Config // for the GraphQL websocket
	Redactor    *tmpl.Redactor
	Version     string
	// NewUID returns the ${uid} of the i-th case. Tests make it predictable.
	NewUID func(i int) string
	// Area names the report group of a case, e.g. its cases/ subdirectory.
	Area func(*spec.Case) string
	// ContinueOnFail keeps a case going after a failed check, captures
	// included, so every step gets a response to compare (diff mode). A
	// capture that finds nothing still stops the case.
	ContinueOnFail bool
	// Observe, when set, sees every response a call step gets, before its
	// expect is checked. The results it returns count as the step's first
	// checks; an error makes the step ERROR. It is called from the case's
	// goroutine; cases run in parallel.
	Observe func(Observed) ([]assert.Result, error)
	// Before, when set, sees each case that will run before it sends
	// anything; an error makes the case ERROR.
	Before func(*spec.Case) error
	// PingEvery is how often a presence user's connection pings;
	// presence.DefaultPingEvery when zero.
	PingEvery time.Duration
	// Tap is the target's tap, for bus, fs and redis steps; nil without one.
	Tap *tap.Client
	// Sink is the target's sink, for sink steps; nil without one.
	Sink *sink.Client
	// Abort, when done, stops teardowns too, as a second Ctrl-C does.
	// Restoring the default profile still finishes.
	Abort context.Context
	// tapDown is why the tap didn't answer before the run, so its cases
	// don't each wait for it; sinkDown the same for the sink.
	tapDown  error
	sinkDown error
}

// Observed is one response, with what diff and record mode need about it.
type Observed struct {
	Case    *spec.Case
	UID     string
	Phase   string // "steps" or "teardown"
	Index   int
	Golden  string // compare | document | off, after defaults
	Request *client.Prepared
	Obs     *observe.Observation
}

// GoldenMode resolves a step's golden setting: off in teardown and for
// steps whose result is ignored, whose answers may vary by design;
// document in defect cases; compare otherwise.
func GoldenMode(c *spec.Case, phase string, s spec.Step) string {
	switch {
	case s.Golden != "":
		return s.Golden
	case phase == "teardown", s.Call != nil && s.Call.IgnoreResult:
		return "off"
	case c.Class == "defect":
		return "document"
	}
	return "compare"
}

// NewRunner sets up a runner, registering the target's secrets for
// redaction.
func NewRunner(t *target.Target, fixturesDir, version string) (*Runner, error) {
	tr, err := client.NewTransport(t.TLS)
	if err != nil {
		return nil, err
	}
	tlsCfg, err := client.TLSConfig(t.TLS)
	if err != nil {
		return nil, err
	}
	red := &tmpl.Redactor{}
	red.Add("[salt]", t.Salt)
	for name, v := range t.Vars {
		if v.Secret {
			red.Add("[secret:"+name+"]", v.Value)
		}
	}
	r := &Runner{Target: t, FixturesDir: fixturesDir, Transport: tr, TLS: tlsCfg, Redactor: red, Version: version, NewUID: randomUID}
	if t.TapURL != "" {
		r.Tap = tap.NewClient(t.TapURL)
	}
	if t.SinkReadURL != "" {
		r.Sink = sink.NewClient(t.SinkReadURL, tlsCfg)
	}
	return r, nil
}

func randomUID(int) string {
	b := make([]byte, 6)
	_, _ = rand.Read(b) // never fails
	return "bbbc-" + hex.EncodeToString(b)
}

// Unimplemented lists what a case uses that this runner can't do yet:
// step types and response schemas.
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

// NotRouted lists the routes a case uses that the target can't reach.
// Route names with templates are left to run time.
func (r *Runner) NotRouted(c *spec.Case) []string {
	seen := map[string]bool{}
	for _, s := range append(append([]spec.Step{}, c.Steps...), c.Teardown...) {
		if s.Call == nil || s.Call.Route == "" || tmpl.HasExpr(s.Call.Route) {
			continue
		}
		if _, _, ok := r.Target.Route(s.Call.Route); !ok {
			seen[s.Call.Route] = true
		}
	}
	out := make([]string, 0, len(seen))
	for k := range seen {
		out = append(out, k)
	}
	sort.Strings(out)
	return out
}

// skipReason says why a case can't run on this target, or "".
func (r *Runner) skipReason(c *spec.Case) string {
	if un := Unimplemented(c); len(un) > 0 {
		return "unimplemented: " + strings.Join(un, ", ")
	}
	if nr := r.NotRouted(c); len(nr) > 0 {
		return "not-routed: " + strings.Join(nr, ", ")
	}
	if c.Profile != "" {
		if _, ok := r.Target.Profiles[c.Profile]; !ok {
			return "no-profile: " + c.Profile
		}
	}
	var missing []string
	for _, capName := range c.Requires {
		if !r.Target.Has(capName) {
			missing = append(missing, capName)
		}
	}
	if len(missing) > 0 {
		return "target lacks " + strings.Join(missing, ", ")
	}
	var unset []string
	for _, name := range c.Uses {
		if v, _ := r.lookupTarget(name); v == "" {
			unset = append(unset, name)
		}
	}
	if len(unset) > 0 {
		return "not-configured: " + strings.Join(unset, ", ")
	}
	return ""
}

// lookupTarget resolves a built-in variable the target supplies.
func (r *Runner) lookupTarget(name string) (string, bool) {
	t := r.Target
	switch name {
	case "salt":
		return t.Salt, true
	case "baseUrl":
		return t.BaseURL, true
	case "sinkUrl":
		return t.SinkURL, t.SinkURL != ""
	case "fixtureUrl":
		return t.FixtureURL, t.FixtureURL != ""
	}
	return "", false
}

// profileTimeout bounds a profile switch, which may restart services.
const profileTimeout = 15 * time.Minute

// RunAll runs cases on up to parallel workers. Then the cases tagged serial
// run one at a time, and then each profile's cases, one profile group at a
// time: the profile's command runs before its group, and the target's
// "default" profile command runs at the end, even if the run is cancelled.
// Results keep the order of cases.
func (r *Runner) RunAll(ctx context.Context, cases []*spec.Case, parallel int) *report.Run {
	run := &report.Run{Target: r.Target.Name, Started: time.Now()}
	r.tapDown = nil
	if r.Tap != nil && slices.ContainsFunc(cases, func(c *spec.Case) bool { return usesTap(c) && r.skipReason(c) == "" }) {
		pctx, cancel := context.WithTimeout(ctx, 10*time.Second)
		if _, err := r.Tap.Info(pctx); err != nil {
			r.tapDown = fmt.Errorf("the tap at %s didn't answer before the run: %w", r.Target.TapURL, err)
		}
		cancel()
	}
	r.sinkDown = nil
	if r.Sink != nil && slices.ContainsFunc(cases, func(c *spec.Case) bool { return usesSink(c) && r.skipReason(c) == "" }) {
		pctx, cancel := context.WithTimeout(ctx, 10*time.Second)
		if _, err := r.Sink.Info(pctx); err != nil {
			r.sinkDown = fmt.Errorf("the sink at %s didn't answer before the run: %w", r.Target.SinkReadURL, err)
		}
		cancel()
	}
	results := make([]*report.CaseResult, len(cases))
	uids := make([]string, len(cases))
	var parallelIdx, serialIdx []int
	groups := map[string][]int{}
	var profileOrder []string
	for i, c := range cases {
		uids[i] = r.NewUID(i)
		_, hasProfile := r.Target.Profiles[c.Profile]
		switch {
		case c.Profile != "" && hasProfile:
			if groups[c.Profile] == nil {
				profileOrder = append(profileOrder, c.Profile)
			}
			groups[c.Profile] = append(groups[c.Profile], i)
		case hasTag(c, "serial"):
			serialIdx = append(serialIdx, i)
		default:
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
	switched := false
	defer func() {
		// Restore the default after any switch, even if the run was cancelled.
		def, ok := r.Target.Profiles["default"]
		if !switched || !ok {
			return
		}
		if err := r.runProfile(context.WithoutCancel(ctx), "default", def.Command); err != nil {
			run.Warnings = append(run.Warnings, err.Error())
			run.Tally()
		}
	}()
	for _, name := range profileOrder {
		// Switching may restart services: only do it if a case will run.
		var err error
		for _, i := range groups[name] {
			if r.skipReason(cases[i]) == "" && ctx.Err() == nil {
				err = r.runProfile(ctx, name, r.Target.Profiles[name].Command)
				if !errors.Is(err, errProfileUnavailable) {
					switched = true // even if it failed part way
				}
				break
			}
		}
		for _, i := range groups[name] {
			// A case skipped anyway, or after an interrupt, says so.
			if err != nil && r.skipReason(cases[i]) == "" && ctx.Err() == nil {
				results[i] = r.skeleton(cases[i])
				results[i].Status, results[i].Reason = report.Error, err.Error()
				if errors.Is(err, errProfileUnavailable) {
					results[i].Status = report.Skip
				}
				continue
			}
			results[i] = r.RunCase(ctx, cases[i], uids[i])
		}
	}
	run.Cases = results
	run.DurationMS = time.Since(run.Started).Milliseconds()
	run.Tally()
	return run
}

// errProfileUnavailable marks a profile command that exited with
// profileUnavailable: it can't switch this server, e.g. because it isn't
// told how to reach it. Its cases are skipped, not errors.
var errProfileUnavailable = errors.New("profile-unavailable")

// profileUnavailable is the exit status that says so: 77, which Automake
// and Meson test harnesses also read as "skip".
const profileUnavailable = 77

// runProfile runs a profile's command from the target file's directory.
func (r *Runner) runProfile(ctx context.Context, name, command string) error {
	ctx, cancel := context.WithTimeout(ctx, profileTimeout)
	defer cancel()
	cmd := osexec.CommandContext(ctx, "sh", "-c", command)
	cmd.Dir = r.Target.Dir
	// Kill the whole process group on cancellation; killing only sh would
	// leave its children holding the output pipe open.
	cmd.SysProcAttr = &syscall.SysProcAttr{Setpgid: true}
	cmd.Cancel = func() error { return syscall.Kill(-cmd.Process.Pid, syscall.SIGKILL) }
	cmd.WaitDelay = 5 * time.Second
	out, err := cmd.CombinedOutput()
	if err != nil {
		tail := strings.TrimSpace(string(out))
		if len(tail) > 500 {
			tail = "…" + tail[len(tail)-500:]
		}
		var exit *osexec.ExitError
		if errors.As(err, &exit) && exit.ExitCode() == profileUnavailable {
			return fmt.Errorf("%w: %s: %s", errProfileUnavailable, name, r.Redactor.Redact(tail))
		}
		return fmt.Errorf("profile %s: command failed: %v: %s", name, err, r.Redactor.Redact(tail))
	}
	return nil
}

// skeleton is the result of a case before it runs.
func (r *Runner) skeleton(c *spec.Case) *report.CaseResult {
	res := &report.CaseResult{ID: c.ID, Title: c.Title, Endpoint: c.Endpoint, Class: c.Class, Variant: c.Variant, File: c.File, Line: c.Line}
	if r.Area != nil {
		res.Area = r.Area(c)
	}
	return res
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
	users    map[string]*presence.User // presence users, by handle
	mark     tap.Mark                  // where the case's bus and fs steps look from
	sinkMark sink.Info                 // where its sink steps look from
}

// RunCase runs one case with the given ${uid}.
func (r *Runner) RunCase(ctx context.Context, c *spec.Case, uid string) *report.CaseResult {
	res := r.skeleton(c)
	if why := r.skipReason(c); why != "" {
		res.Status, res.Reason = report.Skip, why
		return res
	}
	if ctx.Err() != nil { // nothing sent, so nothing to clean up
		res.Status, res.Reason = report.Skip, "interrupted before it started"
		return res
	}
	if r.Before != nil {
		if err := r.Before(c); err != nil {
			res.Status, res.Reason = report.Error, r.Redactor.Redact(err.Error())
			return res
		}
	}

	if r.tapDown != nil && usesTap(c) {
		res.Status, res.Reason = report.Error, r.Redactor.Redact(r.tapDown.Error())
		return res
	}
	if r.sinkDown != nil && usesSink(c) {
		res.Status, res.Reason = report.Error, r.Redactor.Redact(r.sinkDown.Error())
		return res
	}

	x := &exec{r: r, c: c, uid: uid, captured: map[string]string{}, session: client.NewSession(r.Transport), users: map[string]*presence.User{}}
	defer x.closeUsers() // after teardown, on every path
	if needsMark(c) {
		// Before anything is sent, so steps see what the first one causes.
		m, err := r.Tap.Mark(ctx)
		if err != nil {
			res.Status, res.Reason = report.Error, r.Redactor.Redact(err.Error())
			return res
		}
		x.mark = m
	}
	if usesSink(c) {
		i, err := r.Sink.Info(ctx)
		if err != nil {
			res.Status, res.Reason = report.Error, r.Redactor.Redact(err.Error())
			return res
		}
		x.sinkMark = *i
	}
	x.env = &tmpl.Env{
		Vars:        x.lookup,
		FixturesDir: r.FixturesDir,
		Checksum: func(alg, call, query string) (string, error) {
			return signer.Checksum(alg, call, query, r.Target.Salt)
		},
	}
	start := time.Now()
	for i, s := range c.Steps {
		sr := x.step(ctx, "steps", i, s)
		res.Steps = append(res.Steps, sr)
		if sr.Status == report.Pass {
			continue
		}
		if s.Call != nil && s.Call.IgnoreResult {
			res.Steps[len(res.Steps)-1].Ignored = true
			res.Warnings = append(res.Warnings, fmt.Sprintf("step %d (line %d), ignored: %s", i+1, s.Line, sr.Message))
			continue
		}
		if res.Status == "" {
			res.Status, res.Reason = sr.Status, fmt.Sprintf("step %d (line %d): %s", i+1, s.Line, sr.Message)
		}
		if r.ContinueOnFail && sr.Status == report.Fail && !sr.Stopped {
			continue
		}
		break
	}
	// Teardown runs whatever happened; its problems are warnings. A fresh
	// context lets it clean up after a cancelled run.
	tctx, cancel := context.WithTimeout(context.WithoutCancel(ctx), 2*DefaultTimeout)
	defer cancel()
	if r.Abort != nil {
		defer context.AfterFunc(r.Abort, cancel)()
	}
	for i, s := range c.Teardown {
		sr := x.step(tctx, "teardown", i, s)
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
	if name == "uid" {
		return x.uid, true
	}
	if v, ok := x.r.lookupTarget(name); ok {
		return v, true
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

func (x *exec) step(ctx context.Context, phase string, i int, s spec.Step) report.StepResult {
	sr := report.StepResult{Index: i, Kind: string(s.Kind), Line: s.Line}
	start := time.Now()
	switch s.Kind {
	case spec.KindWait:
		select {
		case <-time.After(s.Wait):
			sr.Status = report.Pass
		case <-ctx.Done():
			sr.Status, sr.Message = report.Error, ctx.Err().Error()
		}
	case spec.KindCall:
		x.call(ctx, phase, i, s, &sr)
	case spec.KindPresence:
		x.presence(ctx, phase, i, s, &sr)
	case spec.KindGraphQL:
		x.graphql(ctx, phase, i, s, &sr)
	case spec.KindBus:
		x.bus(ctx, phase, i, s, &sr)
	case spec.KindFS:
		x.fs(ctx, phase, i, s, &sr)
	case spec.KindRedis:
		x.redis(ctx, phase, i, s, &sr)
	case spec.KindSink:
		x.sink(ctx, phase, i, s, &sr)
	default:
		sr.Status, sr.Message = report.Skip, "unimplemented: "+string(s.Kind)
	}
	sr.Message = x.redact(sr.Message)
	sr.DurationMS = time.Since(start).Milliseconds()
	return sr
}

func (x *exec) call(ctx context.Context, phase string, index int, s spec.Step, sr *report.StepResult) {
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
		var lastUntil []assert.Result
		var lastErr error
		for attempt := 1; ; attempt++ {
			sr.Attempts = attempt
			// However long the request timeout, an attempt may run past the
			// deadline by at most minAttempt.
			t := timeout
			if rem := time.Until(deadline); rem < t {
				t = max(rem, minAttempt)
			}
			obs, err := x.session.Do(ctx, p, cs.Client, cs.FollowRedirects, t)
			lastErr = err
			if err == nil {
				o = obs
				until, aerr := assert.Check(ev.Until, obs, eval)
				if aerr != nil {
					sr.Status, sr.Message = report.Error, aerr.Error()
					return
				}
				if assert.Passed(until) {
					break
				}
				lastUntil = until
			}
			if time.Now().Add(ev.Every).After(deadline) {
				if o == nil { // the server never answered
					sr.Status, sr.Message = report.Error, lastErr.Error()
					return
				}
				// What the server last said is the result, even if a later
				// attempt then failed to connect.
				msg := fmt.Sprintf("eventually: not within %s (%d attempts): %s", ev.Within, attempt, assert.FirstFailure(lastUntil))
				if lastErr != nil {
					msg += fmt.Sprintf("; the last attempt failed: %v", lastErr)
				}
				sr.Response = x.responseInfo(o)
				pre, err := x.observe(phase, index, s, p, o)
				if err != nil {
					sr.Status, sr.Message = report.Error, err.Error()
					return
				}
				sr.Assertions = x.redactResults(append(pre, lastUntil...))
				sr.Status, sr.Message = report.Fail, msg
				if x.r.ContinueOnFail {
					x.captures(s, o, sr)
				}
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
	pre, err := x.observe(phase, index, s, p, o)
	if err != nil {
		sr.Status, sr.Message = report.Error, err.Error()
		return
	}
	results, err := assert.Check(s.Expect, o, eval)
	if err != nil {
		sr.Status, sr.Message = report.Error, err.Error()
		return
	}
	results = append(pre, results...)
	sr.Assertions = x.redactResults(results)
	sr.Status = report.Pass
	if !assert.Passed(results) {
		sr.Status, sr.Message = report.Fail, assert.FirstFailure(results)
		if !x.r.ContinueOnFail {
			return
		}
	}
	x.captures(s, o, sr)
}

func (x *exec) observe(phase string, index int, s spec.Step, p *client.Prepared, o *observe.Observation) ([]assert.Result, error) {
	if x.r.Observe == nil {
		return nil, nil
	}
	return x.r.Observe(Observed{Case: x.c, UID: x.uid, Phase: phase, Index: index, Golden: GoldenMode(x.c, phase, s), Request: p, Obs: o})
}

// captures stores the step's captures. A capture that finds nothing makes
// the step FAIL and stops the case, even in ContinueOnFail mode, since later
// steps would run on a missing value.
func (x *exec) captures(s spec.Step, o *observe.Observation, sr *report.StepResult) {
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
			if sr.Message != "" {
				sr.Message += "; "
			}
			sr.Message += err.Error()
			sr.Stopped = true
			return
		}
		x.captured[c.Name] = v
		if sr.Captured == nil {
			sr.Captured = map[string]string{}
		}
		sr.Captured[c.Name] = x.redact(v)
	}
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

// clip shortens s to at most n bytes, at a character boundary.
func clip(s string, n int) string {
	if len(s) <= n {
		return s
	}
	for n > 0 && !utf8.RuneStart(s[n]) {
		n--
	}
	return s[:n] + fmt.Sprintf("… (%d bytes more)", len(s)-n)
}
