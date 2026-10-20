// Package report holds run results and writes them as console text, JUnit
// XML and JSON.
package report

import (
	"encoding/json"
	"encoding/xml"
	"fmt"
	"io"
	"sort"
	"strings"
	"time"

	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/assert"
)

// Status is the outcome of a case or a step.
type Status string

const (
	Pass  Status = "PASS"
	Fail  Status = "FAIL"  // the server's behaviour didn't match
	Error Status = "ERROR" // the runner couldn't do what the case asked
	Skip  Status = "SKIP"
	XFail Status = "XFAIL" // failed, as an expected-failure entry says it will
	XPass Status = "XPASS" // passed, though an entry by its exact ID expects a failure
)

// Run is one bbb-conform run.
type Run struct {
	Target     string        `json:"target"`
	Started    time.Time     `json:"started"`
	DurationMS int64         `json:"duration_ms"`
	Counts     Counts        `json:"counts"`
	Warnings   []string      `json:"warnings,omitempty"`
	Cases      []*CaseResult `json:"cases"`
}

// Counts tallies case outcomes.
type Counts struct {
	Total   int `json:"total"`
	Passed  int `json:"passed"`
	Failed  int `json:"failed"`
	Errors  int `json:"errors"`
	Skipped int `json:"skipped"`
	XFailed int `json:"xfailed,omitempty"`
	XPassed int `json:"xpassed,omitempty"`
}

// CaseResult is one case.
type CaseResult struct {
	ID       string `json:"id"`
	Title    string `json:"title"`
	Endpoint string `json:"endpoint"`
	Class    string `json:"class"`
	Variant  string `json:"variant,omitempty"`
	Area     string `json:"area"`
	File     string `json:"file"`
	Line     int    `json:"line"`
	Status   Status `json:"status"`
	Reason   string `json:"reason,omitempty"`
	// Expected is the expected-failure entry that matched the case, if any.
	Expected   *Expected    `json:"expected,omitempty"`
	DurationMS int64        `json:"duration_ms"`
	Steps      []StepResult `json:"steps,omitempty"`
	Teardown   []StepResult `json:"teardown,omitempty"`
	Warnings   []string     `json:"warnings,omitempty"`
}

// Expected is an expected-failure entry that matched a case.
type Expected struct {
	Entry  string `json:"entry"` // the entry's ID or glob
	Reason string `json:"reason"`
	Issue  string `json:"issue,omitempty"`
	Glob   bool   `json:"glob,omitempty"`  // matched only by a glob
	Group  bool   `json:"group,omitempty"` // matched by the base ID of the case's variants
}

// StepResult is one step.
type StepResult struct {
	Index      int               `json:"index"`
	Kind       string            `json:"kind"`
	Line       int               `json:"line"`
	Status     Status            `json:"status"`
	Message    string            `json:"message,omitempty"`
	Ignored    bool              `json:"ignored,omitempty"`
	Stopped    bool              `json:"-"` // a capture failed, so the case can't go on
	Attempts   int               `json:"attempts,omitempty"`
	DurationMS int64             `json:"duration_ms"`
	Request    *Request          `json:"request,omitempty"`
	Response   *Response         `json:"response,omitempty"`
	Document   string            `json:"document,omitempty"` // what a presence or graphql step returned
	Assertions []assert.Result   `json:"assertions,omitempty"`
	Captured   map[string]string `json:"captured,omitempty"`
}

// Request is what a call step sent.
type Request struct {
	Method  string            `json:"method"`
	URL     string            `json:"url"`
	Headers map[string]string `json:"headers,omitempty"`
	Body    string            `json:"body,omitempty"`
	Chunked bool              `json:"chunked,omitempty"`
}

// Response is what a call step got back.
type Response struct {
	Status  int               `json:"status"`
	Format  string            `json:"format"`
	Headers map[string]string `json:"headers,omitempty"`
	Body    string            `json:"body,omitempty"`
}

// Tally fills in r.Counts.
func (r *Run) Tally() {
	r.Counts = Counts{Total: len(r.Cases)}
	for _, c := range r.Cases {
		switch c.Status {
		case Pass:
			r.Counts.Passed++
		case Fail:
			r.Counts.Failed++
		case Error:
			r.Counts.Errors++
		case Skip:
			r.Counts.Skipped++
		case XFail:
			r.Counts.XFailed++
		case XPass:
			r.Counts.XPassed++
		}
	}
}

// OK reports whether nothing failed, errored or unexpectedly passed.
func (r *Run) OK() bool { return r.Counts.Failed == 0 && r.Counts.Errors == 0 && r.Counts.XPassed == 0 }

// WriteConsole writes one line per case and a summary. With verbose, it
// also lists every failed check and warning.
func WriteConsole(w io.Writer, r *Run, verbose bool) {
	for _, c := range r.Cases {
		line := fmt.Sprintf("%-5s %s", c.Status, c.ID)
		if c.Status != Skip {
			line += fmt.Sprintf(" (%s)", ms(c.DurationMS))
		}
		if c.Reason != "" {
			line += "\n      " + c.Reason
		}
		fmt.Fprintln(w, line)
		if !verbose {
			continue
		}
		for _, s := range append(append([]StepResult{}, c.Steps...), c.Teardown...) {
			for _, a := range s.Assertions {
				if !a.OK {
					fmt.Fprintf(w, "      line %d: %s: expected %s, got %s\n", s.Line, a.What, a.Expected, a.Actual)
				}
			}
		}
		for _, warn := range c.Warnings {
			fmt.Fprintf(w, "      warning: %s\n", warn)
		}
	}
	for _, warn := range r.Warnings {
		fmt.Fprintf(w, "warning: %s\n", warn)
	}
	extra := ""
	if r.Counts.XFailed > 0 {
		extra += fmt.Sprintf(", %d expected failures", r.Counts.XFailed)
	}
	if r.Counts.XPassed > 0 {
		extra += fmt.Sprintf(", %d passed unexpectedly", r.Counts.XPassed)
	}
	fmt.Fprintf(w, "\n%d case(s): %d passed, %d failed, %d errors, %d skipped%s (%s)\n",
		r.Counts.Total, r.Counts.Passed, r.Counts.Failed, r.Counts.Errors, r.Counts.Skipped, extra, ms(r.DurationMS))
}

func ms(v int64) string { return (time.Duration(v) * time.Millisecond).String() }

// WriteJSON writes the whole run, indented.
func WriteJSON(w io.Writer, r *Run) error {
	enc := json.NewEncoder(w)
	enc.SetEscapeHTML(false)
	enc.SetIndent("", "  ")
	return enc.Encode(r)
}

type junitSuites struct {
	XMLName  xml.Name     `xml:"testsuites"`
	Name     string       `xml:"name,attr"`
	Tests    int          `xml:"tests,attr"`
	Failures int          `xml:"failures,attr"`
	Errors   int          `xml:"errors,attr"`
	Skipped  int          `xml:"skipped,attr"`
	Time     string       `xml:"time,attr"`
	Suites   []junitSuite `xml:"testsuite"`
}

type junitSuite struct {
	Name     string      `xml:"name,attr"`
	Tests    int         `xml:"tests,attr"`
	Failures int         `xml:"failures,attr"`
	Errors   int         `xml:"errors,attr"`
	Skipped  int         `xml:"skipped,attr"`
	Time     string      `xml:"time,attr"`
	Cases    []junitCase `xml:"testcase"`
}

type junitCase struct {
	Name      string        `xml:"name,attr"`
	Classname string        `xml:"classname,attr"`
	File      string        `xml:"file,attr,omitempty"`
	Line      int           `xml:"line,attr,omitempty"`
	Time      string        `xml:"time,attr"`
	Failure   *junitProblem `xml:"failure,omitempty"`
	Error     *junitProblem `xml:"error,omitempty"`
	Skipped   *junitProblem `xml:"skipped,omitempty"`
	SystemOut string        `xml:"system-out,omitempty"`
}

type junitProblem struct {
	Message string `xml:"message,attr"`
	Text    string `xml:",chardata"`
}

func seconds(msv int64) string { return fmt.Sprintf("%.3f", float64(msv)/1000) }

// WriteJUnit writes one testsuite per area, in name order.
func WriteJUnit(w io.Writer, r *Run) error {
	byArea := map[string]*junitSuite{}
	var times = map[string]int64{}
	for _, c := range r.Cases {
		s := byArea[c.Area]
		if s == nil {
			s = &junitSuite{Name: c.Area}
			byArea[c.Area] = s
		}
		jc := junitCase{Name: c.ID, Classname: c.Area, File: c.File, Line: c.Line, Time: seconds(c.DurationMS)}
		detail := details(c)
		switch c.Status {
		case Fail:
			jc.Failure = &junitProblem{Message: c.Reason, Text: detail}
			s.Failures++
		case Error:
			jc.Error = &junitProblem{Message: c.Reason, Text: detail}
			s.Errors++
		case Skip:
			jc.Skipped = &junitProblem{Message: c.Reason}
			s.Skipped++
		case XFail:
			jc.Skipped = &junitProblem{Message: "xfail: " + c.Reason}
			s.Skipped++
		case XPass:
			jc.Failure = &junitProblem{Message: c.Reason}
			s.Failures++
		}
		if len(c.Warnings) > 0 {
			jc.SystemOut = "warning: " + strings.Join(c.Warnings, "\nwarning: ")
		}
		s.Tests++
		times[c.Area] += c.DurationMS
		s.Cases = append(s.Cases, jc)
	}
	out := junitSuites{Name: "bbb-conform " + r.Target, Tests: r.Counts.Total, Failures: r.Counts.Failed + r.Counts.XPassed,
		Errors: r.Counts.Errors, Skipped: r.Counts.Skipped + r.Counts.XFailed, Time: seconds(r.DurationMS)}
	var names []string
	for n := range byArea {
		names = append(names, n)
	}
	sort.Strings(names)
	for _, n := range names {
		s := byArea[n]
		s.Time = seconds(times[n])
		out.Suites = append(out.Suites, *s)
	}
	if _, err := io.WriteString(w, xml.Header); err != nil {
		return err
	}
	enc := xml.NewEncoder(w)
	enc.Indent("", "  ")
	if err := enc.Encode(out); err != nil {
		return err
	}
	_, err := io.WriteString(w, "\n")
	return err
}

// details lists a case's failed checks, for JUnit failure bodies.
func details(c *CaseResult) string {
	var b strings.Builder
	for _, s := range c.Steps {
		if s.Status == Pass || s.Ignored {
			continue
		}
		fmt.Fprintf(&b, "step %d (line %d): %s\n", s.Index+1, s.Line, s.Message)
		if s.Request != nil {
			fmt.Fprintf(&b, "  %s %s\n", s.Request.Method, s.Request.URL)
		}
		for _, a := range s.Assertions {
			if !a.OK {
				fmt.Fprintf(&b, "  %s: expected %s, got %s\n", a.What, a.Expected, a.Actual)
			}
		}
	}
	return b.String()
}
