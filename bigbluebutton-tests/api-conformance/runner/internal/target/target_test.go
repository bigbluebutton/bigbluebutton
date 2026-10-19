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
