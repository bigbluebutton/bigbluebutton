package main

import (
	"bytes"
	"fmt"
	"io/fs"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"testing"
	"time"

	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/fakebbb"
)

func runRecord(t *testing.T, tf, cases, out string, extra ...string) (int, string) {
	t.Helper()
	var stdout, stderr bytes.Buffer
	args := append([]string{"record", "--target", tf, "--cases", cases, "--fixtures", "../../testdata/fixtures",
		"--parallel", "1", "--out", out}, extra...)
	code := run(args, &stdout, &stderr)
	if stderr.Len() > 0 {
		t.Logf("stderr: %s", stderr.String())
	}
	return code, strings.ReplaceAll(stdout.String(), out, "OUT")
}

// readTree returns every file under dir by its slash-separated path.
func readTree(t *testing.T, dir string) map[string]string {
	t.Helper()
	files := map[string]string{}
	err := filepath.WalkDir(dir, func(p string, d fs.DirEntry, err error) error {
		if err != nil || d.IsDir() {
			return err
		}
		data, err := os.ReadFile(p)
		rel, _ := filepath.Rel(dir, p)
		files[filepath.ToSlash(rel)] = string(data)
		return err
	})
	if err != nil {
		t.Fatal(err)
	}
	return files
}

func TestRecordGolden(t *testing.T) {
	newUID = func(i int) string { return fmt.Sprintf("uid-%03d", i) }
	t.Cleanup(func() { newUID = nil })
	for _, set := range []string{"cases", "smoke"} {
		t.Run(set, func(t *testing.T) {
			tf := startTarget(t, "fake", "/bigbluebutton/api/", fakebbb.New(fakeSalt))
			out := t.TempDir()
			code, stdout := runRecord(t, tf, "../../testdata/"+set, out)
			if code != exitOK {
				t.Fatalf("exit %d:\n%s", code, stdout)
			}
			got := readTree(t, out)
			for name, data := range got {
				if strings.Contains(data, fakeSalt) {
					t.Errorf("%s contains the salt", name)
				}
			}
			console := filepath.Join("testdata", "golden", "record-"+set+".txt")
			golden := filepath.Join("testdata", "recordings", set)
			if *update {
				if err := os.WriteFile(console, []byte(stdout), 0o644); err != nil {
					t.Fatal(err)
				}
				if err := os.RemoveAll(golden); err != nil {
					t.Fatal(err)
				}
				for name, data := range got {
					p := filepath.Join(golden, filepath.FromSlash(name))
					if err := os.MkdirAll(filepath.Dir(p), 0o755); err != nil {
						t.Fatal(err)
					}
					if err := os.WriteFile(p, []byte(data), 0o644); err != nil {
						t.Fatal(err)
					}
				}
			} else {
				if want, err := os.ReadFile(console); err != nil || string(want) != stdout {
					t.Errorf("the output differs from %s; run go test ./cmd/bbb-conform -update and review the diff", console)
				}
				want := readTree(t, golden)
				for name := range want {
					if _, ok := got[name]; !ok {
						t.Errorf("%s wasn't recorded", name)
					}
				}
				for name, data := range got {
					if want[name] != data {
						t.Errorf("%s differs from %s; run go test ./cmd/bbb-conform -update and review the diff", name, golden)
					}
				}
			}

			// Recording again changes nothing, and leaves the files alone.
			before := map[string]time.Time{}
			_ = filepath.WalkDir(out, func(p string, d fs.DirEntry, err error) error {
				if info, ierr := d.Info(); err == nil && ierr == nil && !d.IsDir() {
					before[p] = info.ModTime()
				}
				return err
			})
			time.Sleep(10 * time.Millisecond)
			code, stdout = runRecord(t, startTarget(t, "fake", "/bigbluebutton/api/", fakebbb.New(fakeSalt)), "../../testdata/"+set, out)
			if code != exitOK || !strings.Contains(stdout, " 0 new, 0 changed, ") {
				t.Errorf("second record: exit %d:\n%s", code, stdout)
			}
			for p, mt := range before {
				if info, err := os.Stat(p); err != nil || !info.ModTime().Equal(mt) {
					t.Errorf("%s was rewritten", p)
				}
			}
		})
	}
}

// casesDir writes case files into a fresh cases directory.
func casesDir(t *testing.T, files map[string]string) string {
	t.Helper()
	dir := filepath.Join(t.TempDir(), "cases")
	for name, body := range files {
		p := filepath.Join(dir, name)
		if err := os.MkdirAll(filepath.Dir(p), 0o755); err != nil {
			t.Fatal(err)
		}
		if err := os.WriteFile(p, []byte(body), 0o644); err != nil {
			t.Fatal(err)
		}
	}
	return dir
}

func getMeetingsCase(id, class, extra string) string {
	return fmt.Sprintf("id: getMeetings.record.%s\ntitle: t\nendpoint: getMeetings\nclass: %s\nsteps:\n  - call: getMeetings\n    params: {tag: %s}\n%s",
		id, class, id, extra)
}

// scripted answers getMeetings by its tag param, counting the calls per
// tag, so a case can answer differently in its second pass.
func scripted() http.Handler {
	var mu sync.Mutex
	calls := map[string]int{}
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		q := r.URL.Query()
		tag := q.Get("tag")
		mu.Lock()
		calls[tag]++
		n := calls[tag]
		mu.Unlock()
		code := "SUCCESS"
		body := ""
		switch tag {
		case "lines":
			body = fmt.Sprintf("<count>%d</count>", n)
		case "outcome":
			if n > 1 {
				code = "FAILED"
			}
		case "error":
			if n > 1 {
				if conn, _, err := w.(http.Hijacker).Hijack(); err == nil {
					conn.Close()
				}
				return
			}
		case "echo":
			body = "<name>" + q.Get("name") + "</name>"
		}
		w.Header().Set("Content-Type", "text/xml;charset=utf-8")
		fmt.Fprintf(w, "<response><returncode>%s</returncode>%s</response>", code, body)
	})
}

func TestRecordOutcomes(t *testing.T) {
	newUID = func(i int) string { return fmt.Sprintf("uid-%03d", i) }
	t.Cleanup(func() { newUID = nil })
	cases := casesDir(t, map[string]string{
		"a/stable.yaml":     getMeetingsCase("stable", "contract", "    expect: {returncode: SUCCESS}\n"),
		"a/lines.yaml":      getMeetingsCase("lines", "contract", ""),
		"a/outcome.yaml":    getMeetingsCase("outcome", "contract", "    expect: {returncode: SUCCESS}\n"),
		"a/error.yaml":      getMeetingsCase("error", "contract", ""),
		"a/incomplete.yaml": getMeetingsCase("incomplete", "contract", "    capture: {x: /response/nothing}\n  - call: getMeetings\n    params: {tag: incomplete}\n"),
		"a/echo.yaml":       strings.Replace(getMeetingsCase("echo", "contract", ""), "{tag: echo}", `{tag: echo, name: "${salt}"}`, 1),
		"a/defect.yaml":     getMeetingsCase("defect", "defect", "    expect: {returncode: FAILED}\n"),
		"a/wrong.yaml":      getMeetingsCase("wrong", "contract", "    expect: {returncode: FAILED}\n"),
	})
	tf := startTarget(t, "h", "/bigbluebutton/api/", scripted())
	out := filepath.Join(t.TempDir(), "golden")
	orphan := filepath.Join(out, "getMeetings", "getMeetings.record.gone.txt")
	if err := os.MkdirAll(filepath.Dir(orphan), 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(orphan, []byte("case getMeetings.record.gone\n"), 0o644); err != nil {
		t.Fatal(err)
	}

	for _, tt := range []struct {
		id   string
		code int
		want []string // in the console output
		file bool     // whether the recording is written
	}{
		{"stable", exitOK, []string{"NEW        getMeetings.record.stable\n", "OUT: 1 new, 0 changed"}, true},
		{"lines", exitFailed, []string{"UNSTABLE   getMeetings.record.lines: passes 1 and 2 answered differently", "    step 1:\n    - /response/count \"1\"\n    + /response/count \"2\"\n"}, false},
		{"outcome", exitFailed, []string{"UNSTABLE   getMeetings.record.outcome: PASS in pass 1, FAIL in pass 2"}, false},
		{"error", exitFailed, []string{"ERROR      getMeetings.record.error: step 1 (line 6): "}, false},
		{"incomplete", exitFailed, []string{"INCOMPLETE getMeetings.record.incomplete: step 2: call getMeetings wasn't reached"}, false},
		{"echo", exitFailed, []string{"SECRET     getMeetings.record.echo: the answer holds a secret"}, false},
		{"defect", exitOK, []string{"NEW        getMeetings.record.defect\n    expect failed, as a defect case's may: step 1 (line 6): returncode"}, true},
		{"wrong", exitFailed, []string{"NEW        getMeetings.record.wrong\n    expect failed: step 1 (line 6): returncode: expected \"FAILED\", got \"SUCCESS\". Recorded anyway"}, true},
	} {
		code, stdout := runRecord(t, tf, cases, out, "--id", "getMeetings.record."+tt.id)
		if code != tt.code {
			t.Errorf("%s: exit %d, want %d:\n%s", tt.id, code, tt.code, stdout)
		}
		for _, w := range tt.want {
			if !strings.Contains(stdout, w) {
				t.Errorf("%s: output lacks %q:\n%s", tt.id, w, stdout)
			}
		}
		if !strings.Contains(stdout, "warning: OUT/getMeetings/getMeetings.record.gone.txt records getMeetings.record.gone, which is no longer a case\n") {
			t.Errorf("%s: no orphan warning:\n%s", tt.id, stdout)
		}
		if strings.Contains(stdout, fakeSalt) {
			t.Errorf("%s: the output contains the salt", tt.id)
		}
		_, err := os.Stat(filepath.Join(out, "getMeetings", "getMeetings.record."+tt.id+".txt"))
		if written := err == nil; written != tt.file {
			t.Errorf("%s: written = %v, want %v", tt.id, written, tt.file)
		}
	}

	data, err := os.ReadFile(filepath.Join(out, "getMeetings", "getMeetings.record.defect.txt"))
	if err != nil || !strings.Contains(string(data), "== step 1: call getMeetings (document)\n") {
		t.Errorf("the defect case's step should be recorded as document:\n%s", data)
	}
}

// The fake's clock moves on between passes; without the createTime mask
// that must show as an unstable recording, and nothing is written.
func TestRecordUnstableWithoutMask(t *testing.T) {
	newUID = func(i int) string { return fmt.Sprintf("uid-%03d", i) }
	t.Cleanup(func() { newUID = nil })
	noop := filepath.Join(t.TempDir(), "masks.yaml")
	if err := os.WriteFile(noop, []byte("masks: [{field: createTime, as: regex, regex: '^$', replace: ''}]\n"), 0o644); err != nil {
		t.Fatal(err)
	}
	tf := startTarget(t, "fake", "/bigbluebutton/api/", fakebbb.New(fakeSalt))
	out := t.TempDir()
	code, stdout := runRecord(t, tf, "../../testdata/smoke", out, "--masks", noop, "--id", "create.smoke.lifecycle")
	if code != exitFailed || !strings.Contains(stdout, "UNSTABLE   create.smoke.lifecycle") || !strings.Contains(stdout, "/response/createTime") {
		t.Errorf("exit %d:\n%s", code, stdout)
	}
	if files := readTree(t, out); len(files) != 0 {
		t.Errorf("wrote %v", files)
	}
}

func TestRecordUsage(t *testing.T) {
	tf := startTarget(t, "fake", "/bigbluebutton/api/", fakebbb.New(fakeSalt))
	for _, args := range [][]string{
		{"record"},
		{"record", "--target", tf, "--passes", "1"},
		{"record", "--target", tf, "--id", "["},
		{"record", "--target", tf, "extra"},
	} {
		var stdout, stderr bytes.Buffer
		if code := run(args, &stdout, &stderr); code != exitUsage {
			t.Errorf("%v: exit %d, want %d", args, code, exitUsage)
		}
	}
	var stdout, stderr bytes.Buffer
	out := filepath.Join(t.TempDir(), "target", "golden")
	run([]string{"record", "--target", tf, "--cases", "../../testdata/smoke", "--fixtures", "../../testdata/fixtures", "--id", "version.*", "--out", out}, &stdout, &stderr)
	if !strings.Contains(stderr.String(), "git ignores directories named target") {
		t.Errorf("no warning about a target directory: %s", stderr.String())
	}
}
