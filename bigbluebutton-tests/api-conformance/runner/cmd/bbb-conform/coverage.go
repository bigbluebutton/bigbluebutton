package main

import (
	"errors"
	"flag"
	"fmt"
	"io"
	"os"

	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/coverage"
)

// cmdCoverage summarises JaCoCo's XML report of bbb-web through a triage
// file, and compares it with a baseline. A drop below the baseline is a
// warning unless --fail-on-drop; a triage file that doesn't fit the report
// fails.
func cmdCoverage(args []string, stdout, stderr io.Writer) int {
	fl := flag.NewFlagSet("coverage", flag.ContinueOnError)
	fl.SetOutput(stderr)
	reportFile := fl.String("report", "", "JaCoCo's XML report (make -C env coverage writes out/coverage/jacoco.xml)")
	triageFile := fl.String("triage", "", "the triage file: scope, ignore rules and unreached methods (coverage/triage.yaml)")
	baselineFile := fl.String("baseline", "", "compare with this baseline (coverage/baseline.json)")
	tolerance := fl.Float64("drop-tolerance", 0.5, "a package's share of reached methods may fall this many percentage points below the baseline")
	failOnDrop := fl.Bool("fail-on-drop", false, "exit 1 when a package is below the baseline")
	mdFile := fl.String("md", "", "write the summary as Markdown here")
	untriagedFile := fl.String("untriaged", "", "list the unreached methods with no triage entry here")
	writeBaseline := fl.String("write-baseline", "", "write this run's numbers as a baseline here")
	var sources listFlag
	fl.Var(&sources, "sources", "a Groovy source root (a package root, e.g. bigbluebutton-web/grails-app/controllers), to name closures after the member they are in; give one per root")
	if err := fl.Parse(args); err != nil {
		if errors.Is(err, flag.ErrHelp) {
			return exitOK
		}
		return exitUsage
	}
	if fl.NArg() > 0 || *reportFile == "" || *triageFile == "" {
		fmt.Fprintln(stderr, "bbb-conform coverage: give --report and --triage")
		return exitUsage
	}
	if *tolerance < 0 {
		fmt.Fprintln(stderr, "bbb-conform coverage: --drop-tolerance can't be negative")
		return exitUsage
	}
	f, err := os.Open(*reportFile)
	if err != nil {
		fmt.Fprintf(stderr, "bbb-conform: %v\n", err)
		return exitUsage
	}
	rep, err := coverage.ParseXML(f)
	f.Close()
	if err != nil {
		fmt.Fprintf(stderr, "bbb-conform: %s: %v\n", *reportFile, err)
		return exitUsage
	}
	unresolved := coverage.ResolveClosures(rep, sources)
	cfg, err := coverage.LoadConfig(*triageFile)
	if err != nil {
		fmt.Fprintf(stderr, "bbb-conform: %v\n", err)
		return exitFailed
	}
	sum, probs := coverage.Summarize(rep, cfg)
	var drops []coverage.Drop
	if *baselineFile != "" {
		b, err := coverage.LoadBaseline(*baselineFile)
		if err != nil {
			fmt.Fprintf(stderr, "bbb-conform: %v\n", err)
			return exitUsage
		}
		if why := b.Mismatch(cfg); why != "" {
			fmt.Fprintf(stdout, "warning: %s: write a new baseline\n", why)
		}
		drops = coverage.Compare(b, sum, cfg, *tolerance)
	}
	type output struct {
		name  string
		write func(io.Writer) error
	}
	outs := []output{
		{*mdFile, func(w io.Writer) error { return coverage.WriteMarkdown(w, sum, drops, *baselineFile != "") }},
		{*untriagedFile, func(w io.Writer) error { return coverage.WriteUntriaged(w, sum) }},
	}
	// A triage file that doesn't fit the report fails the run, so the run
	// leaves the baseline as it was; the summaries still help find why.
	if len(probs) == 0 {
		outs = append(outs, output{*writeBaseline, func(w io.Writer) error { return coverage.WriteBaseline(w, sum.Baseline(cfg.Scope)) }})
	} else if *writeBaseline != "" {
		fmt.Fprintf(stderr, "bbb-conform: %s not written: the triage file doesn't fit the report\n", *writeBaseline)
	}
	for _, out := range outs {
		if err := writeReport(out.name, nil, out.write); err != nil {
			fmt.Fprintf(stderr, "bbb-conform: %v\n", err)
			return exitUsage
		}
	}
	t := sum.Total
	fmt.Fprintf(stdout, "coverage: %d of %d methods reached (%.1f%%) in %d package(s); %d unreached: %d triaged, %d untriaged; %d ignored\n",
		t.Methods.Covered, t.Methods.Total(), t.Methods.Percent(), len(sum.Packages), t.Methods.Missed,
		t.Methods.Missed-t.Untriaged, t.Untriaged, sum.Ignored)
	if unresolved > 0 {
		fmt.Fprintf(stdout, "warning: %d Groovy closure(s) keep their class names: give --sources for their source roots\n", unresolved)
	}
	for _, d := range drops {
		fmt.Fprintf(stdout, "warning: %s is below the baseline: %d/%d methods (%.1f%%), was %d/%d (%.1f%%)\n",
			d.Package, d.Now.Covered, d.Now.Total(), d.Now.Percent(), d.Was.Covered, d.Was.Total(), d.Was.Percent())
	}
	for _, id := range sum.Stale {
		fmt.Fprintf(stdout, "warning: %s is triaged but the suite reaches it now\n", id)
	}
	if len(probs) > 0 {
		for _, p := range probs {
			fmt.Fprintf(stderr, "%s: %s\n", *triageFile, p)
		}
		return exitFailed
	}
	if *failOnDrop && len(drops) > 0 {
		return exitFailed
	}
	return exitOK
}
