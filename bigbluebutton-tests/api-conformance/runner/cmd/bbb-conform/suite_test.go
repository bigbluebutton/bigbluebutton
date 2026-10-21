package main

import (
	"bytes"
	"os"
	"path/filepath"
	"testing"

	"gopkg.in/yaml.v3"

	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/spec"
)

// The suite's own cases must load, have a current recording each, and ask
// only for profiles the bbb-web target lists: a case whose profile isn't
// listed is skipped, so it would never be recorded. CI sets
// BBB_CONFORM_SUITE=1, so that a moved cases directory fails instead of
// skipping.
func TestSuiteCases(t *testing.T) {
	root := filepath.Join("..", "..", "..")
	cases := filepath.Join(root, "cases")
	if _, err := os.Stat(cases); err != nil {
		if os.Getenv("BBB_CONFORM_SUITE") == "1" {
			t.Fatalf("BBB_CONFORM_SUITE is set, but %s is missing: %v", cases, err)
		}
		t.Skip("no cases directory")
	}
	var stdout, stderr bytes.Buffer
	if code := run([]string{"validate", "--cases", cases, "--golden", filepath.Join(root, "golden", "bbb-web")}, &stdout, &stderr); code != exitOK {
		t.Fatalf("validate: exit %d\n%s%s", code, stdout.String(), stderr.String())
	}

	data, err := os.ReadFile(filepath.Join(root, "targets", "bbb-web.yaml"))
	if err != nil {
		t.Fatal(err)
	}
	var tg struct {
		Profiles map[string]any `yaml:"profiles"`
	}
	if err := yaml.Unmarshal(data, &tg); err != nil {
		t.Fatal(err)
	}
	res, err := spec.LoadDir(cases, spec.Options{FixturesDir: filepath.Join(root, "fixtures")})
	if err != nil {
		t.Fatal(err)
	}
	for _, c := range res.Cases {
		if _, ok := tg.Profiles[c.Profile]; c.Profile != "" && !ok {
			t.Errorf("%s asks for profile %q, which targets/bbb-web.yaml doesn't list", c.ID, c.Profile)
		}
	}
	if _, ok := tg.Profiles["default"]; len(tg.Profiles) > 0 && !ok {
		t.Error("targets/bbb-web.yaml lists profiles but no default, so nothing restores the server")
	}
}
