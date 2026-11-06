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
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/golden"
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
		{"incomplete", exitFailed, []string{"INCOMPLETE getMeetings.record.incomplete: step 2: call getMeetings wasn't reached, after step 1 (line 6): capture /response/nothing: nothing matched\nwarning:"}, false},
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

func runGolden(t *testing.T, tf, cases, recordings string, extra ...string) (int, string) {
	t.Helper()
	var stdout, stderr bytes.Buffer
	args := append([]string{"run", "--target", tf, "--cases", cases, "--fixtures", "../../testdata/fixtures",
		"--parallel", "1", "-v", "--golden", recordings}, extra...)
	code := run(args, &stdout, &stderr)
	if stderr.Len() > 0 {
		t.Logf("stderr: %s", stderr.String())
	}
	return code, strings.ReplaceAll(stdout.String(), recordings, "GOLDEN")
}

// What one server recorded, another answers alike, whatever its clocks and
// tokens; bbb-api's differences become failures, here expected ones.
func TestRecordThenRun(t *testing.T) {
	newUID = func(i int) string { return fmt.Sprintf("uid-%03d", i) }
	t.Cleanup(func() { newUID = nil })
	for _, set := range []string{"cases", "smoke"} {
		recordings := t.TempDir()
		if code, stdout := runRecord(t, startTarget(t, "fake", "/bigbluebutton/api/", fakebbb.New(fakeSalt)), "../../testdata/"+set, recordings); code != exitOK {
			t.Fatalf("%s: record exit %d:\n%s", set, code, stdout)
		}
		other := fakebbb.New(fakeSalt)
		other.Skew(86_400_000, 500)
		code, stdout := runGolden(t, startTarget(t, "web-b", "/bigbluebutton/api/", other), "../../testdata/"+set, recordings, "--parallel", "4")
		if code != exitOK || !strings.Contains(stdout, " 0 failed, 0 errors") {
			t.Errorf("%s: exit %d:\n%s", set, code, stdout)
		}
		if set != "smoke" {
			continue
		}
		api := startTarget(t, "fake-api", "/meeting-api/", fakebbb.NewAPI(fakeSalt))
		code, stdout = runGolden(t, api, "../../testdata/smoke", recordings, "--expect", "../../testdata/expectations/fake-api.yaml")
		if code != exitOK {
			t.Errorf("against fake bbb-api: exit %d:\n%s", code, stdout)
		}
		stdout = scrub(stdout)
		golden := filepath.Join("testdata", "golden", "golden-api.txt")
		if *update {
			if err := os.WriteFile(golden, []byte(stdout), 0o644); err != nil {
				t.Fatal(err)
			}
		} else if want, err := os.ReadFile(golden); err != nil || string(want) != stdout {
			t.Errorf("the output differs from %s; run go test ./cmd/bbb-conform -update and review the diff", golden)
		}
	}
}

func TestRunGoldenChecks(t *testing.T) {
	newUID = func(i int) string { return fmt.Sprintf("uid-%03d", i) }
	t.Cleanup(func() { newUID = nil })
	stable := getMeetingsCase("stable", "contract", "    expect: {returncode: SUCCESS}\n")
	cases := casesDir(t, map[string]string{
		"a/stable.yaml": stable,
		"a/doc.yaml":    getMeetingsCase("doc", "contract", "    expect: {returncode: SUCCESS}\n    golden: document\n"),
	})
	var sent sync.Map
	inner := scripted()
	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		n, _ := sent.LoadOrStore(r.URL.Query().Get("tag"), new(int))
		*n.(*int)++
		inner.ServeHTTP(w, r)
	})
	tf := startTarget(t, "h", "/bigbluebutton/api/", handler)
	out := filepath.Join(t.TempDir(), "golden")
	if code, stdout := runRecord(t, tf, cases, out); code != exitOK {
		t.Fatalf("record exit %d:\n%s", code, stdout)
	}
	if code, stdout := runGolden(t, tf, cases, out); code != exitOK {
		t.Errorf("as recorded: exit %d:\n%s", code, stdout)
	}

	file := func(id string) string { return filepath.Join(out, "getMeetings", "getMeetings.record."+id+".txt") }
	edit := func(id, old, new string) {
		data, err := os.ReadFile(file(id))
		if err != nil || !strings.Contains(string(data), old) {
			t.Fatalf("%s: %v\n%s", id, err, data)
		}
		if err := os.WriteFile(file(id), []byte(strings.Replace(string(data), old, new, 1)), 0o644); err != nil {
			t.Fatal(err)
		}
	}
	edit("stable", `/response/returncode "SUCCESS"`, `/response/returncode "FAILED"`)
	edit("doc", `/response/returncode "SUCCESS"`, `/response/returncode "FAILED"`)
	code, stdout := runGolden(t, tf, cases, out)
	if code != exitFailed || !strings.Contains(stdout, "FAIL  getMeetings.record.stable") ||
		!strings.Contains(stdout, `recording /response/returncode: expected "FAILED", got "SUCCESS"`) ||
		!strings.Contains(stdout, "PASS  getMeetings.record.doc") {
		t.Errorf("an edited recording: exit %d:\n%s", code, stdout)
	}

	count := func(tag string) int {
		n, _ := sent.Load(tag)
		return *n.(*int)
	}
	before := count("stable")
	if err := os.Remove(file("stable")); err != nil {
		t.Fatal(err)
	}
	code, stdout = runGolden(t, tf, cases, out, "--id", "getMeetings.record.stable")
	if code != exitFailed || !strings.Contains(stdout, "ERROR getMeetings.record.stable") || !strings.Contains(stdout, "\n      no recording: run bbb-conform record\n") || count("stable") != before {
		t.Errorf("no recording: exit %d, %d request(s) sent:\n%s", code, count("stable")-before, stdout)
	}

	if code, stdout := runRecord(t, tf, cases, out); code != exitOK {
		t.Fatalf("record exit %d:\n%s", code, stdout)
	}
	if err := os.WriteFile(filepath.Join(cases, "a", "stable.yaml"), []byte(strings.Replace(stable, "steps:\n", "steps:\n  - wait: 1ms\n", 1)), 0o644); err != nil {
		t.Fatal(err)
	}
	before = count("stable")
	code, stdout = runGolden(t, tf, cases, out, "--id", "getMeetings.record.stable")
	if code != exitFailed || count("stable") != before ||
		!strings.Contains(stdout, "the recording is stale: it has step 1: call getMeetings where the case has step 2: call getMeetings. Record the case again") {
		t.Errorf("a stale recording: exit %d:\n%s", code, stdout)
	}

	if err := os.WriteFile(filepath.Join(out, "getMeetings.record.gone.txt"), []byte("case getMeetings.record.gone\n"), 0o644); err != nil {
		t.Fatal(err)
	}
	if _, stdout := runGolden(t, tf, cases, out, "--id", "getMeetings.record.doc"); !strings.Contains(stdout, "warning: GOLDEN/getMeetings.record.gone.txt records getMeetings.record.gone, which is no longer a case") {
		t.Errorf("no orphan warning:\n%s", stdout)
	}

	var o, e bytes.Buffer
	if code := run([]string{"run", "--target", tf, "--cases", cases, "--golden", filepath.Join(out, "missing")}, &o, &e); code != exitUsage {
		t.Errorf("a missing recordings directory: exit %d", code)
	}
}

func TestNamesHost(t *testing.T) {
	hosts := hostNames([]string{"https://bbb.test", "http://10.0.0.5:8090", "::bad"})
	if strings.Join(hosts, ",") != "bbb.test,10.0.0.5" {
		t.Fatalf("hostNames = %q", hosts)
	}
	f := &golden.File{Sections: []golden.Section{
		{Label: `call ""`, Lines: []string{`/response/graphqlWebsocketUrl "${wsBaseUrl}/graphql"`}},
		{Label: "call getMeetings", Lines: []string{`/response/message "see bbb.test/help"`}},
	}}
	if got := namesHost(f, hosts); got != "bbb.test in call getMeetings" {
		t.Errorf("namesHost = %q", got)
	}
	f.Sections = f.Sections[:1]
	if got := namesHost(f, hosts); got != "" {
		t.Errorf("namesHost = %q, want none", got)
	}
	// A host that is only a substring of a longer one isn't a match.
	for _, l := range []string{`"10.0.0.50"`, `"bbb.test.other/x"`, "xbbb.test"} {
		g := &golden.File{Sections: []golden.Section{{Label: "s", Lines: []string{l}}}}
		if got := namesHost(g, []string{"bbb.test", "10.0.0.5"}); got != "" {
			t.Errorf("namesHost(%q) = %q, want none", l, got)
		}
	}
	g := &golden.File{Sections: []golden.Section{{Label: "s", Lines: []string{`location wss://bbb.test/graphql`}}}}
	if got := namesHost(g, []string{"bbb.test"}); got != "bbb.test in s" {
		t.Errorf("namesHost whole host = %q", got)
	}
}
