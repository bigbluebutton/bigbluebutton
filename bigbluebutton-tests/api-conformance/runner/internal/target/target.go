// Package target loads target profiles: where a BBB API implementation is
// and what it can do.
package target

import (
	"bytes"
	"fmt"
	"net/url"
	"os"
	"path/filepath"
	"regexp"
	"strings"

	"gopkg.in/yaml.v3"
)

// Target is one implementation under test.
type Target struct {
	Name string `yaml:"name"`
	// BaseURL is scheme and host, e.g. https://bbb40.test.
	BaseURL string `yaml:"baseUrl"`
	// APIPrefix is the API path, /bigbluebutton/api/ for bbb-web.
	APIPrefix string `yaml:"apiPrefix"`
	// Salt is the shared secret, or SaltEnv names the variable that holds it.
	Salt    string `yaml:"salt"`
	SaltEnv string `yaml:"saltEnv"`
	TLS     TLS    `yaml:"tls"`
	// Capabilities lists what the target supports, e.g. akka or presence.
	Capabilities []string `yaml:"capabilities"`
	// DefaultSign is the algorithm for signed calls; sha256 when empty.
	DefaultSign string         `yaml:"defaultSign"`
	SinkURL     string         `yaml:"sinkUrl"`
	FixtureURL  string         `yaml:"fixtureUrl"`
	Vars        map[string]Var `yaml:"vars"`

	// Dir is the directory of the target file; relative paths resolve there.
	Dir string `yaml:"-"`
}

// TLS configures how the runner trusts the target.
type TLS struct {
	CAFile             string `yaml:"caFile"`
	InsecureSkipVerify bool   `yaml:"insecureSkipVerify"`
}

// Var is a value cases read as ${target.<name>}. Secret values are redacted
// from reports.
type Var struct {
	Value  string `yaml:"value"`
	Env    string `yaml:"env"`
	Secret bool   `yaml:"secret"`
}

var (
	varNameRe = regexp.MustCompile(`^[A-Za-z_][A-Za-z0-9_]*$`)
	algs      = map[string]bool{"sha1": true, "sha256": true, "sha384": true, "sha512": true}
)

// Load reads a target file. Blank fields fall back to the environment
// variables the Playwright suite uses: BBB_URL (https://host/bigbluebutton/)
// and BBB_SECRET.
func Load(path string) (*Target, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}
	t := &Target{}
	dec := yaml.NewDecoder(bytes.NewReader(data))
	dec.KnownFields(true)
	if err := dec.Decode(t); err != nil {
		return nil, fmt.Errorf("%s: %w", path, err)
	}
	t.Dir = filepath.Dir(path)
	if err := t.complete(os.Getenv); err != nil {
		return nil, fmt.Errorf("%s: %w", path, err)
	}
	return t, nil
}

func (t *Target) complete(getenv func(string) string) error {
	if t.Name == "" {
		return fmt.Errorf("name is required")
	}
	if bbbURL := getenv("BBB_URL"); bbbURL != "" && t.BaseURL == "" {
		u, err := url.Parse(bbbURL)
		if err != nil || u.Scheme == "" || u.Host == "" {
			return fmt.Errorf("BBB_URL %q is not an absolute URL", bbbURL)
		}
		t.BaseURL = u.Scheme + "://" + u.Host
		if t.APIPrefix == "" {
			t.APIPrefix = strings.TrimSuffix(u.Path, "/") + "/api/"
		}
	}
	if t.BaseURL == "" {
		return fmt.Errorf("baseUrl is required (or set BBB_URL)")
	}
	u, err := url.Parse(t.BaseURL)
	if err != nil || u.Scheme == "" || u.Host == "" || (u.Path != "" && u.Path != "/") {
		return fmt.Errorf("baseUrl %q must be scheme and host only, e.g. https://bbb.example.com", t.BaseURL)
	}
	t.BaseURL = strings.TrimSuffix(t.BaseURL, "/")
	if t.APIPrefix == "" {
		t.APIPrefix = "/bigbluebutton/api/"
	}
	if !strings.HasPrefix(t.APIPrefix, "/") || !strings.HasSuffix(t.APIPrefix, "/") {
		return fmt.Errorf("apiPrefix %q must start and end with /", t.APIPrefix)
	}
	if t.Salt == "" && t.SaltEnv != "" {
		t.Salt = getenv(t.SaltEnv)
	}
	if t.Salt == "" {
		t.Salt = getenv("BBB_SECRET")
	}
	if t.Salt == "" {
		return fmt.Errorf("no salt: set salt, saltEnv or BBB_SECRET")
	}
	if t.DefaultSign == "" {
		t.DefaultSign = "sha256"
	}
	if !algs[t.DefaultSign] {
		return fmt.Errorf("defaultSign %q must be sha1, sha256, sha384 or sha512", t.DefaultSign)
	}
	for name, v := range t.Vars {
		if !varNameRe.MatchString(name) {
			return fmt.Errorf("vars: bad name %q", name)
		}
		if v.Env != "" {
			v.Value = getenv(v.Env)
			t.Vars[name] = v
		}
	}
	if t.TLS.CAFile != "" && !filepath.IsAbs(t.TLS.CAFile) {
		t.TLS.CAFile = filepath.Join(t.Dir, t.TLS.CAFile)
	}
	return nil
}

// Has reports whether the target declares capability c.
func (t *Target) Has(c string) bool {
	for _, have := range t.Capabilities {
		if have == c {
			return true
		}
	}
	return false
}
