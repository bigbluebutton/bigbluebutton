// Package assert checks an Observation against a case's expect block.
package assert

import (
	"fmt"
	"regexp"
	"strconv"
	"strings"
	"unicode/utf8"

	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/observe"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/spec"
)

// Result is one check.
type Result struct {
	What     string `json:"what"`
	Expected string `json:"expected"`
	Actual   string `json:"actual"`
	OK       bool   `json:"ok"`
}

// Eval expands the templates in matcher arguments.
type Eval func(string) (string, error)

// Error is a problem that stops checking, as opposed to a failed check:
// a template that won't expand.
type Error struct{ Err error }

func (e *Error) Error() string { return e.Err.Error() }
func (e *Error) Unwrap() error { return e.Err }

// Check runs every check in e. A response that can't be read the way a
// check needs (not XML, not JSON) is a failed check, not an error: it says
// something about the server.
func Check(e *spec.Expect, o *observe.Observation, eval Eval) ([]Result, error) {
	if e == nil {
		return nil, nil
	}
	c := &checker{o: o, eval: eval}
	if e.Status != nil {
		c.match("status", *e.Status, []string{strconv.Itoa(o.Status)}, false)
	}
	if e.Format != "" {
		c.add(Result{What: "format", Expected: e.Format, Actual: o.Format(), OK: o.Format() == e.Format})
		if o.Format() == e.Format {
			switch e.Format {
			case "xml":
				if _, err := o.XML(); err != nil {
					c.add(Result{What: "format", Expected: "valid XML", Actual: err.Error()})
				}
			case "json":
				if _, err := o.JSON(); err != nil {
					c.add(Result{What: "format", Expected: "valid JSON", Actual: err.Error()})
				}
			}
		}
	}
	for _, h := range e.Headers {
		name, ok := c.expand(h.Key)
		if !ok {
			continue
		}
		c.match("header "+name, h.M, o.Header.Values(name), true)
	}
	for _, f := range []struct {
		name string
		m    *spec.Matcher
	}{{"returncode", e.Returncode}, {"messageKey", e.MessageKey}, {"message", e.Message}} {
		if f.m == nil {
			continue
		}
		v, ok, err := o.Response(f.name)
		if err != nil {
			c.add(Result{What: f.name, Expected: describe(*f.m, c), Actual: err.Error()})
			continue
		}
		var vals []string
		if ok {
			vals = []string{v}
		}
		c.match(f.name, *f.m, vals, false)
	}
	for _, x := range e.XPath {
		key, ok := c.expand(x.Key)
		if !ok {
			continue
		}
		vals, err := o.SelectXPath(key)
		if err != nil {
			c.add(Result{What: "xpath " + key, Expected: describe(x.M, c), Actual: err.Error()})
			continue
		}
		c.match("xpath "+key, x.M, vals, false)
	}
	for _, j := range e.JSONPath {
		key, ok := c.expand(j.Key)
		if !ok {
			continue
		}
		vals, err := o.SelectJSONPath(key)
		if err != nil {
			c.add(Result{What: "jsonpath " + key, Expected: describe(j.M, c), Actual: err.Error()})
			continue
		}
		c.match("jsonpath "+key, j.M, vals, false)
	}
	if e.Body != nil {
		c.match("body", *e.Body, []string{string(o.Body)}, false)
	}
	if r := e.Redirect; r != nil {
		var host, path []string
		if o.Location != nil {
			host, path = []string{o.Location.Host}, []string{o.Location.Path}
		}
		if r.Host != nil {
			c.match("redirect host", *r.Host, host, false)
		}
		if r.Path != nil {
			c.match("redirect path", *r.Path, path, false)
		}
		for _, q := range r.Query {
			key, ok := c.expand(q.Key)
			if !ok {
				continue
			}
			var vals []string
			if o.Location != nil {
				vals = o.Location.Query()[key]
			}
			c.match("redirect query "+key, q.M, vals, true)
		}
	}
	return c.results, c.err
}

// Passed reports whether every result is OK.
func Passed(rs []Result) bool {
	for _, r := range rs {
		if !r.OK {
			return false
		}
	}
	return true
}

// FirstFailure describes the first failed result, or "".
func FirstFailure(rs []Result) string {
	for _, r := range rs {
		if !r.OK {
			return fmt.Sprintf("%s: expected %s, got %s", r.What, r.Expected, r.Actual)
		}
	}
	return ""
}

// Match applies m to values, any one of which may satisfy a value matcher;
// exists, absent and count look at how many there are. what names the
// check in the result.
func Match(what string, m spec.Matcher, vals []string, eval Eval) (Result, error) {
	c := &checker{eval: eval}
	c.match(what, m, vals, true)
	if c.err != nil {
		return Result{}, c.err
	}
	return c.results[0], nil
}

type checker struct {
	o       *observe.Observation
	eval    Eval
	results []Result
	err     error
}

func (c *checker) add(r Result) { c.results = append(c.results, r) }

func (c *checker) expand(s string) (string, bool) {
	if c.err != nil {
		return "", false
	}
	v, err := c.eval(s)
	if err != nil {
		c.err = &Error{err}
		return "", false
	}
	return v, true
}

// match applies m to the selected values. Value matchers (equals, regex,
// type, contains, oneOf) need exactly one value, unless any is set: then
// any one value may match, as for repeated headers.
func (c *checker) match(what string, m spec.Matcher, vals []string, any bool) {
	if c.err != nil {
		return
	}
	r := Result{What: what, Expected: describe(m, c), Actual: actual(vals)}
	if c.err != nil {
		return
	}
	switch m.Op {
	case "exists":
		r.OK = len(vals) > 0
	case "absent":
		r.OK = len(vals) == 0
	case "count":
		r.OK = len(vals) == m.N
	default:
		pass := func(v string) bool {
			ok, err := c.value(m, v)
			if err != nil {
				c.err = &Error{err}
			}
			return ok
		}
		switch {
		case any:
			for _, v := range vals {
				if pass(v) {
					r.OK = true
					break
				}
			}
		case len(vals) == 1:
			r.OK = pass(vals[0])
		}
	}
	if c.err == nil {
		c.add(r)
	}
}

func (c *checker) value(m spec.Matcher, v string) (bool, error) {
	switch m.Op {
	case "eq":
		want, err := c.eval(m.Arg)
		return v == want, err
	case "regex":
		pat, err := c.eval(m.Arg)
		if err != nil {
			return false, err
		}
		re, err := regexp.Compile(pat)
		if err != nil {
			return false, fmt.Errorf("bad regex %q: %w", pat, err)
		}
		return re.MatchString(v), nil
	case "contains":
		sub, err := c.eval(m.Arg)
		return strings.Contains(v, sub), err
	case "type":
		switch m.Arg {
		case "int":
			_, err := strconv.ParseInt(v, 10, 64)
			return err == nil, nil
		case "bool":
			return v == "true" || v == "false", nil
		}
		return false, fmt.Errorf("unknown type %q", m.Arg)
	case "oneOf":
		for _, a := range m.Args {
			want, err := c.eval(a)
			if err != nil {
				return false, err
			}
			if v == want {
				return true, nil
			}
		}
		return false, nil
	}
	return false, fmt.Errorf("unknown matcher %q", m.Op)
}

// describe renders what a matcher expects, with templates expanded.
func describe(m spec.Matcher, c *checker) string {
	ex := func(s string) string {
		v, err := c.eval(s)
		if err != nil {
			if c.err == nil {
				c.err = &Error{err}
			}
			return s
		}
		return v
	}
	switch m.Op {
	case "eq":
		return strconv.Quote(ex(m.Arg))
	case "exists":
		return "present"
	case "absent":
		return "absent"
	case "count":
		return fmt.Sprintf("%d value(s)", m.N)
	case "regex":
		return "matching /" + ex(m.Arg) + "/"
	case "contains":
		return "containing " + strconv.Quote(ex(m.Arg))
	case "type":
		return "of type " + m.Arg
	case "oneOf":
		var parts []string
		for _, a := range m.Args {
			parts = append(parts, strconv.Quote(ex(a)))
		}
		return "one of " + strings.Join(parts, ", ")
	}
	return m.Op
}

func actual(vals []string) string {
	switch len(vals) {
	case 0:
		return "nothing"
	case 1:
		return strconv.Quote(truncate(vals[0]))
	}
	var parts []string
	for _, v := range vals {
		parts = append(parts, strconv.Quote(truncate(v)))
	}
	return fmt.Sprintf("%d values: %s", len(vals), strings.Join(parts, ", "))
}

const maxShown = 300

// truncate shortens s for messages, at a character boundary.
func truncate(s string) string {
	if len(s) <= maxShown {
		return s
	}
	n := maxShown
	for n > 0 && !utf8.RuneStart(s[n]) {
		n--
	}
	return s[:n] + "…"
}
