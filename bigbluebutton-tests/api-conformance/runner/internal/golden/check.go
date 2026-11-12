package golden

import (
	"errors"
	"fmt"
	"io/fs"
	"strings"
	"sync"

	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/assert"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/normalize"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/spec"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/steps"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/target"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/tmpl"
)

// maxMismatches bounds the results one step's comparison reports.
const maxMismatches = 20

// Checker holds a run to the recordings in a directory: every compare step
// must answer as recorded. Hook it up with r.Before = k.Before and
// r.Observe = k.Observe.
type Checker struct {
	dir string
	col *Collector

	mu    sync.Mutex
	files map[string]*File
}

// NewChecker returns a checker for the recordings under dir. Responses are
// normalized with rules and redacted with red, as record does.
func NewChecker(dir string, t *target.Target, rules *normalize.Rules, red *tmpl.Redactor) *Checker {
	col := NewCollector(t, rules, red)
	col.discard = true // only each answer's lines are needed, once
	return &Checker{dir: dir, col: col, files: map[string]*File{}}
}

// Before reads c's recording. A case with something to compare needs one,
// and a recording made from another version of the case is refused.
func (k *Checker) Before(c *spec.Case) error {
	f, err := Read(Path(k.dir, c))
	switch {
	case errors.Is(err, fs.ErrNotExist):
		for _, s := range Sections(c) {
			if !s.Document {
				return errors.New("no recording: run bbb-conform record")
			}
		}
		return nil
	case err != nil:
		return err
	}
	if why := Stale(f, c); why != "" {
		return fmt.Errorf("the recording is stale: %s. Record the case again", why)
	}
	k.mu.Lock()
	k.files[c.ID] = f
	k.mu.Unlock()
	return nil
}

// Observe compares a compare step's answer with its recording.
func (k *Checker) Observe(ev steps.Observed) ([]assert.Result, error) {
	got := k.col.Add(ev)
	if ev.Golden != "compare" {
		return nil, nil
	}
	k.mu.Lock()
	f := k.files[ev.Case.ID]
	k.mu.Unlock()
	if f != nil {
		for _, s := range f.Sections {
			if s.Key == (Key{ev.Phase, ev.Index}) {
				return Mismatches(s.Lines, got), nil
			}
		}
	}
	return nil, errors.New("no recording of this step: run bbb-conform record")
}

// Mismatches compares an answer's lines with the recorded ones. Each
// changed line becomes a failed result for what the line is about, a
// removed and an added line about the same thing making one result.
// Unchanged answers give one passing result.
func Mismatches(want, got []string) []assert.Result {
	hunk := Lines(want, got)
	if hunk == nil {
		return []assert.Result{{What: "recording", Expected: "the recorded answer", Actual: "the same", OK: true}}
	}
	type change struct {
		key, value string
		paired     bool
	}
	var removed, added []*change
	for _, l := range hunk {
		k, v := normalize.Split(l[2:])
		if v == "" {
			v = "(empty)"
		}
		if strings.HasPrefix(l, "-") {
			removed = append(removed, &change{key: k, value: v})
		} else {
			added = append(added, &change{key: k, value: v})
		}
	}
	var out []assert.Result
	for _, r := range removed {
		res := assert.Result{What: "recording " + r.key, Expected: r.value, Actual: "nothing"}
		for _, a := range added {
			if !a.paired && a.key == r.key {
				a.paired, res.Actual = true, a.value
				break
			}
		}
		out = append(out, res)
	}
	for _, a := range added {
		if !a.paired {
			out = append(out, assert.Result{What: "recording " + a.key, Expected: "nothing", Actual: a.value})
		}
	}
	if len(out) > maxMismatches {
		more := len(out) - maxMismatches
		out = append(out[:maxMismatches], assert.Result{What: "recording", Expected: "the recorded answer", Actual: fmt.Sprintf("%d more difference(s)", more)})
	}
	return out
}
