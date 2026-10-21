package main

import (
	"bytes"
	"strings"
	"testing"
)

func TestRun(t *testing.T) {
	tests := []struct {
		args     []string
		code     int
		inStdout string
	}{
		{[]string{"validate", "--cases", "../../testdata/cases"}, exitOK, "ok: 23 case(s) in 16 file(s)"},
		{[]string{"validate", "--cases", "../../internal/spec/testdata/invalid", "--fixtures", "../../testdata/fixtures"}, exitFailed, "problem(s) in 40 file(s)"},
		{[]string{"validate", "--cases", "no-such-dir"}, exitUsage, ""},
		{[]string{"validate", "--cases", "../../testdata/cases", "--fixtures", "no-such-dir"}, exitUsage, ""},
		{[]string{"validate", "extra"}, exitUsage, ""},
		{[]string{"version"}, exitOK, "bbb-conform dev"},
		{[]string{"frobnicate"}, exitUsage, ""},
		{nil, exitUsage, ""},
	}
	for _, tt := range tests {
		var stdout, stderr bytes.Buffer
		code := run(tt.args, &stdout, &stderr)
		if code != tt.code {
			t.Errorf("run(%q) = %d, want %d\nstdout: %s\nstderr: %s", tt.args, code, tt.code, stdout.String(), stderr.String())
		}
		if !strings.Contains(stdout.String(), tt.inStdout) {
			t.Errorf("run(%q) stdout = %q, want it to contain %q", tt.args, stdout.String(), tt.inStdout)
		}
	}
}

func TestTapUsage(t *testing.T) {
	for _, args := range [][]string{
		{"tap", "--redis", "http://x"},
		{"tap", "--data-dir", "no/such/dir"},
		{"tap", "extra"},
	} {
		var stdout, stderr bytes.Buffer
		if code := run(args, &stdout, &stderr); code != exitUsage {
			t.Errorf("%v: exit %d: %s", args, code, stderr.String())
		}
	}
}
