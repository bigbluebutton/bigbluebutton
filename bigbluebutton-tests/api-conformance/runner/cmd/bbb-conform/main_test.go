package main

import (
	"bytes"
	"os"
	"path/filepath"
	"runtime"
	"strings"
	"testing"
)

func TestRun(t *testing.T) {
	tests := []struct {
		args     []string
		code     int
		inStdout string
	}{
		{[]string{"validate", "--cases", "../../testdata/cases"}, exitOK, "ok: 25 case(s) in 18 file(s)"},
		{[]string{"validate", "--cases", "../../internal/spec/testdata/invalid", "--fixtures", "../../testdata/fixtures"}, exitFailed, "problem(s) in 50 file(s)"},
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
		{"tap", "--max-mb", "0"},
		{"tap", "--max-age", "0s"},
		// Beyond this host, only with a token (BBB_TAP_TOKEN).
		{"tap", "--listen", "0.0.0.0:0"},
		{"tap", "--data-dir", "no/such/dir"},
		{"tap", "extra"},
	} {
		var stdout, stderr bytes.Buffer
		if code := run(args, &stdout, &stderr); code != exitUsage {
			t.Errorf("%v: exit %d: %s", args, code, stderr.String())
		}
	}
}

// TestMain clears the variables targets fall back to, so a shell set up
// for a real server (eval "$(make -s -C env env)") can't reach the fake
// targets the tests write.
func TestMain(m *testing.M) {
	for _, v := range []string{"BBB_URL", "BBB_SECRET", "BBB_TAP_URL", "BBB_SINK_URL", "BBB_SINK_READ_URL", "BBB_SINK_HTTP_URL", "BBB_FIXTURE_URL", "BBB_WEB_DIRECT_URL",
		"BBB_TAP_TOKEN", "BBB_SINK_TOKEN"} {
		os.Unsetenv(v)
	}
	os.Exit(m.Run())
}

func TestSinkUsage(t *testing.T) {
	for _, args := range [][]string{
		{"sink", "--cert", "server.crt"},
		{"sink", "--key", "server.key"},
		{"sink", "--fixtures", "no/such/dir"},
		{"sink", "--listen", "not an address"},
		{"sink", "--listen-http", "127.0.0.1:0"},
		{"sink", "--cert", "testdata/no.crt", "--key", "testdata/no.key", "--listen", "127.0.0.1:0", "--listen-http", "not an address"},
		{"sink", "--max-mb", "0"},
		{"sink", "--max-age", "0s"},
		{"sink", "extra"},
		// Beyond this host, only with a token (BBB_SINK_TOKEN).
		{"sink", "--listen", "0.0.0.0:0"},
		{"sink", "--cert", "testdata/no.crt", "--key", "testdata/no.key", "--listen", "127.0.0.1:0", "--listen-http", ":0"},
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

func TestLoopbackOnly(t *testing.T) {
	for addr, want := range map[string]bool{
		"127.0.0.1:8099": true, "127.0.0.2:1": true, "[::1]:8099": true, "localhost:8444": true,
		"0.0.0.0:8099": false, ":8099": false, "[::]:1": false, "10.0.0.5:8099": false, "sink.test:8444": false, "nonsense": false,
	} {
		if got := loopbackOnly(addr); got != want {
			t.Errorf("%s: %v", addr, got)
		}
	}
}

func TestLoadRulesMasksDir(t *testing.T) {
	dir := t.TempDir()
	write := func(name, body string) string {
		t.Helper()
		p := filepath.Join(dir, name)
		if err := os.MkdirAll(filepath.Dir(p), 0o755); err != nil {
			t.Fatal(err)
		}
		if err := os.WriteFile(p, []byte(body), 0o644); err != nil {
			t.Fatal(err)
		}
		return p
	}
	cases := filepath.Join(dir, "cases")
	suite := write("masks.yaml", "masks: [{field: meetingName, as: token}]\n")
	write("masks.d/b.yaml", "drop: [{path: /response/extra, value: \"false\"}]\n")
	write("masks.d/a.yaml", "masks: [{field: meetingName, as: time}]\n")
	write("masks.d/notes.txt", "not rules\n")

	// maskOf returns the kind of the first mask for field, the one that
	// applies, and whether the masks.d drop rule is loaded.
	maskOf := func(field string, masksFile string) (as string, dropped bool) {
		t.Helper()
		r, err := loadRules(masksFile, cases)
		if err != nil {
			t.Fatal(err)
		}
		for _, m := range r.Masks {
			if m.Field == field && as == "" {
				as = m.As
			}
		}
		for _, d := range r.Drop {
			if d.Path == "/response/extra" {
				dropped = true
			}
		}
		return as, dropped
	}

	// masks.d's files come first, in name order, then masks.yaml.
	if as, dropped := maskOf("meetingName", ""); as != "time" || !dropped {
		t.Errorf("default rules: meetingName as %q, extra dropped %v; want time, true", as, dropped)
	}
	// --masks replaces masks.yaml and masks.d alike.
	if as, dropped := maskOf("meetingName", suite); as != "token" || dropped {
		t.Errorf("--masks rules: meetingName as %q, extra dropped %v; want token, false", as, dropped)
	}
	// A bad file in masks.d fails like a bad masks.yaml.
	write("masks.d/c.yaml", "drop: [{value: x}]\n")
	if _, err := loadRules("", cases); err == nil || !strings.Contains(err.Error(), "c.yaml") {
		t.Errorf("bad masks.d file: error = %v, want it to name c.yaml", err)
	}
}

func TestLoadRulesMasksDirPathAndErrors(t *testing.T) {
	// A directory name with glob metacharacters is taken literally.
	dir := filepath.Join(t.TempDir(), "suite[1")
	if err := os.MkdirAll(filepath.Join(dir, "masks.d"), 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(filepath.Join(dir, "masks.d", "a.yaml"), []byte("drop: [{path: /response/extra}]\n"), 0o644); err != nil {
		t.Fatal(err)
	}
	r, err := loadRules("", filepath.Join(dir, "cases"))
	if err != nil {
		t.Fatalf("cases under %q: %v", dir, err)
	}
	found := false
	for _, d := range r.Drop {
		if d.Path == "/response/extra" {
			found = true
		}
	}
	if !found {
		t.Errorf("cases under %q: masks.d's rules not loaded", dir)
	}

	// An unreadable masks.d fails instead of loading no rules.
	if runtime.GOOS == "windows" {
		t.Skip("chmod does not block directory reads on Windows")
	}
	if os.Geteuid() == 0 {
		t.Skip("root reads any directory")
	}
	if err := os.Chmod(filepath.Join(dir, "masks.d"), 0o000); err != nil {
		t.Fatal(err)
	}
	defer os.Chmod(filepath.Join(dir, "masks.d"), 0o755)
	if _, err := loadRules("", filepath.Join(dir, "cases")); err == nil {
		t.Error("an unreadable masks.d should fail")
	}
}
