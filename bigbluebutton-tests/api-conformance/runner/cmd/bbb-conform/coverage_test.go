package main

import (
	"bytes"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestCoverage(t *testing.T) {
	report := "../../internal/coverage/testdata/jacoco.xml"
	triage := "../../internal/coverage/testdata/triage.yaml"
	out := t.TempDir()
	// The baseline the "own baseline" case compares with, written first,
	// so each case runs on its own.
	baseline := filepath.Join(out, "own-baseline.json")
	var setupOut, setupErr bytes.Buffer
	md := filepath.Join(out, "setup.md")
	if code := run([]string{"coverage", "--report", report, "--triage", triage, "--write-baseline", baseline, "--md", md}, &setupOut, &setupErr); code != exitOK {
		t.Fatalf("writing the baseline: exit %d, %s", code, setupErr.String())
	}
	if _, err := os.Stat(md); err != nil {
		t.Fatal(err)
	}
	for _, tt := range []struct {
		name   string
		args   []string
		code   int
		stdout string
		stderr string
	}{
		{"summary", []string{"--report", report, "--triage", triage, "--md", filepath.Join(out, "summary.md"),
			"--write-baseline", filepath.Join(out, "baseline.json")}, exitOK, "3 of 7 methods reached", ""},
		{"own baseline", []string{"--report", report, "--triage", triage, "--baseline", baseline, "--fail-on-drop"}, exitOK, "coverage:", ""},
		{"no triage", []string{"--report", report}, exitUsage, "", "give --report and --triage"},
		{"negative tolerance", []string{"--report", report, "--triage", triage, "--drop-tolerance", "-1"}, exitUsage, "", "can't be negative"},
		{"missing report", []string{"--report", filepath.Join(out, "nope.xml"), "--triage", triage}, exitUsage, "", "nope.xml"},
	} {
		t.Run(tt.name, func(t *testing.T) {
			var stdout, stderr bytes.Buffer
			code := run(append([]string{"coverage"}, tt.args...), &stdout, &stderr)
			if code != tt.code || !strings.Contains(stdout.String(), tt.stdout) || !strings.Contains(stderr.String(), tt.stderr) {
				t.Errorf("exit %d, stdout %q, stderr %q", code, stdout.String(), stderr.String())
			}
		})
	}
	// A triage entry the report doesn't have fails the run.
	bad := filepath.Join(out, "bad.yaml")
	if err := os.WriteFile(bad, []byte("scope: [org.bigbluebutton.api]\nmethods:\n  - {class: org.bigbluebutton.api.Nope, method: x, outcome: excluded, reason: r}\n"), 0o644); err != nil {
		t.Fatal(err)
	}
	var stdout, stderr bytes.Buffer
	if code := run([]string{"coverage", "--report", report, "--triage", bad}, &stdout, &stderr); code != exitFailed || !strings.Contains(stderr.String(), "no such method") {
		t.Errorf("bad triage: exit %d, stderr %q", code, stderr.String())
	}
}
