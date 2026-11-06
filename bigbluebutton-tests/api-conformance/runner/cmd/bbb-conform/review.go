package main

import (
	"errors"
	"flag"
	"fmt"
	"io"
	"os"
	"path"

	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/review"
)

func cmdReview(args []string, stdout, stderr io.Writer) int {
	fl := flag.NewFlagSet("review", flag.ContinueOnError)
	fl.SetOutput(stderr)
	goldenDir := fl.String("golden", "", "the recordings directory, e.g. golden/bbb-web (required)")
	cases := fl.String("cases", "cases", "directory of case files")
	fixtures := fl.String("fixtures", "", "fixtures directory (default: fixtures next to the cases directory)")
	ids := fl.String("id", "", "only cases whose ID matches one of these comma-separated globs")
	since := fl.String("since", "", "only recordings added, changed or removed since this git revision, as diffs")
	htmlFile := fl.String("html", "", "also write the review as one HTML page here")
	if err := fl.Parse(args); err != nil {
		if errors.Is(err, flag.ErrHelp) {
			return exitOK
		}
		return exitUsage
	}
	if fl.NArg() > 0 {
		fmt.Fprintf(stderr, "bbb-conform review: unexpected argument %q\n", fl.Arg(0))
		return exitUsage
	}
	if *goldenDir == "" {
		fmt.Fprintln(stderr, "bbb-conform review: --golden is required")
		return exitUsage
	}
	if st, err := os.Stat(*goldenDir); err != nil || !st.IsDir() {
		fmt.Fprintf(stderr, "bbb-conform: recordings directory %q not found\n", *goldenDir)
		return exitUsage
	}
	globs := splitList(*ids)
	for _, g := range globs {
		if _, err := path.Match(g, ""); err != nil {
			fmt.Fprintf(stderr, "bbb-conform review: bad --id pattern %q\n", g)
			return exitUsage
		}
	}
	res, _, code := load(*cases, *fixtures, stderr)
	if res == nil {
		return code
	}
	var match func(string) bool
	if len(globs) > 0 {
		match = func(id string) bool {
			for _, g := range globs {
				if ok, _ := path.Match(g, id); ok {
					return true
				}
			}
			return false
		}
	}
	rv, err := review.Build(*goldenDir, res.Cases, match, *since)
	if err != nil {
		fmt.Fprintf(stderr, "bbb-conform review: %v\n", err)
		return exitUsage
	}
	rv.WriteConsole(stdout)
	if err := writeReport(*htmlFile, nil, rv.WriteHTML); err != nil {
		fmt.Fprintf(stderr, "bbb-conform: html: %v\n", err)
		return exitUsage
	}
	return exitOK
}
