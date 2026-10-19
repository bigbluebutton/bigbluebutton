// Command bbb-conform runs the BigBlueButton API conformance cases.
//
//	bbb-conform run --target FILE [--cases DIR] [--fixtures DIR] [--tags T,..]
//	                [--exclude-tags T,..] [--id GLOB,..] [--parallel N]
//	                [--junit FILE] [--json FILE] [-v]
//	bbb-conform validate [--cases DIR] [--fixtures DIR]
//	bbb-conform version
package main

import (
	"context"
	"errors"
	"flag"
	"fmt"
	"io"
	"os"
	"os/signal"
	"path"
	"path/filepath"
	"strings"

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
  bbb-conform validate [--cases DIR] [--fixtures DIR]   check case files
  bbb-conform version                                   print the version

Run "bbb-conform run -h" for the run options.
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
	case "validate":
		return cmdValidate(args[1:], stdout, stderr)
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
	return exitOK
}

// load loads the cases, defaulting the fixtures directory to a sibling of
// the cases directory when it exists. It returns the fixtures directory it
// used, "" for none.
func load(cases, fixtures string, stderr io.Writer) (*spec.Result, string, int) {
	if st, err := os.Stat(cases); err != nil || !st.IsDir() {
		fmt.Fprintf(stderr, "bbb-conform: cases directory %q not found\n", cases)
		return nil, "", exitUsage
	}
	if fixtures == "" {
		def := filepath.Join(filepath.Dir(filepath.Clean(cases)), "fixtures")
		if st, err := os.Stat(def); err == nil && st.IsDir() {
			fixtures = def
		}
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

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt)
	defer stop()
	run := r.RunAll(ctx, selected, *parallel)

	report.WriteConsole(stdout, run, *verbose)
	if err := writeReport(*junitFile, r.Redactor, func(w io.Writer) error { return report.WriteJUnit(w, run) }); err != nil {
		fmt.Fprintf(stderr, "bbb-conform: junit: %v\n", err)
		return exitUsage
	}
	if err := writeReport(*jsonFile, r.Redactor, func(w io.Writer) error { return report.WriteJSON(w, run) }); err != nil {
		fmt.Fprintf(stderr, "bbb-conform: json: %v\n", err)
		return exitUsage
	}
	if !run.OK() {
		return exitFailed
	}
	return exitOK
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
