// Command bbb-conform runs the BigBlueButton API conformance cases.
//
//	bbb-conform run --target FILE [--cases DIR] [--fixtures DIR] [--tags T,..]
//	                [--exclude-tags T,..] [--id GLOB,..] [--parallel N]
//	                [--expect FILE] [--golden DIR] [--masks FILE] [--junit FILE]
//	                [--json FILE] [-v]
//	bbb-conform diff --a TARGET --b TARGET [--cases DIR] [--fixtures DIR] [--tags T,..]
//	                 [--exclude-tags T,..] [--id GLOB,..] [--parallel N] [--masks FILE]
//	                 [--md FILE] [--json FILE] [--fail-on-diff]
//	bbb-conform record --target FILE [--cases DIR] [--fixtures DIR] [--tags T,..]
//	                   [--exclude-tags T,..] [--id GLOB,..] [--parallel N] [--masks FILE]
//	                   [--out DIR] [--passes N]
//	bbb-conform review --golden DIR [--cases DIR] [--id GLOB,..] [--since REV] [--html FILE]
//	bbb-conform gap --results FILE [--results FILE ...] [--md FILE] [--html FILE]
//	bbb-conform validate [--cases DIR] [--fixtures DIR] [--golden DIR]
//	bbb-conform tap [--listen ADDR] [--redis URL] [--data-dir DIR] [--watch DIR,..]
//	                [--channels CH,..] [--redis-keys GLOB,..] [--max-mb N] [--max-age D]
//	bbb-conform version
package main

import (
	"context"
	"errors"
	"flag"
	"fmt"
	"io"
	"io/fs"
	"os"
	"os/signal"
	"path"
	"path/filepath"
	"strings"

	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/diff"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/expectations"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/gap"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/golden"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/normalize"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/report"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/spec"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/steps"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/target"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/tmpl"
)

// version is set at build time with -ldflags "-X main.version=...".
var version = "dev"

const (
	exitOK      = 0
	exitFailed  = 1 // problems found, or cases failed
	exitUsage   = 2 // bad command line or configuration
	usageString = `usage:
  bbb-conform run --target FILE [options]               run cases against a target
  bbb-conform diff --a FILE --b FILE [options]          compare how two targets answer
  bbb-conform record --target FILE [options]            record how a target answers
  bbb-conform review --golden DIR [options]             show recordings beside their cases
  bbb-conform gap --results FILE... [--md F] [--html F] the gap matrix of several runs
  bbb-conform validate [--cases DIR] [--fixtures DIR] [--golden DIR]
                                                        check case files, and their recordings in DIR
  bbb-conform tap [options]                             serve a server's bus, redis and files to the runner
  bbb-conform version                                   print the version

Run "bbb-conform <command> -h" for a command's options.
`
)

func main() {
	os.Exit(run(os.Args[1:], os.Stdout, os.Stderr))
}

func run(args []string, stdout, stderr io.Writer) int {
	if len(args) == 0 {
		fmt.Fprint(stderr, usageString)
		return exitUsage
	}
	switch args[0] {
	case "run":
		return cmdRun(args[1:], stdout, stderr)
	case "diff":
		return cmdDiff(args[1:], stdout, stderr)
	case "record":
		return cmdRecord(args[1:], stdout, stderr)
	case "review":
		return cmdReview(args[1:], stdout, stderr)
	case "gap":
		return cmdGap(args[1:], stdout, stderr)
	case "validate":
		return cmdValidate(args[1:], stdout, stderr)
	case "tap":
		return cmdTap(args[1:], stdout, stderr)
	case "version":
		fmt.Fprintf(stdout, "bbb-conform %s\n", version)
		return exitOK
	case "help", "-h", "-help", "--help":
		fmt.Fprint(stdout, usageString)
		return exitOK
	}
	fmt.Fprintf(stderr, "bbb-conform: unknown command %q\n%s", args[0], usageString)
	return exitUsage
}

func cmdValidate(args []string, stdout, stderr io.Writer) int {
	fl := flag.NewFlagSet("validate", flag.ContinueOnError)
	fl.SetOutput(stderr)
	cases := fl.String("cases", "cases", "directory of case files")
	fixtures := fl.String("fixtures", "", "fixtures directory (default: fixtures next to the cases directory)")
	goldenDir := fl.String("golden", "", "also check the recordings in this directory, e.g. golden/bbb-web")
	if err := fl.Parse(args); err != nil {
		if errors.Is(err, flag.ErrHelp) {
			return exitOK
		}
		return exitUsage
	}
	if fl.NArg() > 0 {
		fmt.Fprintf(stderr, "bbb-conform validate: unexpected argument %q\n", fl.Arg(0))
		return exitUsage
	}
	res, _, code := load(*cases, *fixtures, stderr)
	if res == nil {
		return code
	}
	for _, p := range res.Problems {
		fmt.Fprintln(stdout, p)
	}
	if len(res.Problems) > 0 {
		fmt.Fprintf(stdout, "%d problem(s) in %d file(s)\n", len(res.Problems), res.Files)
		return exitFailed
	}
	fmt.Fprintf(stdout, "ok: %d case(s) in %d file(s)\n", len(res.Cases), res.Files)
	if *goldenDir == "" {
		return exitOK
	}
	probs := checkRecordings(*goldenDir, res.Cases)
	for _, p := range probs {
		fmt.Fprintln(stdout, p)
	}
	if len(probs) > 0 {
		fmt.Fprintf(stdout, "%d problem(s) with the recordings in %s\n", len(probs), *goldenDir)
		return exitFailed
	}
	fmt.Fprintf(stdout, "ok: every case's recording in %s is current\n", *goldenDir)
	return exitOK
}

// checkRecordings checks that every case with something to record has a
// current recording in dir holding no secret, that all of them were made
// from one target, and that dir records nothing else.
func checkRecordings(dir string, cases []*spec.Case) []string {
	var out []string
	targetName := ""
	for _, c := range cases {
		if len(golden.Sections(c)) == 0 {
			continue
		}
		name := golden.Path(dir, c)
		f, err := golden.Read(name)
		switch {
		case errors.Is(err, fs.ErrNotExist):
			out = append(out, fmt.Sprintf("%s: no recording at %s: run bbb-conform record", c.ID, name))
			continue
		case err != nil:
			out = append(out, err.Error())
			continue
		}
		if targetName == "" {
			targetName = f.Target
		} else if f.Target != targetName {
			out = append(out, fmt.Sprintf("%s: recorded from target %q, where the others are from %q", name, f.Target, targetName))
		}
		if why := golden.Stale(f, c); why != "" {
			out = append(out, fmt.Sprintf("%s: stale: %s", name, why))
		}
		for _, s := range f.Sections {
			if golden.Leaks(s.Lines) {
				out = append(out, fmt.Sprintf("%s: %s holds a secret", name, s.Label))
			}
		}
	}
	return append(out, orphans(dir, cases)...)
}

// load loads the cases, defaulting the fixtures directory to a sibling of
// the cases directory. That one needn't exist until a case refers to a
// fixture, which is then reported as not found. It returns the fixtures
// directory it used.
func load(cases, fixtures string, stderr io.Writer) (*spec.Result, string, int) {
	if st, err := os.Stat(cases); err != nil || !st.IsDir() {
		fmt.Fprintf(stderr, "bbb-conform: cases directory %q not found\n", cases)
		return nil, "", exitUsage
	}
	if fixtures == "" {
		fixtures = filepath.Join(filepath.Dir(filepath.Clean(cases)), "fixtures")
	} else if st, err := os.Stat(fixtures); err != nil || !st.IsDir() {
		fmt.Fprintf(stderr, "bbb-conform: fixtures directory %q not found\n", fixtures)
		return nil, "", exitUsage
	}
	res, err := spec.LoadDir(cases, spec.Options{FixturesDir: fixtures})
	if err != nil {
		fmt.Fprintf(stderr, "bbb-conform: %v\n", err)
		return nil, "", exitUsage
	}
	return res, fixtures, exitOK
}

// newUID lets tests make ${uid} predictable.
var newUID func(i int) string

func cmdRun(args []string, stdout, stderr io.Writer) int {
	fl := flag.NewFlagSet("run", flag.ContinueOnError)
	fl.SetOutput(stderr)
	targetFile := fl.String("target", "", "target profile (required)")
	cases := fl.String("cases", "cases", "directory of case files")
	fixtures := fl.String("fixtures", "", "fixtures directory (default: fixtures next to the cases directory)")
	tags := fl.String("tags", "", "run only cases with one of these comma-separated tags")
	exclude := fl.String("exclude-tags", "", "skip cases with any of these comma-separated tags")
	ids := fl.String("id", "", "run only cases whose ID matches one of these comma-separated globs")
	parallel := fl.Int("parallel", 4, "cases to run at once (cases tagged serial always run alone)")
	junitFile := fl.String("junit", "", "write a JUnit XML report here")
	jsonFile := fl.String("json", "", "write a JSON report here")
	expectFile := fl.String("expect", "", "the target's expected-failure list")
	goldenDir := fl.String("golden", "", "compare each step with the recordings in this directory, e.g. golden/bbb-web")
	masksFile := fl.String("masks", "", "with --golden: extra normalization rules (default: masks.yaml next to the cases directory)")
	verbose := fl.Bool("v", false, "list every failed check and warning")
	if err := fl.Parse(args); err != nil {
		if errors.Is(err, flag.ErrHelp) {
			return exitOK
		}
		return exitUsage
	}
	if fl.NArg() > 0 {
		fmt.Fprintf(stderr, "bbb-conform run: unexpected argument %q\n", fl.Arg(0))
		return exitUsage
	}
	if *targetFile == "" {
		fmt.Fprintln(stderr, "bbb-conform run: --target is required")
		return exitUsage
	}
	if *masksFile != "" && *goldenDir == "" {
		fmt.Fprintln(stderr, "bbb-conform run: --masks needs --golden")
		return exitUsage
	}
	for _, g := range splitList(*ids) {
		if _, err := path.Match(g, ""); err != nil {
			fmt.Fprintf(stderr, "bbb-conform run: bad --id pattern %q\n", g)
			return exitUsage
		}
	}
	tg, err := target.Load(*targetFile)
	if err != nil {
		fmt.Fprintf(stderr, "bbb-conform: target: %v\n", err)
		return exitUsage
	}
	var expected *expectations.File
	if *expectFile != "" {
		if expected, err = expectations.Load(*expectFile); err != nil {
			fmt.Fprintf(stderr, "bbb-conform: expect: %v\n", err)
			return exitUsage
		}
		if expected.Target != tg.Name {
			fmt.Fprintf(stderr, "bbb-conform: %s is for target %q, not %q\n", *expectFile, expected.Target, tg.Name)
			return exitUsage
		}
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
	selected := filterCases(res.Cases, splitList(*tags), splitList(*exclude), splitList(*ids))

	r, err := steps.NewRunner(tg, fixturesDir, version)
	if err != nil {
		fmt.Fprintf(stderr, "bbb-conform: target: %v\n", err)
		return exitUsage
	}
	if newUID != nil {
		r.NewUID = newUID
	}
	casesRoot := filepath.Clean(*cases)
	r.Area = func(c *spec.Case) string { return area(casesRoot, c.File) }
	var orphaned []string
	if *goldenDir != "" {
		if st, err := os.Stat(*goldenDir); err != nil || !st.IsDir() {
			fmt.Fprintf(stderr, "bbb-conform: recordings directory %q not found\n", *goldenDir)
			return exitUsage
		}
		rules, err := loadRules(*masksFile, *cases)
		if err != nil {
			fmt.Fprintf(stderr, "bbb-conform: masks: %v\n", err)
			return exitUsage
		}
		k := golden.NewChecker(*goldenDir, tg, rules, r.Redactor)
		r.Before, r.Observe = k.Before, k.Observe
		orphaned = orphans(*goldenDir, res.Cases)
	}

	ctx, stop := interruptible(stderr)
	defer stop()
	run := r.RunAll(ctx, selected, *parallel)
	run.Warnings = append(run.Warnings, orphaned...)
	if expected != nil {
		var loaded []expectations.Case
		for _, c := range res.Cases {
			loaded = append(loaded, expectations.CaseFor(c.ID, c.Variant))
		}
		expected.Apply(run, loaded)
	}

	report.WriteConsole(stdout, run, *verbose)
	if err := writeReport(*junitFile, r.Redactor, func(w io.Writer) error { return report.WriteJUnit(w, run) }); err != nil {
		fmt.Fprintf(stderr, "bbb-conform: junit: %v\n", err)
		return exitUsage
	}
	if err := writeReport(*jsonFile, r.Redactor, func(w io.Writer) error { return report.WriteJSON(w, run) }); err != nil {
		fmt.Fprintf(stderr, "bbb-conform: json: %v\n", err)
		return exitUsage
	}
	if !run.OK() || ctx.Err() != nil {
		return exitFailed
	}
	return exitOK
}

// interruptible returns a context the first Ctrl-C cancels: cases that
// haven't started are skipped, and those running stop and clean up after
// themselves. A second Ctrl-C ends the process at once.
func interruptible(stderr io.Writer) (context.Context, func()) {
	ctx, cancel := context.WithCancel(context.Background())
	sig := make(chan os.Signal, 1)
	signal.Notify(sig, os.Interrupt)
	go func() {
		select {
		case <-sig:
			signal.Stop(sig) // the next one isn't caught
			fmt.Fprintln(stderr, "bbb-conform: interrupted; running cases are cleaning up (Ctrl-C again to quit now)")
			cancel()
		case <-ctx.Done():
		}
	}()
	return ctx, func() { signal.Stop(sig); cancel() }
}

func splitList(s string) []string {
	var out []string
	for _, p := range strings.Split(s, ",") {
		if p = strings.TrimSpace(p); p != "" {
			out = append(out, p)
		}
	}
	return out
}

// filterCases keeps cases with any of tags (all cases when tags is empty),
// none of exclude, and an ID matching one of ids (any when empty).
func filterCases(cases []*spec.Case, tags, exclude, ids []string) []*spec.Case {
	has := func(c *spec.Case, want []string) bool {
		for _, t := range c.Tags {
			for _, w := range want {
				if t == w {
					return true
				}
			}
		}
		return false
	}
	var out []*spec.Case
	for _, c := range cases {
		if len(tags) > 0 && !has(c, tags) {
			continue
		}
		if has(c, exclude) {
			continue
		}
		if len(ids) > 0 {
			matched := false
			for _, g := range ids {
				if ok, _ := path.Match(g, c.ID); ok {
					matched = true
				}
			}
			if !matched {
				continue
			}
		}
		out = append(out, c)
	}
	return out
}

// area is the first directory of file under root: cases/create/x.yaml is
// in area create.
func area(root, file string) string {
	rel, err := filepath.Rel(root, file)
	if err != nil {
		return "cases"
	}
	if dir, _, ok := strings.Cut(filepath.ToSlash(rel), "/"); ok {
		return dir
	}
	return "cases"
}

// writeReport writes a report file, redacting secrets once more as a last
// line of defence. An empty name writes nothing.
func writeReport(name string, red *tmpl.Redactor, write func(io.Writer) error) error {
	if name == "" {
		return nil
	}
	var buf strings.Builder
	if err := write(&buf); err != nil {
		return err
	}
	if dir := filepath.Dir(name); dir != "" {
		if err := os.MkdirAll(dir, 0o755); err != nil {
			return err
		}
	}
	return os.WriteFile(name, []byte(red.Redact(buf.String())), 0o644)
}

func cmdDiff(args []string, stdout, stderr io.Writer) int {
	fl := flag.NewFlagSet("diff", flag.ContinueOnError)
	fl.SetOutput(stderr)
	aFile := fl.String("a", "", "first target (required)")
	bFile := fl.String("b", "", "second target (required)")
	cases := fl.String("cases", "cases", "directory of case files")
	fixtures := fl.String("fixtures", "", "fixtures directory (default: fixtures next to the cases directory)")
	tags := fl.String("tags", "", "only cases with one of these comma-separated tags")
	exclude := fl.String("exclude-tags", "", "skip cases with any of these comma-separated tags")
	ids := fl.String("id", "", "only cases whose ID matches one of these comma-separated globs")
	parallel := fl.Int("parallel", 4, "cases to run at once on each target")
	masksFile := fl.String("masks", "", "extra normalization rules (default: masks.yaml next to the cases directory)")
	mdFile := fl.String("md", "", "write a Markdown report here")
	jsonFile := fl.String("json", "", "write a JSON report here")
	failOnDiff := fl.Bool("fail-on-diff", false, "exit 1 when any case differs, or couldn't be compared because a side ERRORed")
	if err := fl.Parse(args); err != nil {
		if errors.Is(err, flag.ErrHelp) {
			return exitOK
		}
		return exitUsage
	}
	if fl.NArg() > 0 || *aFile == "" || *bFile == "" {
		fmt.Fprintln(stderr, "bbb-conform diff: --a and --b are required")
		return exitUsage
	}
	var tgs [2]*target.Target
	for i, f := range []string{*aFile, *bFile} {
		t, err := target.Load(f)
		if err != nil {
			fmt.Fprintf(stderr, "bbb-conform: target: %v\n", err)
			return exitUsage
		}
		tgs[i] = t
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
	selected := filterCases(res.Cases, splitList(*tags), splitList(*exclude), splitList(*ids))
	ctx, stop := interruptible(stderr)
	defer stop()
	red := &tmpl.Redactor{}
	casesRoot := filepath.Clean(*cases)
	var runs [2]*report.Run
	var cols [2]*golden.Collector
	bothTaps := tgs[0].TapURL != "" && tgs[1].TapURL != ""
	for i, tg := range tgs {
		r, err := steps.NewRunner(tg, fixturesDir, version)
		if err != nil {
			fmt.Fprintf(stderr, "bbb-conform: target: %v\n", err)
			return exitUsage
		}
		red.Add("[salt]", tg.Salt)
		for name, v := range tg.Vars {
			if v.Secret {
				red.Add("[secret:"+name+"]", v.Value)
			}
		}
		if newUID != nil {
			side := string(rune('a' + i))
			r.NewUID = func(n int) string { return side + "-" + newUID(n) }
		}
		r.Area = func(c *spec.Case) string { return area(casesRoot, c.File) }
		r.ContinueOnFail = true
		cols[i] = golden.NewCollector(tg, rules, red)
		r.Observe = cols[i].Observe
		var props *diff.Props
		if bothTaps {
			props = diff.NewProps(ctx, cols[i], r.Tap)
			r.Observe = props.Observe
		}
		runs[i] = r.RunAll(ctx, selected, *parallel)
		if props != nil {
			props.Wait()
		}
	}
	rep := diff.Compare(runs[0], runs[1], cols[0], cols[1])
	if (tgs[0].TapURL == "") != (tgs[1].TapURL == "") {
		rep.Warnings = append(rep.Warnings, "the meeting props are compared only when both targets have a tap")
	}
	var console strings.Builder
	rep.WriteConsole(&console)
	fmt.Fprint(stdout, red.Redact(console.String()))
	if err := writeReport(*mdFile, red, rep.WriteMarkdown); err != nil {
		fmt.Fprintf(stderr, "bbb-conform: md: %v\n", err)
		return exitUsage
	}
	if err := writeReport(*jsonFile, red, rep.WriteJSON); err != nil {
		fmt.Fprintf(stderr, "bbb-conform: json: %v\n", err)
		return exitUsage
	}
	if *failOnDiff && rep.Differs() || ctx.Err() != nil {
		return exitFailed
	}
	return exitOK
}

// loadRules returns the normalization rules: the built-in ones plus those
// of masksFile, or of masks.yaml next to the cases directory if it exists.
func loadRules(masksFile, cases string) (*normalize.Rules, error) {
	if masksFile == "" {
		def := filepath.Join(filepath.Dir(filepath.Clean(cases)), "masks.yaml")
		if _, err := os.Stat(def); err != nil {
			return normalize.Default(), nil
		}
		masksFile = def
	}
	return normalize.Load(masksFile)
}

type listFlag []string

func (l *listFlag) String() string     { return strings.Join(*l, ",") }
func (l *listFlag) Set(v string) error { *l = append(*l, v); return nil }

func cmdGap(args []string, stdout, stderr io.Writer) int {
	fl := flag.NewFlagSet("gap", flag.ContinueOnError)
	fl.SetOutput(stderr)
	var results listFlag
	fl.Var(&results, "results", "a JSON report from run --json; give one per target")
	mdFile := fl.String("md", "", "write the matrix as Markdown here")
	htmlFile := fl.String("html", "", "write the matrix as one HTML page here")
	if err := fl.Parse(args); err != nil {
		if errors.Is(err, flag.ErrHelp) {
			return exitOK
		}
		return exitUsage
	}
	if fl.NArg() > 0 || len(results) == 0 {
		fmt.Fprintln(stderr, "bbb-conform gap: give at least one --results file")
		return exitUsage
	}
	runs, err := gap.Load(results)
	if err != nil {
		fmt.Fprintf(stderr, "bbb-conform: %v\n", err)
		return exitUsage
	}
	m := gap.Build(runs)
	for _, out := range []struct {
		name  string
		write func(io.Writer) error
	}{{*mdFile, m.WriteMarkdown}, {*htmlFile, m.WriteHTML}} {
		if err := writeReport(out.name, nil, out.write); err != nil {
			fmt.Fprintf(stderr, "bbb-conform: %v\n", err)
			return exitUsage
		}
	}
	fmt.Fprintf(stdout, "gap matrix: %d endpoint(s), %d target(s)\n", len(m.Endpoints), len(m.Targets))
	return exitOK
}
