package main

import (
	"bytes"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/fakebbb"
)

func TestGap(t *testing.T) {
	newUID = func(i int) string { return fmt.Sprintf("uid-%03d", i) }
	t.Cleanup(func() { newUID = nil })
	web := startTarget(t, "fake-web", "/bigbluebutton/api/", fakebbb.New(fakeSalt))
	api := startTarget(t, "fake-api", "/meeting-api/", fakebbb.NewAPI(fakeSalt))
	out := t.TempDir()
	for _, side := range []struct{ name, target, expect string }{
		{"web", web, ""},
		{"api", api, "../../testdata/expectations/fake-api.yaml"},
	} {
		args := []string{"run", "--target", side.target, "--cases", "../../testdata/smoke", "--parallel", "1", "--json", filepath.Join(out, side.name+".json")}
		if side.expect != "" {
			args = append(args, "--expect", side.expect)
		}
		var stdout, stderr bytes.Buffer
		run(args, &stdout, &stderr)
	}
	var stdout, stderr bytes.Buffer
	code := run([]string{"gap", "--results", filepath.Join(out, "web.json"), "--results", filepath.Join(out, "api.json"),
		"--md", filepath.Join(out, "gap.md"), "--html", filepath.Join(out, "gap.html")}, &stdout, &stderr)
	if code != exitOK {
		t.Fatalf("exit %d: %s", code, stderr.String())
	}
	for _, ext := range []string{"md", "html"} {
		data, err := os.ReadFile(filepath.Join(out, "gap."+ext))
		if err != nil {
			t.Fatal(err)
		}
		got := scrub(string(data))
		golden := filepath.Join("testdata", "golden", "gap."+ext)
		if *update {
			if err := os.WriteFile(golden, []byte(got), 0o644); err != nil {
				t.Fatal(err)
			}
			continue
		}
		want, err := os.ReadFile(golden)
		if err != nil {
			t.Fatalf("%v (run go test -update to create it)", err)
		}
		if got != string(want) {
			t.Errorf("%s differs from %s; run go test ./cmd/bbb-conform -update and review the diff", ext, golden)
		}
	}
	md, _ := os.ReadFile(filepath.Join(out, "gap.md"))
	for _, want := range []string{"| fake-web | fake-api |", "[XFAIL](https://example.com/issues/2)", "| `version.smoke.fields` | PASS | XFAIL |"} {
		if !strings.Contains(string(md), want) {
			t.Errorf("the matrix should contain %q", want)
		}
	}
	for _, args := range [][]string{{"gap"}, {"gap", "--results", "missing.json"}, {"gap", "--results", "../../testdata/fixtures/presentations/b.txt"}} {
		if code := run(args, &stdout, &stderr); code != exitUsage {
			t.Errorf("%v: exit %d", args, code)
		}
	}
}
