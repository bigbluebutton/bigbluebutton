package common

import (
	"fmt"
	"os"
	"path/filepath"
	"slices"
	"strings"
	"testing"

	"bbb-graphql-middleware/config"
)

func TestMetricOperationName(t *testing.T) {
	names := newOperationNameLabels(3, 10)

	cases := []struct{ in, want string }{
		{"", UnnamedOperationLabel},
		{"getUsers", "getUsers"},
		{strings.Repeat("a", 11), OtherOperationLabel},
		{"getChat", "getChat"},
		{"getUsers", "getUsers"},
		{"getPolls", "getPolls"},
		{"getTimer", OtherOperationLabel}, // fourth distinct name, past the cap of 3
		{"getChat", "getChat"},            // admitted names stay admitted
	}
	for _, c := range cases {
		if got := names.label(c.in); got != c.want {
			t.Errorf("label(%q) = %q, want %q", c.in, got, c.want)
		}
	}
}

func TestMetricOperationNameDefaults(t *testing.T) {
	if maxOperationNameLabelBytes != 128 {
		t.Fatalf("the longest name admitted is %d bytes, want 128", maxOperationNameLabelBytes)
	}
	// The label of every metric goes through the set built from the repository's config.yml.
	MetricOperationName("getUsers")
	if metricOperationNames.maxNames != 500 {
		t.Errorf("the cap read from config.yml is %d names, want 500", metricOperationNames.maxNames)
	}

	names := newOperationNameLabels(metricOperationNames.maxNames, maxOperationNameLabelBytes)
	for i := 0; i < 500; i++ {
		names.label(fmt.Sprintf("op%d", i))
	}
	if got := names.label("op500"); got != OtherOperationLabel {
		t.Errorf("the 501st distinct name got %q, want %q", got, OtherOperationLabel)
	}
	if got := names.label(strings.Repeat("a", 129)); got != OtherOperationLabel {
		t.Errorf("a 129-character name got %q, want %q", got, OtherOperationLabel)
	}
	if got := names.label("op0"); got != "op0" {
		t.Errorf("an admitted name got %q, want %q", got, "op0")
	}
}

func TestTheOperationNameCapFollowsTheConfiguration(t *testing.T) {
	// A missing prometheus_operation_name_limit reads as 0.
	for _, c := range []struct{ configured, want int }{{0, 500}, {-1, 500}, {5, 5}, {10000, 10000}} {
		if got := operationNameLimit(c.configured); got != c.want {
			t.Errorf("operationNameLimit(%d) = %d, want %d", c.configured, got, c.want)
		}
	}

	lower := newOperationNameLabels(operationNameLimit(5), maxOperationNameLabelBytes)
	for i := 0; i < 5; i++ {
		lower.label(fmt.Sprintf("op%d", i))
	}
	if got := lower.label("op5"); got != OtherOperationLabel {
		t.Errorf("with a cap of 5, the sixth distinct name got %q, want %q", got, OtherOperationLabel)
	}

	higher := newOperationNameLabels(operationNameLimit(10000), maxOperationNameLabelBytes)
	for i := 0; i < 10000; i++ {
		if got := higher.label(fmt.Sprintf("op%d", i)); got != fmt.Sprintf("op%d", i) {
			t.Fatalf("with a cap of 10000, name %d got %q", i+1, got)
		}
	}
	if got := higher.label("op10000"); got != OtherOperationLabel {
		t.Errorf("with a cap of 10000, the 10001st distinct name got %q, want %q", got, OtherOperationLabel)
	}
}

func TestMetricOperationNameOutsideTheGrammar(t *testing.T) {
	names := newOperationNameLabels(2, 128)

	// The name comes from the operationName field of the client's JSON, which is free text.
	for _, name := range []string{"(unnamed)", "(other)", "1getUsers", "get users", "get-users", "getUsers\n", "getUsérs"} {
		if got := names.label(name); got != OtherOperationLabel {
			t.Errorf("label(%q) = %q, want %q", name, got, OtherOperationLabel)
		}
	}
	// None of them took one of the two slots.
	if got := names.label("getUsers"); got != "getUsers" {
		t.Errorf("label(getUsers) = %q, want getUsers", got)
	}
	if got := names.label("_getChat2"); got != "_getChat2" {
		t.Errorf("label(_getChat2) = %q, want _getChat2", got)
	}
}

// The cap is the one prometheus_operation_name_limit sets.
func TestTheCapIsReadFromTheConfiguration(t *testing.T) {
	saved := config.GetConfig().PrometheusOperationNameLimit
	t.Cleanup(func() { config.GetConfig().PrometheusOperationNameLimit = saved })
	config.GetConfig().PrometheusOperationNameLimit = 2

	labels := configuredOperationNameLabels()
	for _, name := range []string{"first", "second"} {
		if got := labels.label(name); got != name {
			t.Errorf("label(%q) = %q, want the name, within the configured cap of 2", name, got)
		}
	}
	if got := labels.label("third"); got != OtherOperationLabel {
		t.Errorf("label(\"third\") = %q, want %q past the configured cap of 2", got, OtherOperationLabel)
	}
}

// A reserved name, one of the BigBlueButton client, is labeled by name and takes no place under
// the cap, even once the cap is full.
func TestReservedNamesAreLabeledOutsideTheCap(t *testing.T) {
	labels := newOperationNameLabels(1, 128)
	labels.reserve([]string{"getUsers", "Patched_getUsers"})

	for _, name := range []string{"getUsers", "pluginQuery", "Patched_getUsers", "otherPluginQuery", "getUsers"} {
		want := name
		if name == "otherPluginQuery" {
			want = OtherOperationLabel // the one place under the cap went to pluginQuery
		}
		if got := labels.label(name); got != want {
			t.Errorf("label(%q) = %q, want %q", name, got, want)
		}
	}
}

func TestReadClientOperationNames(t *testing.T) {
	path := filepath.Join(t.TempDir(), "names.txt")
	content := "# a comment\n\ngetUsers\n  Patched_getUsers  \nget users\n" + strings.Repeat("a", 129) + "\n"
	if err := os.WriteFile(path, []byte(content), 0o600); err != nil {
		t.Fatal(err)
	}
	if got := readClientOperationNames(path); !slices.Equal(got, []string{"getUsers", "Patched_getUsers"}) {
		t.Errorf("read %q, want the two GraphQL names, without the comment, the blank line and the two invalid lines", got)
	}
	if got := readClientOperationNames(filepath.Join(t.TempDir(), "missing.txt")); got != nil {
		t.Errorf("a missing file read as %q, want no names", got)
	}
	if got := readClientOperationNames(""); got != nil {
		t.Errorf("no file read as %q, want no names", got)
	}
}

// The names reserved are those of prometheus_client_operation_names_file.
func TestTheReservedNamesAreReadFromTheConfiguration(t *testing.T) {
	path := filepath.Join(t.TempDir(), "names.txt")
	if err := os.WriteFile(path, []byte("getMeeting\n"), 0o600); err != nil {
		t.Fatal(err)
	}
	savedLimit, savedFile := config.GetConfig().PrometheusOperationNameLimit, config.GetConfig().PrometheusClientOperationNamesFile
	t.Cleanup(func() {
		config.GetConfig().PrometheusOperationNameLimit = savedLimit
		config.GetConfig().PrometheusClientOperationNamesFile = savedFile
	})
	config.GetConfig().PrometheusOperationNameLimit = 1
	config.GetConfig().PrometheusClientOperationNamesFile = path

	labels := configuredOperationNameLabels()
	labels.label("pluginQuery") // fills the cap
	if got := labels.label("getMeeting"); got != "getMeeting" {
		t.Errorf("label(\"getMeeting\") = %q, want the reserved name past a full cap", got)
	}
}

// The list the package installs: every line that is not a comment is a GraphQL name, once.
func TestTheClientOperationNamesFileIsWellFormed(t *testing.T) {
	path := filepath.Join("..", "..", "config", "client-operation-names.txt")
	data, err := os.ReadFile(path)
	if err != nil {
		t.Fatal(err)
	}
	lines := 0
	for _, line := range strings.Split(string(data), "\n") {
		if line = strings.TrimSpace(line); line != "" && !strings.HasPrefix(line, "#") {
			lines++
		}
	}
	names := readClientOperationNames(path)
	if len(names) == 0 || len(names) != lines {
		t.Fatalf("%d names read of %d lines", len(names), lines)
	}
	seen := map[string]bool{}
	for _, name := range names {
		if seen[name] {
			t.Errorf("%q is listed twice", name)
		}
		seen[name] = true
	}
}
