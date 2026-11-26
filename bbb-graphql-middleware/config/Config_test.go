package config

import (
	"os"
	"path/filepath"
	"reflect"
	"regexp"
	"slices"
	"strings"
	"testing"
)

// The lists that ship must be disjoint. This is the assertion the startup check exists to make, run
// against the real configuration rather than a fixture, so adding an operation to the wrong list is
// caught here before it is caught by a service that will not start.
func TestShippedSubscriptionListsAreDisjoint(t *testing.T) {
	if err := ValidateSubscriptionLists(); err != nil {
		t.Fatalf("shipped subscription lists are not disjoint: %v", err)
	}
}

func TestValidateSubscriptionListsRejectsOverlap(t *testing.T) {
	// Restored rather than shadowed: the check reads the package-level lists, which is the point of
	// it, so the overlap has to be introduced there.
	original := AllowedSubscriptionsForNotInMeetingUsers
	t.Cleanup(func() { AllowedSubscriptionsForNotInMeetingUsers = original })

	AllowedSubscriptionsForNotInMeetingUsers = append(slices.Clone(original), OpChatMessageStream)

	err := ValidateSubscriptionLists()
	if err == nil {
		t.Fatal("expected an error for an operation in both lists, got nil")
	}

	// The message has to name the offender: the operator reading it has to know which entry to
	// remove, and the check refuses to start the service.
	if !strings.Contains(err.Error(), OpChatMessageStream) {
		t.Errorf("error does not name the offending operation %q: %v", OpChatMessageStream, err)
	}
}

// Every middleware-managed stream is checked, not just the first.
func TestValidateSubscriptionListsChecksEveryManagedStream(t *testing.T) {
	original := AllowedSubscriptionsForNotInMeetingUsers
	t.Cleanup(func() { AllowedSubscriptionsForNotInMeetingUsers = original })

	for _, operationName := range StreamingSubscriptionsManagedByMiddleware {
		AllowedSubscriptionsForNotInMeetingUsers = append(slices.Clone(original), operationName)

		err := ValidateSubscriptionLists()
		if err == nil {
			t.Errorf("%s in the allowlist was not rejected", operationName)

			continue
		}
		if !strings.Contains(err.Error(), operationName) {
			t.Errorf("error for %s does not name it: %v", operationName, err)
		}
	}
}

// Precedence of the configuration sources: environment over the override file over the default
// file. Each case loads the real loader with temporary files, so the singleton and the two paths
// are saved and restored around it.

// envNames are the variables the loader may read. Every case clears all of them first, so a
// value set on the machine running the tests cannot leak into a case.
var envNames = []string{
	"SERVER_HOST", "REDIS_HOST", "REDIS_PORT", "REDIS_PASSWORD", "HASURA_URL",
	"HASURA_BBB_GRAPHQL_ACTIONS_ADAPTER_URL", "AUTH_HOOK_URL", "SESSION_VARS_HOOK_URL",
}

const testDefault = `server:
  listen_host: 127.0.0.1
  listen_port: 8378
redis:
  host: 127.0.0.1
  port: 6379
  password: ""
hasura:
  url: ws://127.0.0.1:8185/v1/graphql
graphql-actions:
  url: http://127.0.0.1:8093
auth_hook:
  url: http://127.0.0.1:8090/auth
session_vars_hook:
  url: http://127.0.0.1:8901/userInfo
log_level: INFO
`

func load(t *testing.T, def, override string, env map[string]string) Config {
	t.Helper()
	dir := t.TempDir()
	defPath := filepath.Join(dir, "config.yml")
	if err := os.WriteFile(defPath, []byte(def), 0o644); err != nil {
		t.Fatal(err)
	}
	overridePath := filepath.Join(dir, "override.yml")
	if override != "" {
		if err := os.WriteFile(overridePath, []byte(override), 0o644); err != nil {
			t.Fatal(err)
		}
	}

	savedDefault, savedOverride, savedInstance := DefaultConfigPath, OverrideConfigPath, instance
	t.Cleanup(func() {
		DefaultConfigPath, OverrideConfigPath, instance = savedDefault, savedOverride, savedInstance
	})
	DefaultConfigPath, OverrideConfigPath = defPath, overridePath

	for _, name := range envNames {
		t.Setenv(name, "")
	}
	for name, value := range env {
		t.Setenv(name, value)
	}

	instance = &Config{}
	instance.loadConfigs()
	return *instance
}

func TestDefaultFileOnly(t *testing.T) {
	c := load(t, testDefault, "", nil)
	if c.Redis.Host != "127.0.0.1" || c.Redis.Port != 6379 || c.Hasura.Url != "ws://127.0.0.1:8185/v1/graphql" {
		t.Errorf("default not loaded: %+v", c.Redis)
	}
}

// Variables the loader reads since #26657: each one wins over the override file, which wins over
// the default; an empty value does not win.
func TestStringVariables(t *testing.T) {
	cases := []struct {
		env, overrideYaml string
		field             func(Config) string
	}{
		{"SERVER_HOST", "server:\n  listen_host: 10.0.0.1\n", func(c Config) string { return c.Server.Host }},
		{"REDIS_HOST", "redis:\n  host: 10.0.0.1\n", func(c Config) string { return c.Redis.Host }},
		{"HASURA_URL", "hasura:\n  url: ws://10.0.0.1/v1/graphql\n", func(c Config) string { return c.Hasura.Url }},
		{"HASURA_BBB_GRAPHQL_ACTIONS_ADAPTER_URL", "graphql-actions:\n  url: http://10.0.0.1:8093\n", func(c Config) string { return c.GraphqlActions.Url }},
		{"AUTH_HOOK_URL", "auth_hook:\n  url: http://10.0.0.1/auth\n", func(c Config) string { return c.AuthHook.Url }},
		{"SESSION_VARS_HOOK_URL", "session_vars_hook:\n  url: http://10.0.0.1/userInfo\n", func(c Config) string { return c.SessionVarsHook.Url }},
	}
	for _, tc := range cases {
		t.Run(tc.env, func(t *testing.T) {
			def := tc.field(load(t, testDefault, "", nil))
			if got := tc.field(load(t, testDefault, tc.overrideYaml, nil)); got == def || !strings.Contains(got, "10.0.0.1") {
				t.Errorf("override file: got %q, want the override value", got)
			}
			if got := tc.field(load(t, testDefault, tc.overrideYaml, map[string]string{tc.env: "from-env"})); got != "from-env" {
				t.Errorf("environment over override: got %q, want from-env", got)
			}
			if got := tc.field(load(t, testDefault, "", map[string]string{tc.env: "from-env"})); got != "from-env" {
				t.Errorf("environment without override: got %q, want from-env", got)
			}
			if got := tc.field(load(t, testDefault, tc.overrideYaml, map[string]string{tc.env: ""})); !strings.Contains(got, "10.0.0.1") {
				t.Errorf("empty variable won: got %q, want the override value", got)
			}
		})
	}
}

func TestRedisPassword(t *testing.T) {
	c := load(t, testDefault, "redis:\n  password: file-secret\n", map[string]string{"REDIS_PASSWORD": "env-secret"})
	if c.Redis.Password != "env-secret" {
		t.Errorf("REDIS_PASSWORD: got %q, want env-secret", c.Redis.Password)
	}
	c = load(t, testDefault, "redis:\n  password: file-secret\n", map[string]string{"REDIS_PASSWORD": ""})
	if c.Redis.Password != "file-secret" {
		t.Errorf("empty REDIS_PASSWORD won: got %q", c.Redis.Password)
	}
}

func TestRedisPort(t *testing.T) {
	override := "redis:\n  port: 6380\n"
	for value, want := range map[string]int32{
		"6390":                6390,
		"":                    6380,
		"abc":                 6380, // not a number: the file value stays
		"tcp://10.0.0.1:6379": 6380, // Kubernetes service link: the file value stays
	} {
		if got := load(t, testDefault, override, map[string]string{"REDIS_PORT": value}).Redis.Port; got != want {
			t.Errorf("REDIS_PORT=%q: got %d, want %d", value, got, want)
		}
	}
}

// Every "or X from the environment" in the shipped config.yml has to be read by the loader.
func TestShippedConfigVariablesAreRead(t *testing.T) {
	data, err := os.ReadFile("config.yml")
	if err != nil {
		t.Fatal(err)
	}
	names := regexp.MustCompile(`or ([A-Z_]+) from the environment`).FindAllStringSubmatch(string(data), -1)
	if len(names) == 0 {
		t.Fatal("no variable documented in config.yml")
	}
	base := load(t, string(data), "", nil)
	for _, m := range names {
		value := "sentinel-value"
		if strings.HasSuffix(m[1], "_PORT") {
			value = "6399"
		}
		if got := load(t, string(data), "", map[string]string{m[1]: value}); reflect.DeepEqual(got, base) {
			t.Errorf("%s is documented in config.yml but changes nothing", m[1])
		}
	}
}
