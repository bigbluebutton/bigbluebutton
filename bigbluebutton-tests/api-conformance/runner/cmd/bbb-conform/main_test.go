package main

import (
	"bytes"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestRun(t *testing.T) {
	tests := []struct {
		args     []string
		code     int
		inStdout string
	}{
		{[]string{"validate", "--cases", "../../testdata/cases"}, exitOK, "ok: 24 case(s) in 17 file(s)"},
		{[]string{"validate", "--cases", "../../internal/spec/testdata/invalid", "--fixtures", "../../testdata/fixtures"}, exitFailed, "problem(s) in 48 file(s)"},
		{[]string{"validate", "--cases", "../../testdata/smoke", "--golden", "testdata/recordings/smoke"}, exitOK, "is current"},
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

// validate --golden reports a missing recording, a stale one, one from
// another target, a leaked secret and an orphan.
func TestValidateGolden(t *testing.T) {
	dir := filepath.Join(t.TempDir(), "smoke")
	if err := os.CopyFS(dir, os.DirFS("testdata/recordings/smoke")); err != nil {
		t.Fatal(err)
	}
	edit := func(rel, old, new string) {
		t.Helper()
		p := filepath.Join(dir, rel)
		data, err := os.ReadFile(p)
		if err != nil || !strings.Contains(string(data), old) {
			t.Fatalf("%s: %v, or no %q in it", rel, err, old)
		}
		if err := os.WriteFile(p, []byte(strings.Replace(string(data), old, new, 1)), 0o644); err != nil {
			t.Fatal(err)
		}
	}
	if err := os.Remove(filepath.Join(dir, "version", "version.smoke.fields.txt")); err != nil {
		t.Fatal(err)
	}
	edit("getMeetings/getMeetings.smoke.checksum-accepted-sha1.txt", "== step 1: call getMeetings", "== step 1: call getMeetingInfo")
	edit("getMeetings/getMeetings.smoke.checksum-accepted-sha256.txt", "target fake", "target other")
	edit("getMeetings/getMeetings.smoke.checksum-accepted-sha384.txt", "status 200", "status 200\n/response/x \"[salt]\"")
	if err := os.WriteFile(filepath.Join(dir, "getMeetings", "getMeetings.gone.txt"), []byte("x"), 0o644); err != nil {
		t.Fatal(err)
	}
	var stdout, stderr bytes.Buffer
	if code := run([]string{"validate", "--cases", "../../testdata/smoke", "--golden", dir}, &stdout, &stderr); code != exitFailed {
		t.Fatalf("exit %d, want %d\n%s%s", code, exitFailed, stdout.String(), stderr.String())
	}
	for _, want := range []string{
		"version.smoke.fields: no recording at",
		"getMeetings.smoke.checksum-accepted-sha1.txt: stale: it has step 1: call getMeetingInfo where the case has step 1: call getMeetings",
		`getMeetings.smoke.checksum-accepted-sha256.txt: recorded from target "other", where the others are from "fake"`,
		"getMeetings.smoke.checksum-accepted-sha384.txt: call getMeetings holds a secret",
		"getMeetings.gone.txt records getMeetings.gone, which is no longer a case",
		"5 problem(s) with the recordings",
	} {
		if !strings.Contains(stdout.String(), want) {
			t.Errorf("stdout lacks %q:\n%s", want, stdout.String())
		}
	}
}
