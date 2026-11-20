package config

import (
	"os"
	"path/filepath"
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

// The cap on the operationName label values is read from prometheus_operation_name_limit, which
// the shipped file sets to the default.
func TestThePrometheusOperationNameLimitKeyIsRead(t *testing.T) {
	path := filepath.Join(t.TempDir(), "config.yml")
	if err := os.WriteFile(path, []byte("prometheus_operation_name_limit: 7\n"), 0o600); err != nil {
		t.Fatal(err)
	}
	configured, err := loadConfigFile(path)
	if err != nil {
		t.Fatal(err)
	}
	if configured.PrometheusOperationNameLimit != 7 {
		t.Errorf("prometheus_operation_name_limit: 7 was read as %d", configured.PrometheusOperationNameLimit)
	}

	shipped, err := loadConfigFile("config.yml")
	if err != nil {
		t.Fatal(err)
	}
	if shipped.PrometheusOperationNameLimit != 500 {
		t.Errorf("the shipped config.yml sets %d, want 500", shipped.PrometheusOperationNameLimit)
	}
	if want := "/usr/share/bbb-graphql-middleware/client-operation-names.txt"; shipped.PrometheusClientOperationNamesFile != want {
		t.Errorf("the shipped config.yml sets prometheus_client_operation_names_file %q, want %q, where the package installs the list", shipped.PrometheusClientOperationNamesFile, want)
	}
}
