package main

import (
	"bytes"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"testing"
)

func runReview(t *testing.T, args ...string) (int, string, string) {
	t.Helper()
	var stdout, stderr bytes.Buffer
	code := run(append([]string{"review"}, args...), &stdout, &stderr)
	return code, stdout.String(), stderr.String()
}

func TestReviewGolden(t *testing.T) {
	out := t.TempDir()
	code, stdout, stderr := runReview(t, "--golden", "testdata/recordings/smoke", "--cases", "../../testdata/smoke",
		"--fixtures", "../../testdata/fixtures", "--id", "version.*,getMeetingInfo.*", "--html", filepath.Join(out, "r.html"))
	if code != exitOK {
		t.Fatalf("exit %d: %s", code, stderr)
	}
	html, err := os.ReadFile(filepath.Join(out, "r.html"))
	if err != nil {
		t.Fatal(err)
	}
	for name, got := range map[string]string{"review.txt": stdout, "review.html": string(html)} {
		golden := filepath.Join("testdata", "golden", name)
		if *update {
			if err := os.WriteFile(golden, []byte(got), 0o644); err != nil {
				t.Fatal(err)
			}
		} else if want, err := os.ReadFile(golden); err != nil || string(want) != got {
			t.Errorf("%s differs from %s; run go test ./cmd/bbb-conform -update and review the diff", name, golden)
		}
	}
}

// Recordings hold whatever a server answered, so the page must escape it.
func TestReviewEscapes(t *testing.T) {
	cases := casesDir(t, map[string]string{"a/x.yaml": getMeetingsCase("stable", "contract", "")})
	dir := filepath.Join(t.TempDir(), "golden")
	rec := "case getMeetings.record.stable\ntarget h\n\n== step 1: call getMeetings\nstatus 200\n/response/name \"<script>alert(1)</script>\"\n"
	if err := os.MkdirAll(filepath.Join(dir, "getMeetings"), 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(filepath.Join(dir, "getMeetings", "getMeetings.record.stable.txt"), []byte(rec), 0o644); err != nil {
		t.Fatal(err)
	}
	page := filepath.Join(t.TempDir(), "r.html")
	if code, _, stderr := runReview(t, "--golden", dir, "--cases", cases, "--html", page); code != exitOK {
		t.Fatalf("exit %d: %s", code, stderr)
	}
	html, _ := os.ReadFile(page)
	if strings.Contains(string(html), "<script>") || !strings.Contains(string(html), "&lt;script&gt;alert(1)&lt;/script&gt;") {
		t.Errorf("not escaped:\n%s", html)
	}
}

func TestReviewSince(t *testing.T) {
	if _, err := exec.LookPath("git"); err != nil {
		t.Skip("git isn't installed")
	}
	repo := t.TempDir()
	gitIn := func(args ...string) {
		t.Helper()
		cmd := exec.Command("git", append([]string{"-C", repo, "-c", "user.name=t", "-c", "user.email=t@example.com", "-c", "commit.gpgsign=false"}, args...)...)
		cmd.Env = append(os.Environ(), "GIT_CONFIG_GLOBAL=/dev/null", "GIT_CONFIG_NOSYSTEM=1")
		if out, err := cmd.CombinedOutput(); err != nil {
			t.Fatalf("git %v: %v\n%s", args, err, out)
		}
	}
	write := func(rel, body string) {
		t.Helper()
		p := filepath.Join(repo, rel)
		if err := os.MkdirAll(filepath.Dir(p), 0o755); err != nil {
			t.Fatal(err)
		}
		if err := os.WriteFile(p, []byte(body), 0o644); err != nil {
			t.Fatal(err)
		}
	}
	rec := func(id string, lines ...string) string {
		return "case getMeetings.record." + id + "\ntarget h\n\n== step 1: call getMeetings\n" + strings.Join(lines, "\n") + "\n"
	}
	for _, id := range []string{"kept", "changed", "removed", "added"} {
		write("cases/a/"+id+".yaml", getMeetingsCase(id, "contract", ""))
	}
	golden := filepath.Join(repo, "golden", "h")
	write("golden/h/getMeetings/getMeetings.record.kept.txt", rec("kept", "status 200"))
	write("golden/h/getMeetings/getMeetings.record.changed.txt", rec("changed", "status 200", `/response/returncode "SUCCESS"`, `/response/a "1"`))
	write("golden/h/getMeetings/getMeetings.record.removed.txt", rec("removed", "status 200"))
	gitIn("init", "-q")
	gitIn("add", ".")
	gitIn("commit", "-q", "-m", "first")

	write("golden/h/getMeetings/getMeetings.record.changed.txt", rec("changed", "status 200", `/response/returncode "FAILED"`, `/response/a "1"`)+
		"\n== step 2: call end\nstatus 200\n")
	write("golden/h/getMeetings/getMeetings.record.added.txt", rec("added", "status 200"))
	if err := os.Remove(filepath.Join(golden, "getMeetings", "getMeetings.record.removed.txt")); err != nil {
		t.Fatal(err)
	}

	code, stdout, stderr := runReview(t, "--golden", golden, "--cases", filepath.Join(repo, "cases"), "--since", "HEAD")
	if code != exitOK {
		t.Fatalf("exit %d: %s", code, stderr)
	}
	stdout = strings.ReplaceAll(stdout, repo, "REPO")
	want := `== getMeetings.record.added (new)
   t [contract], REPO/cases/a/added.yaml:1
   case getMeetings.record.added
   target h

   == step 1: call getMeetings
   status 200

== getMeetings.record.changed (changed)
   t [contract], REPO/cases/a/changed.yaml:1
     == step 1: call getMeetings
   - /response/returncode "SUCCESS"
   + /response/returncode "FAILED"
   + == step 2: call end
   + status 200

== getMeetings.record.removed (removed)
   t [contract], REPO/cases/a/removed.yaml:1

REPO/golden/h since HEAD: 1 new, 1 changed, 1 removed
`
	if stdout != want {
		t.Errorf("got:\n%s\nwant:\n%s", stdout, want)
	}

	if code, _, stderr := runReview(t, "--golden", golden, "--cases", filepath.Join(repo, "cases"), "--since", "no-such-rev"); code != exitUsage || !strings.Contains(stderr, "no-such-rev is not a revision") {
		t.Errorf("a bad revision: exit %d: %s", code, stderr)
	}
}

func TestReviewUsage(t *testing.T) {
	for _, args := range [][]string{
		{},
		{"--golden", "testdata/no-such-dir"},
		{"--golden", "testdata/recordings/smoke", "--id", "["},
	} {
		if code, _, _ := runReview(t, args...); code != exitUsage {
			t.Errorf("%v: exit %d, want %d", args, code, exitUsage)
		}
	}
}
