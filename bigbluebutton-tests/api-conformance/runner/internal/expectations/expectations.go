// Package expectations applies a target's expected-failure list to a run.
//
// A case an entry matches that fails is XFAIL. One that passes is XPASS,
// which fails the run so the stale entry gets removed, but only when the
// entry names the case: a glob stands for a whole unimplemented endpoint,
// some of whose cases may pass anyway.
package expectations

import (
	"bytes"
	"fmt"
	"os"
	"path"
	"strings"

	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/report"
	"gopkg.in/yaml.v3"
)

// File is one expectations file.
type File struct {
	Target   string  `yaml:"target"`
	Expected []Entry `yaml:"expected"`

	Path string `yaml:"-"`
}

// Entry expects the cases it matches to fail. ID is a case ID, the base ID
// of a case with variants, or a glob over case IDs.
type Entry struct {
	ID     string `yaml:"id"`
	Reason string `yaml:"reason"`
	Issue  string `yaml:"issue"`
}

func (e Entry) glob() bool { return strings.ContainsAny(e.ID, "*?[") }

// Load reads an expectations file.
func Load(name string) (*File, error) {
	data, err := os.ReadFile(name)
	if err != nil {
		return nil, err
	}
	f := &File{Path: name}
	dec := yaml.NewDecoder(bytes.NewReader(data))
	dec.KnownFields(true)
	if err := dec.Decode(f); err != nil {
		return nil, fmt.Errorf("%s: %w", name, err)
	}
	if f.Target == "" {
		return nil, fmt.Errorf("%s: target is required", name)
	}
	seen := map[string]bool{}
	for i, e := range f.Expected {
		switch {
		case e.ID == "":
			return nil, fmt.Errorf("%s: expected[%d]: id is required", name, i)
		case e.Reason == "":
			return nil, fmt.Errorf("%s: expected[%d] (%s): reason is required", name, i, e.ID)
		case seen[e.ID]:
			return nil, fmt.Errorf("%s: %s is listed twice", name, e.ID)
		}
		if _, err := path.Match(e.ID, ""); err != nil {
			return nil, fmt.Errorf("%s: expected[%d]: bad glob %q", name, i, e.ID)
		}
		seen[e.ID] = true
	}
	return f, nil
}

// Case identifies a case for matching. BaseID is the ID without the
// variant suffix, "" for a case without variants.
type Case struct {
	ID, BaseID string
}

// CaseFor builds a Case from a case ID and its variant ID.
func CaseFor(id, variant string) Case {
	c := Case{ID: id}
	if variant != "" {
		c.BaseID = strings.TrimSuffix(id, "-"+variant)
	}
	return c
}

// CaseOf derives a Case from a result.
func CaseOf(r *report.CaseResult) Case { return CaseFor(r.ID, r.Variant) }

// How an entry matched a case.
const (
	byID   = "id"
	byBase = "base" // the entry names the case's base ID: all its variants
	byGlob = "glob"
)

func (e Entry) match(c Case) string {
	switch {
	case e.glob():
		if matchGlob(e.ID, c.ID) || (c.BaseID != "" && matchGlob(e.ID, c.BaseID)) {
			return byGlob
		}
	case e.ID == c.ID:
		return byID
	case c.BaseID != "" && e.ID == c.BaseID:
		return byBase
	}
	return ""
}

// Match returns the entry for a case and how it matched. An entry naming
// the case or its base ID wins over a glob.
func (f *File) Match(c Case) (*Entry, string) {
	var globMatch *Entry
	for i := range f.Expected {
		switch f.Expected[i].match(c) {
		case byID, byBase:
			return &f.Expected[i], f.Expected[i].match(c)
		case byGlob:
			if globMatch == nil {
				globMatch = &f.Expected[i]
			}
		}
	}
	if globMatch != nil {
		return globMatch, byGlob
	}
	return nil, ""
}

func matchGlob(pattern, id string) bool {
	ok, _ := path.Match(pattern, id)
	return ok
}

// Apply maps the outcomes of run's cases and recounts.
//   - A listed case that fails is XFAIL.
//   - One listed by its own ID that passes is XPASS.
//   - Variants listed by their base ID are a group: a passing variant is XPASS
//     only when every variant ran and passed, since the entry still covers
//     the ones that fail or didn't run.
//   - A passing case a glob covers stays PASS.
//
// loaded holds every case the run loaded, selected or not: an entry that
// matches none of them is reported as a warning.
func (f *File) Apply(run *report.Run, loaded []Case) {
	groupPasses := map[*Entry]bool{}
	for _, c := range run.Cases {
		if e, how := f.Match(CaseOf(c)); how == byBase {
			if _, seen := groupPasses[e]; !seen {
				groupPasses[e] = true
			}
			groupPasses[e] = groupPasses[e] && c.Status == report.Pass
		}
	}
	ran := map[string]bool{}
	for _, c := range run.Cases {
		ran[c.ID] = true
	}
	for _, c := range loaded {
		if e, how := f.Match(c); how == byBase && !ran[c.ID] {
			groupPasses[e] = false
		}
	}
	for _, c := range run.Cases {
		e, how := f.Match(CaseOf(c))
		if e == nil {
			continue
		}
		c.Expected = &report.Expected{Entry: e.ID, Reason: e.Reason, Issue: e.Issue, Glob: how == byGlob, Group: how == byBase}
		stale := how == byID || (how == byBase && groupPasses[e])
		switch {
		case c.Status == report.Fail:
			c.Status = report.XFail
			c.Reason = e.Reason + " (" + c.Reason + ")"
		case c.Status == report.Pass && stale:
			c.Status = report.XPass
			c.Reason = fmt.Sprintf("passed, but %s expects it to fail (%s): remove the entry", f.Path, e.Reason)
		}
	}
	for _, e := range f.Expected {
		used := false
		for _, c := range loaded {
			if e.match(c) != "" {
				used = true
				break
			}
		}
		if !used {
			run.Warnings = append(run.Warnings, fmt.Sprintf("%s: %s matches no case", f.Path, e.ID))
		}
	}
	run.Tally()
}
