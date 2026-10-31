package target

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func env(m map[string]string) func(string) string { return func(k string) string { return m[k] } }

func TestComplete(t *testing.T) {
	tests := []struct {
		name    string
		in      Target
		env     map[string]string
		want    Target
		wantErr string
	}{
		{
			name: "defaults",
			in:   Target{Name: "web", BaseURL: "https://bbb.test/", Salt: "s"},
			want: Target{Name: "web", BaseURL: "https://bbb.test", APIPrefix: "/bigbluebutton/api/", Salt: "s", DefaultSign: "sha256"},
		},
		{
			name: "Playwright environment",
			in:   Target{Name: "ci"},
			env:  map[string]string{"BBB_URL": "https://bbb-ci.test/bigbluebutton/", "BBB_SECRET": "bbbci"},
			want: Target{Name: "ci", BaseURL: "https://bbb-ci.test", APIPrefix: "/bigbluebutton/api/", Salt: "bbbci", DefaultSign: "sha256"},
		},
		{
			name: "saltEnv wins over BBB_SECRET",
			in:   Target{Name: "api", BaseURL: "https://h", APIPrefix: "/meeting-api/", SaltEnv: "API_SALT"},
			env:  map[string]string{"API_SALT": "a", "BBB_SECRET": "b"},
			want: Target{Name: "api", BaseURL: "https://h", APIPrefix: "/meeting-api/", SaltEnv: "API_SALT", Salt: "a", DefaultSign: "sha256"},
		},
		{name: "no name", in: Target{BaseURL: "https://h", Salt: "s"}, wantErr: "name"},
		{name: "no base", in: Target{Name: "x", Salt: "s"}, wantErr: "baseUrl is required"},
		{name: "path in base", in: Target{Name: "x", BaseURL: "https://h/bigbluebutton", Salt: "s"}, wantErr: "scheme and host only"},
		{name: "no salt", in: Target{Name: "x", BaseURL: "https://h"}, wantErr: "no salt"},
		{name: "bad prefix", in: Target{Name: "x", BaseURL: "https://h", APIPrefix: "api", Salt: "s"}, wantErr: "apiPrefix"},
		{name: "bad sign", in: Target{Name: "x", BaseURL: "https://h", Salt: "s", DefaultSign: "md5"}, wantErr: "defaultSign"},
		{name: "route name", in: Target{Name: "x", BaseURL: "https://h", Salt: "s", Routes: map[string]Route{"Bad_Name": {Path: "/a"}}}, wantErr: "routes: bad name"},
		{name: "route path", in: Target{Name: "x", BaseURL: "https://h", Salt: "s", Routes: map[string]Route{"a": {Path: "a"}}}, wantErr: "must start with /"},
		{name: "route placeholder", in: Target{Name: "x", BaseURL: "https://h", Salt: "s", Routes: map[string]Route{"a": {Path: "/a/{b"}}}, wantErr: "malformed"},
		{name: "route bases", in: Target{Name: "x", BaseURL: "https://h", Salt: "s", Routes: map[string]Route{"a": {Path: "/a", Base: "https://d", BaseEnv: "D"}}}, wantErr: "not both"},
		{name: "route base", in: Target{Name: "x", BaseURL: "https://h", Salt: "s", Routes: map[string]Route{"a": {Path: "/a", Base: "https://d/x"}}}, wantErr: "scheme and host only"},
		{name: "profile command", in: Target{Name: "x", BaseURL: "https://h", Salt: "s", Profiles: map[string]Profile{"p": {}}}, wantErr: "command is required"},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := tt.in
			err := got.complete(env(tt.env))
			if tt.wantErr != "" {
				if err == nil || !strings.Contains(err.Error(), tt.wantErr) {
					t.Fatalf("error = %v, want one mentioning %q", err, tt.wantErr)
				}
				return
			}
			if err != nil {
				t.Fatal(err)
			}
			if got.BaseURL != tt.want.BaseURL || got.APIPrefix != tt.want.APIPrefix || got.Salt != tt.want.Salt || got.DefaultSign != tt.want.DefaultSign {
				t.Errorf("got %+v, want %+v", got, tt.want)
			}
		})
	}
}

func TestLoad(t *testing.T) {
	dir := t.TempDir()
	p := filepath.Join(dir, "web.yaml")
	body := "name: web\nbaseUrl: https://bbb.test\nsalt: s\ntls: {caFile: ca.crt}\ncapabilities: [akka]\nvars:\n  turnSecret: {env: TURN_SECRET_FOR_TEST, secret: true}\n"
	if err := os.WriteFile(p, []byte(body), 0o644); err != nil {
		t.Fatal(err)
	}
	t.Setenv("TURN_SECRET_FOR_TEST", "t0p")
	tg, err := Load(p)
	if err != nil {
		t.Fatal(err)
	}
	if tg.TLS.CAFile != filepath.Join(dir, "ca.crt") {
		t.Errorf("caFile = %q, want it resolved next to the target file", tg.TLS.CAFile)
	}
	if v := tg.Vars["turnSecret"]; v.Value != "t0p" || !v.Secret {
		t.Errorf("turnSecret = %+v", v)
	}
	if !tg.Has("akka") || tg.Has("presence") {
		t.Errorf("Has: capabilities = %v", tg.Capabilities)
	}
	if err := os.WriteFile(p, []byte("name: web\nbaseURL: https://x\n"), 0o644); err != nil {
		t.Fatal(err)
	}
	if _, err := Load(p); err == nil || !strings.Contains(err.Error(), "baseURL") {
		t.Errorf("an unknown key should be rejected, got %v", err)
	}
}

func TestRouteAndFillPath(t *testing.T) {
	tg := Target{Name: "x", BaseURL: "https://h", Salt: "s", Routes: map[string]Route{
		"a": {Path: "/a/{id}"},
		"b": {Path: "/b", BaseEnv: "DIRECT"},
		"c": {Path: "/c", BaseEnv: "UNSET"},
	}}
	if err := tg.complete(env(map[string]string{"DIRECT": "http://direct:8090/"})); err != nil {
		t.Fatal(err)
	}
	if base, path, ok := tg.Route("a"); !ok || base != "https://h" || path != "/a/{id}" {
		t.Errorf("Route(a) = %q %q %v", base, path, ok)
	}
	if base, _, ok := tg.Route("b"); !ok || base != "http://direct:8090" {
		t.Errorf("Route(b) = %q %v", base, ok)
	}
	if _, _, ok := tg.Route("c"); ok {
		t.Error("a route whose baseEnv is unset should be unavailable")
	}
	if _, _, ok := tg.Route("zzz"); ok {
		t.Error("an unmapped route should be unavailable")
	}
	got, err := FillPath("/p/{a}/{b}", map[string]string{"a": "x y", "b": "1/2", "extra": "z"})
	if err != nil || got != "/p/x%20y/1%2F2" {
		t.Errorf("FillPath = %q, %v", got, err)
	}
	if _, err := FillPath("/p/{a}", nil); err == nil || !strings.Contains(err.Error(), "needs pathParams a") {
		t.Errorf("FillPath error = %v", err)
	}
}

// The committed target files must load with the CI environment.
func TestCommittedTargets(t *testing.T) {
	t.Setenv("BBB_URL", "https://bbb-ci.test/bigbluebutton/")
	t.Setenv("BBB_SECRET", "bbbci")
	t.Setenv("BBB_WEB_DIRECT_URL", "")
	web, err := Load("../../../targets/bbb-web.yaml")
	if err != nil {
		t.Fatal(err)
	}
	if web.BaseURL != "https://bbb-ci.test" || web.APIPrefix != "/bigbluebutton/api/" || len(web.Routes) == 0 {
		t.Errorf("bbb-web = %+v", web)
	}
	if _, _, ok := web.Route("connection-authz"); ok {
		t.Error("the internal hooks should be unavailable without BBB_WEB_DIRECT_URL")
	}
	api, err := Load("../../../targets/bbb-api.yaml")
	if err != nil {
		t.Fatal(err)
	}
	if api.BaseURL != "https://bbb-ci.test" || api.APIPrefix != "/meeting-api/" {
		t.Errorf("bbb-api = %+v", api)
	}
}

// A tap gives a target bus, fs and redis; claiming them without one is an
// error, since every such case would fail rather than skip.
func TestTap(t *testing.T) {
	tg := Target{Name: "x", BaseURL: "https://h", Salt: "s", Capabilities: []string{"akka", "fs"}}
	if err := tg.complete(env(map[string]string{"BBB_TAP_URL": "http://h:8099/"})); err != nil {
		t.Fatal(err)
	}
	if tg.TapURL != "http://h:8099" || strings.Join(tg.Capabilities, ",") != "akka,fs,bus,redis" {
		t.Errorf("tap %q, capabilities %v", tg.TapURL, tg.Capabilities)
	}
	tg = Target{Name: "x", BaseURL: "https://h", Salt: "s", TapURL: "http://own:1", Capabilities: []string{"akka"}}
	if err := tg.complete(env(map[string]string{"BBB_TAP_URL": "http://env:2"})); err != nil || tg.TapURL != "http://own:1" {
		t.Errorf("the file's tapUrl should win: %q %v", tg.TapURL, err)
	}
	for _, tt := range []struct {
		in   Target
		want string
	}{
		{Target{Name: "x", BaseURL: "https://h", Salt: "s", Capabilities: []string{"bus"}}, "capability bus needs a tap"},
		{Target{Name: "x", BaseURL: "https://h", Salt: "s", TapURL: "h:8099"}, "must be an http:// URL"},
		{Target{Name: "x", BaseURL: "https://h", Salt: "s", Capabilities: []string{"akka", "presense"}}, `unknown capability "presense" (known: akka, bus,`},
	} {
		if err := tt.in.complete(env(nil)); err == nil || !strings.Contains(err.Error(), tt.want) {
			t.Errorf("%+v: %v", tt.in, err)
		}
	}
}

// A sink gives a target callbacks; claiming them without one is an error.
// The runner reads the sink where the server reaches it, unless told
// otherwise.
func TestSink(t *testing.T) {
	tg := Target{Name: "x", BaseURL: "https://h", Salt: "s", Capabilities: []string{"akka"}}
	err := tg.complete(env(map[string]string{"BBB_SINK_URL": "https://sink.test:8444/", "BBB_SINK_READ_URL": "https://localhost:8444",
		"BBB_FIXTURE_URL": "https://sink.test:8444/fixtures/"}))
	if err != nil {
		t.Fatal(err)
	}
	if tg.SinkURL != "https://sink.test:8444" || tg.SinkReadURL != "https://localhost:8444" || tg.FixtureURL != "https://sink.test:8444/fixtures" ||
		strings.Join(tg.Capabilities, ",") != "akka,callbacks" {
		t.Errorf("from the environment: %+v", tg)
	}
	tg = Target{Name: "x", BaseURL: "https://h", Salt: "s", SinkURL: "https://own:1", FixtureURL: "https://files", Capabilities: []string{"callbacks"}}
	if err := tg.complete(env(map[string]string{"BBB_SINK_URL": "https://env:2", "BBB_FIXTURE_URL": "https://env:3"})); err != nil ||
		tg.SinkURL != "https://own:1" || tg.SinkReadURL != "https://own:1" || tg.FixtureURL != "https://files" ||
		strings.Join(tg.Capabilities, ",") != "callbacks" {
		t.Errorf("the file's URLs should win: %+v %v", tg, err)
	}
	for _, tt := range []struct {
		in   Target
		env  map[string]string
		want string
	}{
		{Target{Name: "x", BaseURL: "https://h", Salt: "s", Capabilities: []string{"callbacks"}}, nil, "capability callbacks needs a sink"},
		{Target{Name: "x", BaseURL: "https://h", Salt: "s", SinkURL: "sink.test:8444"}, nil, "sinkUrl \"sink.test:8444\" must be an http:// or https:// URL"},
		{Target{Name: "x", BaseURL: "https://h", Salt: "s"}, map[string]string{"BBB_FIXTURE_URL": "files"}, "fixtureUrl \"files\" must be"},
		{Target{Name: "x", BaseURL: "https://h", Salt: "s"}, map[string]string{"BBB_SINK_READ_URL": "https://localhost:8444"}, "needs a sinkUrl"},
		{Target{Name: "x", BaseURL: "https://h", Salt: "s", SinkURL: "https://ci.test/sink"}, nil, "sinkUrl \"https://ci.test/sink\" must be scheme and host only"},
		{Target{Name: "x", BaseURL: "https://h", Salt: "s", SinkURL: "https://s", SinkReadURL: "https://r/x"}, nil, "sinkReadUrl \"https://r/x\" must be scheme and host only"},
	} {
		if err := tt.in.complete(env(tt.env)); err == nil || !strings.Contains(err.Error(), tt.want) {
			t.Errorf("%+v %v: %v", tt.in, tt.env, err)
		}
	}
}
