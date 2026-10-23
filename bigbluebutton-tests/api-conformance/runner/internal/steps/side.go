package steps

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/url"
	"slices"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/assert"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/observe"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/report"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/spec"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/tap"
)

// pollEvery is how often fs and redis steps look again within their
// window; bus steps wait on the tap instead.
const pollEvery = 250 * time.Millisecond

// The steps that check what the server did outside its answers, through
// the target's tap. Each looks for something during its window: a
// message, a file or a key, with the step's filters choosing what counts.
// By default the step passes at the first match; absent passes if nothing
// matches in the whole window; count checks how many messages matched by
// its end; exists: false passes once the file or key is gone. What the
// tap may have missed (a lost subscription, lost file events, a
// directory it can't watch) makes a step whose result rests on not
// seeing something an ERROR.

// needsMark says whether a case looks at the bus or files, which it does
// from a mark taken before its first step.
func needsMark(c *spec.Case) bool {
	for _, s := range append(append([]spec.Step{}, c.Steps...), c.Teardown...) {
		if s.Kind == spec.KindBus || s.Kind == spec.KindFS {
			return true
		}
	}
	return false
}

// usesTap says whether a case's steps, not counting its teardown, have
// one the tap answers.
func usesTap(c *spec.Case) bool {
	for _, s := range c.Steps {
		if s.Kind == spec.KindBus || s.Kind == spec.KindFS || s.Kind == spec.KindRedis {
			return true
		}
	}
	return false
}

type mode int

const (
	modeFind mode = iota
	modeAbsent
	modeCount
	modeGone
)

func modeOf(e *spec.Expect) mode {
	switch {
	case e == nil:
		return modeFind
	case e.Absent:
		return modeAbsent
	case e.Count != nil:
		return modeCount
	case e.Exists != nil && !*e.Exists:
		return modeGone
	}
	return modeFind
}

func (x *exec) bus(ctx context.Context, phase string, index int, s spec.Step, sr *report.StepResult) {
	b, e := s.Bus, s.Expect
	var name, meetingID, channel string
	var err error
	for _, f := range []struct {
		dst *string
		src string
	}{{&name, b.Name}, {&meetingID, b.MeetingID}, {&channel, b.Channel}} {
		if *f.dst, err = x.expand(f.src); err != nil {
			sr.Status, sr.Message = report.Error, err.Error()
			return
		}
	}
	q := url.Values{"name": {name}}
	if meetingID != "" {
		q.Set("meetingId", meetingID)
	}
	if channel != "" {
		q.Set("channel", channel)
	}
	sr.Request = &report.Request{Method: "BUS", URL: x.redact(x.r.Target.TapURL + "/bus?" + q.Encode())}
	m := modeOf(e)
	deadline := time.Now().Add(b.Within)
	after, gap := x.mark.Seq, false
	var matches [][]byte // documents of the messages that pass the filters
	var firstMiss []assert.Result
	candidates := 0
	for {
		res, err := x.r.Tap.Bus(ctx, tap.BusQuery{Mark: x.mark, After: after, Name: name, MeetingID: meetingID, Channel: channel, Wait: time.Until(deadline)})
		if err == nil && res.Truncated {
			err = errors.New("the tap no longer holds all of this case's messages: start it with a larger --max-mb")
		}
		if err != nil {
			sr.Status, sr.Message = report.Error, err.Error()
			return
		}
		after, gap = res.Seq, gap || res.Gap
		for _, msg := range res.Messages {
			candidates++
			doc := withChannel(msg.Message, msg.Channel)
			results, err := assert.Check(filters(e), documentObservation(doc), assert.Eval(x.expand))
			if err != nil {
				sr.Status, sr.Message = report.Error, err.Error()
				return
			}
			if assert.Passed(results) {
				matches = append(matches, doc)
			} else if firstMiss == nil {
				firstMiss = results
			}
		}
		done := time.Now().After(deadline) || ctx.Err() != nil
		if (m == modeFind || m == modeAbsent) && len(matches) > 0 || done {
			break
		}
	}
	what := "bus " + name
	var doc []byte
	if len(matches) > 0 {
		doc = matches[0]
	} else {
		doc = []byte("null")
	}
	var result assert.Result
	switch m {
	case modeAbsent:
		result = assert.Result{What: what, Expected: "none within " + b.Within.String(), Actual: "nothing", OK: len(matches) == 0}
		if len(matches) > 0 {
			result.Actual = "one on " + jsonField(matches[0], "channel")
		}
	case modeCount:
		r, err := assert.Match(what+" count", *e.Count, []string{strconv.Itoa(len(matches))}, assert.Eval(x.expand))
		if err != nil {
			sr.Status, sr.Message = report.Error, err.Error()
			return
		}
		result = r
	default:
		result = assert.Result{What: what, Expected: "a message within " + b.Within.String(), Actual: "one", OK: len(matches) > 0}
		if len(matches) == 0 {
			result.Actual = x.busSeen(ctx, meetingID, candidates)
		}
	}
	if gap && !(m == modeFind && result.OK) {
		sr.Status, sr.Message = report.Error, "the tap lost its redis subscription during the window, so it may have missed messages"
		return
	}
	results := []assert.Result{result}
	if !result.OK && m == modeFind {
		results = append(results, firstMiss...)
	}
	x.settle(phase, index, s, nil, doc, sr, checked(results))
}

// busSeen describes what a bus step saw instead of a match: candidates
// its filters turned down, or the messages the meeting got.
func (x *exec) busSeen(ctx context.Context, meetingID string, candidates int) string {
	if candidates > 0 {
		return fmt.Sprintf("%d message(s) of that name, none passing the filters", candidates)
	}
	if meetingID == "" {
		return "none"
	}
	res, err := x.r.Tap.Bus(ctx, tap.BusQuery{Mark: x.mark, After: x.mark.Seq, MeetingID: meetingID})
	if err != nil || len(res.Messages) == 0 {
		return "none, and no message about that meeting"
	}
	var names []string
	for _, m := range res.Messages {
		if n := jsonField(m.Message, "envelope", "name"); n != "" && !slices.Contains(names, n) {
			names = append(names, n)
		}
	}
	return "none; the meeting got " + strings.Join(names, ", ")
}

// pollAgain waits until an fs or redis step should look again, and says
// whether it should: the last look is at the window's end, not before.
func pollAgain(ctx context.Context, deadline time.Time) bool {
	left := time.Until(deadline)
	if left <= 0 || ctx.Err() != nil {
		return false
	}
	select {
	case <-time.After(min(pollEvery, left)):
		return true
	case <-ctx.Done():
		return false
	}
}

// checked gives settle results worked out already.
func checked(results []assert.Result) func(*observe.Observation) ([]assert.Result, error) {
	return func(*observe.Observation) ([]assert.Result, error) { return results, nil }
}

// filters is the part of a step's expect that chooses what counts as a
// match.
func filters(e *spec.Expect) *spec.Expect {
	if e == nil {
		return nil
	}
	return &spec.Expect{JSONPath: e.JSONPath}
}

// withChannel adds the channel a message came on to it, as the step's
// document.
func withChannel(msg json.RawMessage, channel string) []byte {
	dec := json.NewDecoder(bytes.NewReader(msg))
	dec.UseNumber()
	var m map[string]any
	if dec.Decode(&m) != nil {
		m = map[string]any{"message": string(msg)}
	}
	m["channel"] = channel
	b, _ := json.Marshal(m)
	return b
}

func jsonField(doc []byte, path ...string) string {
	var v any
	if json.Unmarshal(doc, &v) != nil {
		return ""
	}
	for _, p := range path {
		m, _ := v.(map[string]any)
		v = m[p]
	}
	s, _ := v.(string)
	return s
}

func (x *exec) fs(ctx context.Context, phase string, index int, s spec.Step, sr *report.StepResult) {
	f, e := s.FS, s.Expect
	glob, err := x.expand(f.Path)
	if err != nil {
		sr.Status, sr.Message = report.Error, err.Error()
		return
	}
	sr.Request = &report.Request{Method: "FS", URL: x.redact(x.r.Target.TapURL + "/fs?" + url.Values{"path": {glob}}.Encode())}
	m := modeOf(e)
	// A file that came and went counts when nothing is asked of its
	// contents; only then does what the tap may miss matter.
	appeared := e == nil || (e.Contents == nil && len(e.JSONPath) == 0)
	deadline := time.Now().Add(f.Within)
	gap, unwatched := false, ""
	var doc []byte
	var firstMiss []assert.Result
	var found, gone bool
	for {
		res, err := x.r.Tap.FS(ctx, x.mark, glob)
		if err == nil && res.Truncated {
			err = errors.New("the tap no longer holds all of this case's file events: start it with a larger --max-mb")
		}
		if err != nil {
			sr.Status, sr.Message = report.Error, err.Error()
			return
		}
		gap = gap || res.Gap
		if res.WatchError != "" {
			unwatched = res.WatchError
		}
		gone = len(res.Files) == 0
		for _, file := range res.Files {
			d := fileDoc(file.Path, true, &file)
			results, err := x.fileChecks(e, d, file.Contents)
			if err != nil {
				sr.Status, sr.Message = report.Error, err.Error()
				return
			}
			if assert.Passed(results) {
				doc, found = d, true
				break
			}
			if firstMiss == nil {
				firstMiss = results
			}
		}
		if !found && appeared && len(res.Appeared) > 0 {
			doc, found = fileDoc(res.Appeared[0].Path, true, nil), true
		}
		if m == modeGone && gone || m != modeGone && found || !pollAgain(ctx, deadline) {
			break
		}
	}
	what := "fs " + glob
	var result assert.Result
	switch m {
	case modeGone:
		result = assert.Result{What: what, Expected: "gone within " + f.Within.String(), Actual: "still there", OK: gone}
		doc = fileDoc(glob, !gone, nil)
	case modeAbsent:
		result = assert.Result{What: what, Expected: "none within " + f.Within.String(), Actual: "nothing", OK: !found}
		if found {
			result.Actual = jsonField(doc, "path")
		} else {
			doc = fileDoc(glob, false, nil)
		}
	default:
		result = assert.Result{What: what, Expected: "a file within " + f.Within.String(), Actual: "one", OK: found}
		if !found {
			result.Actual = "none"
			doc = fileDoc(glob, false, nil)
		}
	}
	if appeared && (m == modeAbsent && result.OK || m == modeFind && !result.OK) {
		switch {
		case unwatched != "":
			sr.Status, sr.Message = report.Error, "the tap would miss a file that came and went: "+unwatched
			return
		case gap:
			sr.Status, sr.Message = report.Error, "the tap lost file events during the window, so it may have missed a file"
			return
		}
	}
	results := []assert.Result{result}
	if !result.OK && m == modeFind {
		results = append(results, firstMiss...)
	}
	x.settle(phase, index, s, nil, doc, sr, checked(results))
}

// fileDoc is an fs step's document: the path, whether it was found, and
// its contents, as JSON when they parse.
func fileDoc(path string, found bool, f *tap.File) []byte {
	d := map[string]any{"path": path, "found": found}
	if f != nil && f.Contents != "" && f.Encoding == "" {
		var v any
		dec := json.NewDecoder(strings.NewReader(f.Contents))
		dec.UseNumber()
		if dec.Decode(&v) == nil && !dec.More() {
			d["contents"] = v
		} else {
			d["contents"] = f.Contents
		}
	} else if f != nil && f.Contents != "" {
		d["contents"] = f.Contents
	}
	b, _ := json.Marshal(d)
	return b
}

// fileChecks applies an fs step's filters to one file.
func (x *exec) fileChecks(e *spec.Expect, doc []byte, contents string) ([]assert.Result, error) {
	if e == nil {
		return nil, nil
	}
	results, err := assert.Check(filters(e), documentObservation(doc), assert.Eval(x.expand))
	if err != nil || e.Contents == nil {
		return results, err
	}
	r, err := assert.Match("contents", *e.Contents, []string{contents}, assert.Eval(x.expand))
	return append(results, r), err
}

func (x *exec) redis(ctx context.Context, phase string, index int, s spec.Step, sr *report.StepResult) {
	r, e := s.Redis, s.Expect
	key, err := x.expand(r.Key)
	if err != nil {
		sr.Status, sr.Message = report.Error, err.Error()
		return
	}
	sr.Request = &report.Request{Method: "REDIS", URL: x.redact(x.r.Target.TapURL + "/redis?" + url.Values{"key": {key}}.Encode())}
	m := modeOf(e)
	deadline := time.Now().Add(r.Within)
	var v *tap.RedisValue
	var results []assert.Result
	var matched, seen bool
	for {
		if v, err = x.r.Tap.Redis(ctx, key); err != nil {
			sr.Status, sr.Message = report.Error, err.Error()
			return
		}
		exists := v.Type != "none"
		if results, err = x.keyChecks(e, v); err != nil {
			sr.Status, sr.Message = report.Error, err.Error()
			return
		}
		matched = exists && assert.Passed(results)
		seen = seen || matched
		if m == modeGone && !exists || m != modeGone && matched || !pollAgain(ctx, deadline) {
			break
		}
	}
	doc, _ := json.Marshal(v)
	what := "redis " + key
	var result assert.Result
	switch m {
	case modeGone:
		result = assert.Result{What: what, Expected: "gone within " + r.Within.String(), Actual: "still there", OK: v.Type == "none"}
	case modeAbsent:
		result = assert.Result{What: what, Expected: "absent for " + r.Within.String(), Actual: "absent", OK: !seen}
		if seen {
			result.Actual = "a " + v.Type
		}
	default:
		result = assert.Result{What: what, Expected: "present within " + r.Within.String(), Actual: "a " + v.Type, OK: v.Type != "none"}
		if v.Type == "none" {
			result.Actual = "absent"
		}
	}
	all := []assert.Result{result}
	if m == modeFind && v.Type != "none" {
		all = append(all, results...)
	}
	x.settle(phase, index, s, nil, doc, sr, checked(all))
}

// keyChecks applies a redis step's filters to the key's value.
func (x *exec) keyChecks(e *spec.Expect, v *tap.RedisValue) ([]assert.Result, error) {
	if e == nil {
		return nil, nil
	}
	eval := assert.Eval(x.expand)
	var out []assert.Result
	hash, _ := v.Value.(map[string]any)
	for _, nm := range e.Hash {
		field, err := x.expand(nm.Key)
		if err != nil {
			return nil, err
		}
		var vals []string
		if f, ok := hash[field]; ok {
			vals = []string{fmt.Sprint(f)}
		}
		r, err := assert.Match("hash "+field, nm.M, vals, eval)
		if err != nil {
			return nil, err
		}
		out = append(out, r)
	}
	if e.HasMembers {
		want := make([]string, len(e.Members))
		for i, m := range e.Members {
			var err error
			if want[i], err = x.expand(m); err != nil {
				return nil, err
			}
		}
		sort.Strings(want)
		var got []string
		if list, ok := v.Value.([]any); ok {
			for _, m := range list {
				got = append(got, fmt.Sprint(m))
			}
		}
		sort.Strings(got)
		out = append(out, assert.Result{What: "members", Expected: fmt.Sprintf("%q", want), Actual: fmt.Sprintf("%q", got), OK: slices.Equal(want, got)})
	}
	if e.TTL != nil {
		r, err := assert.Match("ttl", *e.TTL, []string{strconv.FormatInt(v.TTL, 10)}, eval)
		if err != nil {
			return nil, err
		}
		out = append(out, r)
	}
	return out, nil
}
