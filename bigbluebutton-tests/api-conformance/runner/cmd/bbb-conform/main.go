// Command bbb-conform runs the BigBlueButton API conformance cases.
//
//	bbb-conform validate [--cases DIR] [--fixtures DIR]
//	bbb-conform version
package main

import (
	"errors"
	"flag"
	"fmt"
	"io"
	"os"
	"path/filepath"

	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/spec"
)

// version is set at build time with -ldflags "-X main.version=...".
var version = "dev"

const (
	exitOK      = 0
	exitFailed  = 1 // problems found, or cases failed
	exitUsage   = 2 // bad command line or configuration
	usageString = `usage:
  bbb-conform validate [--cases DIR] [--fixtures DIR]   check case files
  bbb-conform version                                   print the version
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
	res, code := load(*cases, *fixtures, stderr)
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
// the cases directory when it exists.
func load(cases, fixtures string, stderr io.Writer) (*spec.Result, int) {
	if st, err := os.Stat(cases); err != nil || !st.IsDir() {
		fmt.Fprintf(stderr, "bbb-conform: cases directory %q not found\n", cases)
		return nil, exitUsage
	}
	if fixtures == "" {
		def := filepath.Join(filepath.Dir(filepath.Clean(cases)), "fixtures")
		if st, err := os.Stat(def); err == nil && st.IsDir() {
			fixtures = def
		}
	} else if st, err := os.Stat(fixtures); err != nil || !st.IsDir() {
		fmt.Fprintf(stderr, "bbb-conform: fixtures directory %q not found\n", fixtures)
		return nil, exitUsage
	}
	res, err := spec.LoadDir(cases, spec.Options{FixturesDir: fixtures})
	if err != nil {
		fmt.Fprintf(stderr, "bbb-conform: %v\n", err)
		return nil, exitUsage
	}
	return res, exitOK
}
