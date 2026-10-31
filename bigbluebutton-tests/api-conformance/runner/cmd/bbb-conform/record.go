package main

import (
	"errors"
	"flag"
	"fmt"
	"io"
	"io/fs"
	"net/url"
	"os"
	"path"
	"path/filepath"
	"sort"
	"strings"

	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/assert"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/golden"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/report"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/spec"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/steps"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/target"
)

// What record did with a case.
const (
	recNew        = "NEW"
	recChanged    = "CHANGED"
	recUnchanged  = "UNCHANGED"
	recUnstable   = "UNSTABLE"
	recIncomplete = "INCOMPLETE"
	recSecret     = "SECRET"
	recError      = "ERROR"
	recSkip       = "SKIP"
)

// recorded is record's outcome for one case.
type recorded struct {
	id      string
	outcome string
	reason  string
	detail  []string // the lines that differ between passes
	expect  string   // why a hand-written expect failed, if it did
	host    string   // where the recording names the server's host, if it does
	defect  bool
}

func cmdRecord(args []string, stdout, stderr io.Writer) int {
	fl := flag.NewFlagSet("record", flag.ContinueOnError)
	fl.SetOutput(stderr)
	targetFile := fl.String("target", "", "target profile to record from (required)")
	cases := fl.String("cases", "cases", "directory of case files")
	fixtures := fl.String("fixtures", "", "fixtures directory (default: fixtures next to the cases directory)")
	tags := fl.String("tags", "", "only cases with one of these comma-separated tags")
	exclude := fl.String("exclude-tags", "", "skip cases with any of these comma-separated tags")
	ids := fl.String("id", "", "only cases whose ID matches one of these comma-separated globs")
	parallel := fl.Int("parallel", 4, "cases to run at once (cases tagged serial always run alone)")
	masksFile := fl.String("masks", "", "extra normalization rules (default: masks.yaml next to the cases directory)")
	outDir := fl.String("out", "", "where recordings go (default: golden/<target name> next to the cases directory)")
	passes := fl.Int("passes", 2, "how many times each case runs; any difference between runs is reported")
	if err := fl.Parse(args); err != nil {
		if errors.Is(err, flag.ErrHelp) {
			return exitOK
		}
		return exitUsage
	}
	if fl.NArg() > 0 {
		fmt.Fprintf(stderr, "bbb-conform record: unexpected argument %q\n", fl.Arg(0))
		return exitUsage
	}
	if *targetFile == "" {
		fmt.Fprintln(stderr, "bbb-conform record: --target is required")
		return exitUsage
	}
	if *passes < 2 {
		fmt.Fprintln(stderr, "bbb-conform record: --passes must be at least 2")
		return exitUsage
	}
	for _, g := range splitList(*ids) {
		if _, err := path.Match(g, ""); err != nil {
			fmt.Fprintf(stderr, "bbb-conform record: bad --id pattern %q\n", g)
			return exitUsage
		}
	}
	tg, err := target.Load(*targetFile)
	if err != nil {
		fmt.Fprintf(stderr, "bbb-conform: target: %v\n", err)
		return exitUsage
	}
	res, fixturesDir, code := load(*cases, *fixtures, stderr)
	if res == nil {
		return code
	}
	if len(res.Problems) > 0 {
		for _, p := range res.Problems {
			fmt.Fprintln(stderr, p)
		}
		fmt.Fprintf(stderr, "bbb-conform: %d problem(s) in the cases; run validate for details\n", len(res.Problems))
		return exitUsage
	}
	rules, err := loadRules(*masksFile, *cases)
	if err != nil {
		fmt.Fprintf(stderr, "bbb-conform: masks: %v\n", err)
		return exitUsage
	}
	out := *outDir
	if out == "" {
		out = filepath.Join(filepath.Dir(filepath.Clean(*cases)), "golden", tg.Name)
	}
	for _, part := range strings.Split(filepath.ToSlash(filepath.Clean(out)), "/") {
		if part == "target" {
			fmt.Fprintf(stderr, "bbb-conform record: warning: git ignores directories named target (the repository's **/target/* rule), so %s won't be committed\n", out)
			break
		}
	}
	selected := filterCases(res.Cases, splitList(*tags), splitList(*exclude), splitList(*ids))

	r, err := steps.NewRunner(tg, fixturesDir, version)
	if err != nil {
		fmt.Fprintf(stderr, "bbb-conform: target: %v\n", err)
		return exitUsage
	}
	casesRoot := filepath.Clean(*cases)
	r.Area = func(c *spec.Case) string { return area(casesRoot, c.File) }
	r.ContinueOnFail = true

	// Every pass runs in one go, each copy of a case with its own ${uid},
	// so config profiles are switched only once. Copies of a case may run
	// at the same time, which shows up a case that isn't isolated.
	n := len(selected)
	all := make([]*spec.Case, 0, n**passes)
	for p := 0; p < *passes; p++ {
		all = append(all, selected...)
	}
	base := r.NewUID
	if newUID != nil {
		base = newUID
	}
	uids := make([]string, len(all))
	passOf := map[string]int{}
	for i := range all {
		uids[i] = base(i)
		passOf[uids[i]] = i / max(n, 1)
	}
	r.NewUID = func(i int) string { return uids[i] }
	cols := make([]*golden.Collector, *passes)
	for p := range cols {
		cols[p] = golden.NewCollector(tg, rules, r.Redactor)
	}
	r.Observe = func(ev steps.Observed) ([]assert.Result, error) { return cols[passOf[ev.UID]].Observe(ev) }

	ctx, abort, stop := interruptible(stderr)
	defer stop()
	r.Abort = abort
	run := r.RunAll(ctx, all, *parallel)
	if ctx.Err() != nil {
		fmt.Fprintln(stderr, "bbb-conform record: interrupted; nothing written")
		return exitFailed
	}

	var outcomes []recorded
	for k, c := range selected {
		results := make([]*report.CaseResult, *passes)
		for p := range results {
			results[p] = run.Cases[p*n+k]
		}
		rec := recordCase(c, tg.Name, out, hostNames(tg.Bases()), results, cols)
		outcomes = append(outcomes, rec)
	}

	var buf strings.Builder
	writeRecordConsole(&buf, outcomes, run.Warnings, orphans(out, res.Cases), out)
	fmt.Fprint(stdout, r.Redactor.Redact(buf.String()))
	for _, o := range outcomes {
		switch {
		case o.outcome == recUnstable, o.outcome == recIncomplete, o.outcome == recSecret, o.outcome == recError:
			return exitFailed
		case o.expect != "" && !o.defect:
			return exitFailed
		}
	}
	return exitOK
}

// recordCase decides what to do with one case from its runs, and writes
// its recording when every pass agrees.
func recordCase(c *spec.Case, targetName, out string, hosts []string, results []*report.CaseResult, cols []*golden.Collector) recorded {
	rec := recorded{id: c.ID, defect: c.Class == "defect"}
	first := results[0]
	for _, r := range results {
		switch r.Status {
		case report.Skip:
			rec.outcome, rec.reason = recSkip, r.Reason
			return rec
		case report.Error:
			rec.outcome, rec.reason = recError, r.Reason
			return rec
		}
	}
	for p, r := range results[1:] {
		if r.Status != first.Status {
			rec.outcome = recUnstable
			rec.reason = fmt.Sprintf("%s in pass 1, %s in pass %d", first.Status, r.Status, p+2)
			return rec
		}
		if d := passDiff(cols[0].Steps(c.ID), cols[p+1].Steps(c.ID)); len(d) > 0 {
			rec.outcome = recUnstable
			rec.reason = fmt.Sprintf("passes 1 and %d answered differently: mask what changes from run to run, or tag the case serial if it isn't isolated from other cases", p+2)
			rec.detail = d
			return rec
		}
	}
	f, err := golden.Build(c, targetName, cols[0].Steps(c.ID))
	if err != nil {
		rec.outcome, rec.reason = recIncomplete, err.Error()
		if first.Status == report.Fail {
			rec.reason += ", after " + first.Reason
		}
		return rec
	}
	if first.Status == report.Fail {
		rec.expect = first.Reason
	}
	for _, s := range f.Sections {
		if golden.Leaks(s.Lines) {
			rec.outcome = recSecret
			rec.reason = "the answer holds a secret; nothing written. Report it privately (see CLAUDE.md), not in a public file"
			return rec
		}
	}
	rec.host = namesHost(f, hosts)
	data, err := f.Format()
	if err != nil {
		rec.outcome, rec.reason = recError, err.Error()
		return rec
	}
	name := golden.Path(out, c)
	_, statErr := os.Stat(name)
	wrote, err := golden.Write(name, data)
	switch {
	case err != nil:
		rec.outcome, rec.reason = recError, err.Error()
	case !wrote:
		rec.outcome = recUnchanged
	case errors.Is(statErr, fs.ErrNotExist):
		rec.outcome = recNew
	default:
		rec.outcome = recChanged
	}
	return rec
}

// passDiff lists how two passes' steps differ, with a heading per step.
func passDiff(a, b []golden.Step) []string {
	var out []string
	for _, p := range golden.Pairs(a, b) {
		name := fmt.Sprintf("step %d", p.Key.Index+1)
		if p.Key.Phase == "teardown" {
			name = "teardown " + name
		}
		switch {
		case p.A == nil || p.B == nil:
			out = append(out, name+": reached in one pass only")
		default:
			if h := golden.Lines(p.A.Lines, p.B.Lines); len(h) > 0 {
				out = append(out, name+":")
				out = append(out, h...)
			}
		}
	}
	return out
}

// orphans lists recordings under dir whose case no longer exists.
func orphans(dir string, cases []*spec.Case) []string {
	files, err := golden.List(dir)
	if err != nil {
		return []string{fmt.Sprintf("can't list %s: %v", dir, err)}
	}
	known := map[string]bool{}
	for _, c := range cases {
		known[c.ID] = true
	}
	var out []string
	for id, name := range files {
		if !known[id] {
			out = append(out, fmt.Sprintf("%s records %s, which is no longer a case", name, id))
		}
	}
	sort.Strings(out)
	return out
}

func writeRecordConsole(w io.Writer, outcomes []recorded, runWarnings, orphanWarnings []string, out string) {
	counts := map[string]int{}
	for _, o := range outcomes {
		counts[o.outcome]++
		if o.outcome == recUnchanged && o.expect == "" && !o.defect {
			continue
		}
		fmt.Fprintf(w, "%-10s %s", o.outcome, o.id)
		if o.reason != "" {
			fmt.Fprintf(w, ": %s", o.reason)
		}
		fmt.Fprintln(w)
		for _, l := range o.detail {
			fmt.Fprintf(w, "    %s\n", l)
		}
		if o.host != "" {
			fmt.Fprintf(w, "    names the server's host, %s: mask it, or the recording only holds on this server\n", o.host)
		}
		if o.expect != "" {
			if o.defect {
				fmt.Fprintf(w, "    expect failed, as a defect case's may: %s\n", o.expect)
			} else {
				fmt.Fprintf(w, "    expect failed: %s. Recorded anyway; decide whether the case or the server is wrong\n", o.expect)
			}
		} else if o.defect && (o.outcome == recNew || o.outcome == recChanged || o.outcome == recUnchanged) {
			fmt.Fprintf(w, "    a defect case passed: is it fixed? Then reclassify it\n")
		}
	}
	for _, warn := range append(append([]string{}, runWarnings...), orphanWarnings...) {
		fmt.Fprintf(w, "warning: %s\n", warn)
	}
	fmt.Fprintf(w, "\n%s: %d new, %d changed, %d unchanged, %d unstable, %d incomplete, %d secret, %d errors, %d skipped\n",
		out, counts[recNew], counts[recChanged], counts[recUnchanged], counts[recUnstable], counts[recIncomplete],
		counts[recSecret], counts[recError], counts[recSkip])
}

// hostNames returns the host names in a target's base URLs.
func hostNames(bases []string) []string {
	var out []string
	for _, b := range bases {
		if u, err := url.Parse(b); err == nil && u.Hostname() != "" {
			out = append(out, u.Hostname())
		}
	}
	return out
}

// namesHost says where f mentions one of hosts, which normalization leaves
// only where a value holds the host without a scheme the base URLs match.
func namesHost(f *golden.File, hosts []string) string {
	for _, s := range f.Sections {
		for _, l := range s.Lines {
			for _, h := range hosts {
				if mentionsHost(l, h) {
					return h + " in " + s.Label
				}
			}
		}
	}
	return ""
}

// mentionsHost reports whether line contains host as a whole host name, not
// as part of a longer one: 10.0.0.5 doesn't match 10.0.0.50, and bbb.test
// doesn't match bbb.test.other.
func mentionsHost(line, host string) bool {
	for i := 0; i+len(host) <= len(line); {
		j := strings.Index(line[i:], host)
		if j < 0 {
			return false
		}
		start, end := i+j, i+j+len(host)
		beforeOK := start == 0 || !isHostByte(line[start-1])
		afterOK := end == len(line) || !isHostByte(line[end])
		if beforeOK && afterOK {
			return true
		}
		i = start + 1
	}
	return false
}

// isHostByte reports whether b can extend a host name on either side.
func isHostByte(b byte) bool {
	return b >= 'a' && b <= 'z' || b >= 'A' && b <= 'Z' || b >= '0' && b <= '9' || b == '.' || b == '-'
}
