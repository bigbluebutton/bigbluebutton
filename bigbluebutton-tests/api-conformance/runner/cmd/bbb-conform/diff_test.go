package main

import (
	"bytes"
	"encoding/json"
	"encoding/pem"
	"fmt"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/diff"
	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/fakebbb"
)

// startTarget serves handler over TLS and writes a target file for it.
func startTarget(t *testing.T, name, apiPrefix string, handler http.Handler) string {
	t.Helper()
	tapLine := ""
	if fake, ok := handler.(*fakebbb.Server); ok {
		tapLine = "tapUrl: " + startTap(t, fake) + "\n" + startSink(t, fake)
	}
	srv := httptest.NewTLSServer(handler)
	t.Cleanup(srv.Close)
	dir := t.TempDir()
	if err := os.WriteFile(filepath.Join(dir, "ca.pem"), pem.EncodeToMemory(&pem.Block{Type: "CERTIFICATE", Bytes: srv.Certificate().Raw}), 0o644); err != nil {
		t.Fatal(err)
	}
	tf := filepath.Join(dir, name+".yaml")
	body := fmt.Sprintf("name: %s\nbaseUrl: %s\napiPrefix: %s\nsalt: %s\ntls: {caFile: ca.pem}\ncapabilities: [akka, presence]\nfixtureUrl: https://fixtures.test\n%s",
		name, srv.URL, apiPrefix, fakeSalt, tapLine)
	if err := os.WriteFile(tf, []byte(body), 0o644); err != nil {
		t.Fatal(err)
	}
	return tf
}

func runDiff(t *testing.T, a, b, cases string, extra ...string) (int, string, *diff.Report, string) {
	t.Helper()
	out := t.TempDir()
	var stdout, stderr bytes.Buffer
	args := append([]string{"diff", "--a", a, "--b", b, "--cases", "../../testdata/" + cases, "--fixtures", "../../testdata/fixtures",
		"--parallel", "1", "--md", filepath.Join(out, "d.md"), "--json", filepath.Join(out, "d.json")}, extra...)
	code := run(args, &stdout, &stderr)
	if stderr.Len() > 0 {
		t.Logf("stderr: %s", stderr.String())
	}
	data, err := os.ReadFile(filepath.Join(out, "d.json"))
	if err != nil {
		t.Fatal(err)
	}
	rep := &diff.Report{}
	if err := json.Unmarshal(data, rep); err != nil {
		t.Fatal(err)
	}
	md, _ := os.ReadFile(filepath.Join(out, "d.md"))
	return code, stdout.String(), rep, string(md)
}

// A server compared with itself must show no differences: that is what
// proves the masks cover every value that changes from run to run.
func TestDiffSelf(t *testing.T) {
	newUID = func(i int) string { return fmt.Sprintf("uid-%03d", i) }
	t.Cleanup(func() { newUID = nil })
	for _, cases := range []string{"cases", "smoke"} {
		a := startTarget(t, "web-a", "/bigbluebutton/api/", fakebbb.New(fakeSalt))
		other := fakebbb.New(fakeSalt)
		other.Skew(86_400_000, 500) // other create times, passwords and tokens
		b := startTarget(t, "web-b", "/bigbluebutton/api/", other)
		code, stdout, rep, _ := runDiff(t, a, b, cases, "--fail-on-diff")
		if code != exitOK || rep.Differs() {
			t.Errorf("%s: exit %d, differences:\n%s", cases, code, stdout)
			for _, c := range rep.Cases {
				for _, s := range c.Steps {
					t.Logf("%s %s[%d]: %s", c.ID, s.Phase, s.Index, strings.Join(s.Hunk, " | "))
				}
			}
		}
		if rep.Counts.Identical == 0 {
			t.Errorf("%s: nothing was compared: %+v", cases, rep.Counts)
		}
	}

	// Negative control: with the createTime mask overridden by a no-op, the
	// skewed clock must show up, so the masks above did real work.
	noop := filepath.Join(t.TempDir(), "masks.yaml")
	if err := os.WriteFile(noop, []byte("masks: [{field: createTime, as: regex, regex: '^$', replace: ''}]\n"), 0o644); err != nil {
		t.Fatal(err)
	}
	a := startTarget(t, "web-a", "/bigbluebutton/api/", fakebbb.New(fakeSalt))
	other := fakebbb.New(fakeSalt)
	other.Skew(86_400_000, 500)
	b := startTarget(t, "web-b", "/bigbluebutton/api/", other)
	_, _, rep, md := runDiff(t, a, b, "smoke", "--masks", noop)
	if !rep.Differs() || !strings.Contains(md, "/response/createTime") {
		t.Errorf("without the createTime mask the skew should show:\n%s", md)
	}
}

func TestDiffWebVsAPI(t *testing.T) {
	newUID = func(i int) string { return fmt.Sprintf("uid-%03d", i) }
	t.Cleanup(func() { newUID = nil })
	web := startTarget(t, "fake-web", "/bigbluebutton/api/", fakebbb.New(fakeSalt))
	api := startTarget(t, "fake-api", "/meeting-api/", fakebbb.NewAPI(fakeSalt))
	code, stdout, rep, md := runDiff(t, web, api, "smoke")
	if code != exitOK {
		t.Fatalf("exit %d without --fail-on-diff", code)
	}
	all := md + stdout
	for _, want := range []string{
		"- status 200", "+ status 202",
		"+ header Content-Type application/xml",
		`- /response/returncode "SUCCESS"`, `+ /response/returnCode "SUCCESS"`,
		`+ /response/moderatorPw "<random>"`,
	} {
		if !strings.Contains(all, want) {
			t.Errorf("the report should show %q", want)
		}
	}
	// create's check fails on bbb-api (returnCode), but its capture still
	// feeds getMeetingInfo, which therefore has a real answer to compare.
	for _, c := range rep.Cases {
		if c.ID == "create.smoke.lifecycle" {
			for _, s := range c.Steps {
				if s.Index == 1 && s.Kind != "differing" {
					t.Errorf("getMeetingInfo step: %s", s.Kind)
				}
			}
		}
	}
	golden := filepath.Join("testdata", "golden", "diff-web-api.md")
	got := scrub(md)
	if *update {
		if err := os.WriteFile(golden, []byte(got), 0o644); err != nil {
			t.Fatal(err)
		}
		return
	}
	want, err := os.ReadFile(golden)
	if err != nil {
		t.Fatalf("%v (run go test -update to create it)", err)
	}
	if got != string(want) {
		t.Errorf("the report differs from %s; run go test ./cmd/bbb-conform -update and review the diff", golden)
	}
	if code, _, _, _ := runDiff(t, web, api, "smoke", "--fail-on-diff", "--id", "version.*"); code != exitFailed {
		t.Errorf("--fail-on-diff: exit %d", code)
	}
}

func TestDiffUsage(t *testing.T) {
	tf := startFake(t, "akka, presence", true)
	for _, args := range [][]string{
		{"diff"},
		{"diff", "--a", tf},
		{"diff", "--a", tf, "--b", "missing.yaml"},
		{"diff", "--a", tf, "--b", tf, "--masks", "missing.yaml", "--cases", "../../testdata/smoke"},
	} {
		var stdout, stderr bytes.Buffer
		if code := run(args, &stdout, &stderr); code != exitUsage {
			t.Errorf("%v: exit %d, want %d\n%s", args, code, exitUsage, stderr.String())
		}
	}
}
