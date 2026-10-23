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
	"slices"
	"sort"
	"strings"

	"github.com/bigbluebutton/bigbluebutton/bigbluebutton-tests/api-conformance/runner/internal/spec"
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
	DefaultSign string `yaml:"defaultSign"`
	SinkURL     string `yaml:"sinkUrl"`
	FixtureURL  string `yaml:"fixtureUrl"`
	// GraphQLURL is bbb-graphql-middleware's websocket; by default the base
	// URL's host at /graphql, as nginx serves it.
	GraphQLURL string `yaml:"graphqlUrl"`
	// TapURL is the tap running next to the server (bbb-conform tap), or
	// BBB_TAP_URL when blank. It gives the target the bus, fs and redis
	// capabilities.
	TapURL string         `yaml:"tapUrl"`
	Vars   map[string]Var `yaml:"vars"`
	// Routes maps the route names of non-API calls to this target's paths.
	Routes map[string]Route `yaml:"routes"`
	// Profiles are the config profiles cases can ask for, and the commands
	// that switch the target to them. "default" switches back.
	Profiles map[string]Profile `yaml:"profiles"`

	// Dir is the directory of the target file; relative paths resolve there.
	Dir string `yaml:"-"`
}

// TLS configures how the runner trusts the target.
type TLS struct {
	CAFile             string `yaml:"caFile"`
	InsecureSkipVerify bool   `yaml:"insecureSkipVerify"`
}

// Route is where a non-API route lives. Path may hold {name} placeholders,
// filled from a step's pathParams. Base, or the variable BaseEnv names,
// replaces the target's baseUrl, e.g. to reach bbb-web's nginx-internal
// hooks directly.
type Route struct {
	Path    string `yaml:"path"`
	Base    string `yaml:"base"`
	BaseEnv string `yaml:"baseEnv"`

	unavailable bool // BaseEnv names a variable that isn't set
}

// Profile switches the target to one configuration.
type Profile struct {
	Command string `yaml:"command"`
}

// Var is a value cases read as ${target.<name>}. Secret values are redacted
// from reports.
type Var struct {
	Value  string `yaml:"value"`
	Env    string `yaml:"env"`
	Secret bool   `yaml:"secret"`
}

var (
	varNameRe     = regexp.MustCompile(`^[A-Za-z_][A-Za-z0-9_]*$`)
	nameRe        = regexp.MustCompile(`^[a-z][a-z0-9-]*$`)
	placeholderRe = regexp.MustCompile(`\{([A-Za-z_][A-Za-z0-9_]*)\}`)
	algs          = map[string]bool{"sha1": true, "sha256": true, "sha384": true, "sha512": true}
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
	// A misspelt capability would silently skip every case that needs it.
	known := spec.KnownCapabilities()
	for _, c := range t.Capabilities {
		if !slices.Contains(known, c) {
			return fmt.Errorf("unknown capability %q (known: %s)", c, strings.Join(known, ", "))
		}
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
	if t.TapURL == "" {
		t.TapURL = getenv("BBB_TAP_URL")
	}
	t.TapURL = strings.TrimSuffix(t.TapURL, "/")
	if t.TapURL != "" {
		if u, err := url.Parse(t.TapURL); err != nil || (u.Scheme != "http" && u.Scheme != "https") || u.Host == "" {
			return fmt.Errorf("tapUrl %q must be an http:// URL, e.g. http://10.0.0.5:8099", t.TapURL)
		}
		for _, c := range tapCapabilities {
			if !t.Has(c) {
				t.Capabilities = append(t.Capabilities, c)
			}
		}
	} else {
		for _, c := range tapCapabilities {
			if t.Has(c) {
				return fmt.Errorf("capability %s needs a tap: set tapUrl or BBB_TAP_URL", c)
			}
		}
	}
	if t.GraphQLURL == "" {
		t.GraphQLURL = strings.Replace(t.BaseURL, "http", "ws", 1) + "/graphql"
	} else if g, err := url.Parse(t.GraphQLURL); err != nil || (g.Scheme != "ws" && g.Scheme != "wss") || g.Host == "" {
		return fmt.Errorf("graphqlUrl %q must be a ws:// or wss:// URL", t.GraphQLURL)
	}
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
	for name, r := range t.Routes {
		if !nameRe.MatchString(name) {
			return fmt.Errorf("routes: bad name %q (lower-case letters, digits and dashes)", name)
		}
		if !strings.HasPrefix(r.Path, "/") {
			return fmt.Errorf("routes.%s: path %q must start with /", name, r.Path)
		}
		if rest := placeholderRe.ReplaceAllString(r.Path, ""); strings.ContainsAny(rest, "{}") {
			return fmt.Errorf("routes.%s: path %q has a malformed {placeholder}", name, r.Path)
		}
		if r.Base != "" && r.BaseEnv != "" {
			return fmt.Errorf("routes.%s: set base or baseEnv, not both", name)
		}
		if r.BaseEnv != "" {
			r.Base = getenv(r.BaseEnv)
			r.unavailable = r.Base == ""
		}
		if r.Base != "" {
			u, err := url.Parse(r.Base)
			if err != nil || u.Scheme == "" || u.Host == "" || (u.Path != "" && u.Path != "/") {
				return fmt.Errorf("routes.%s: base %q must be scheme and host only", name, r.Base)
			}
			r.Base = strings.TrimSuffix(r.Base, "/")
		}
		t.Routes[name] = r
	}
	for name, p := range t.Profiles {
		if !nameRe.MatchString(name) {
			return fmt.Errorf("profiles: bad name %q (lower-case letters, digits and dashes)", name)
		}
		if strings.TrimSpace(p.Command) == "" {
			return fmt.Errorf("profiles.%s: command is required", name)
		}
	}
	return nil
}

// Route returns the base URL and path template of a route. ok is false when
// the target doesn't map it, or maps it to a base whose variable isn't set.
func (t *Target) Route(name string) (base, path string, ok bool) {
	r, found := t.Routes[name]
	if !found || r.unavailable {
		return "", "", false
	}
	base = r.Base
	if base == "" {
		base = t.BaseURL
	}
	return base, r.Path, true
}

// Bases returns every base URL requests to this target can go to, longest
// first: baseUrl and the route overrides.
func (t *Target) Bases() []string {
	seen := map[string]bool{t.BaseURL: true}
	out := []string{t.BaseURL}
	for _, r := range t.Routes {
		if r.Base != "" && !seen[r.Base] {
			seen[r.Base] = true
			out = append(out, r.Base)
		}
	}
	sort.Slice(out, func(i, j int) bool {
		return len(out[i]) > len(out[j]) || (len(out[i]) == len(out[j]) && out[i] < out[j])
	})
	return out
}

// FillPath replaces each {name} in path with the path-escaped value of
// params[name]. Params the path doesn't use are ignored, since another
// target may map the same route with other placeholders.
func FillPath(path string, params map[string]string) (string, error) {
	var missing []string
	out := placeholderRe.ReplaceAllStringFunc(path, func(m string) string {
		key := m[1 : len(m)-1]
		v, ok := params[key]
		if !ok {
			missing = append(missing, key)
			return m
		}
		return url.PathEscape(v)
	})
	if len(missing) > 0 {
		return "", fmt.Errorf("the route needs pathParams %s", strings.Join(missing, ", "))
	}
	return out, nil
}

// tapCapabilities are what a tap gives a target.
var tapCapabilities = []string{"bus", "fs", "redis"}

// Has reports whether the target declares capability c.
func (t *Target) Has(c string) bool {
	for _, have := range t.Capabilities {
		if have == c {
			return true
		}
	}
	return false
}
