package writer

import (
	"fmt"
	"strings"
	"testing"

	"bbb-graphql-middleware/internal/common"
	"bbb-graphql-middleware/internal/metricstest"
	"bbb-graphql-middleware/internal/subscriptionlimit"

	"github.com/sirupsen/logrus"
	logrustest "github.com/sirupsen/logrus/hooks/test"
)

func TestRecordSubscriptionLimitRejection(t *testing.T) {
	rejected := func() float64 {
		return metricstest.Value(common.GqlSubscriptionLimitRejectedCounter.WithLabelValues(string(common.Streaming), "getChat"))
	}
	before := rejected()
	recordSubscriptionLimitRejection(common.Streaming, "getChat")
	if got := rejected(); got != before+1 {
		t.Errorf("gql_subscription_limit_rejected_total: %v -> %v, want +1", before, got)
	}
}

func TestLogOnTwoThirdsOfLimitOnce(t *testing.T) {
	logger, hook := logrustest.NewNullLogger()
	browser := &common.BrowserConnection{
		ActiveSubscriptions: map[string]common.GraphQlSubscription{},
		Logger:              logrus.NewEntry(logger),
	}
	add := func(n int) {
		for i := len(browser.ActiveSubscriptions); i < n; i++ {
			id := fmt.Sprintf("%d", i)
			browser.ActiveSubscriptions[id] = common.GraphQlSubscription{Id: id, OperationName: "getUsers"}
		}
	}

	add(99)
	logOnTwoThirdsOfLimit(browser, 150)
	if len(hook.AllEntries()) != 0 {
		t.Fatalf("logged below two thirds of the limit: %v", hook.AllEntries())
	}
	add(100)
	logOnTwoThirdsOfLimit(browser, 150)
	add(101)
	logOnTwoThirdsOfLimit(browser, 150)
	entries := hook.AllEntries()
	if len(entries) != 1 || entries[0].Message != "Concurrent subscription count reached two thirds of the limit" {
		t.Fatalf("want one two-thirds log line, got %v", entries)
	}
	if got := entries[0].Data["activeSubscriptions"]; got != 100 {
		t.Errorf("activeSubscriptions field = %v, want 100", got)
	}
}

// The two warnings of the limit show the names cut, and keep the counts.
func TestTheLimitWarningsCutLongNames(t *testing.T) {
	long := strings.Repeat("n", 1000) // under max_query_length, over the bound of a name
	cut := strings.Repeat("n", subscriptionlimit.MaxNameBytes) + "..."

	logger, hook := logrustest.NewNullLogger()
	browser := newBrowserConnection(true)
	browser.Logger = logrus.NewEntry(logger)
	browser.ActiveSubscriptions["1"] = common.GraphQlSubscription{Id: "1", OperationName: long, Type: common.Subscription}
	browser.ActiveSubscriptions["2"] = common.GraphQlSubscription{Id: "2", OperationName: long, Type: common.Subscription}
	setSubscriptionLimit(t, 2)
	w := startWriter(t, browser)

	w.send(refusalSubscribe("3", long+"x", "subscription "+long+"x { user { userId } }", nil))
	w.waitUntil(t, func() bool {
		for _, entry := range hook.AllEntries() {
			if entry.Message == "Concurrent subscription limit reached" {
				return true
			}
		}
		return false
	})
	for _, entry := range hook.AllEntries() {
		if entry.Message != "Concurrent subscription limit reached" {
			continue
		}
		if got := entry.Data["rejectedOperation"]; got != cut {
			t.Errorf("rejectedOperation = %.200v, want the name cut", got)
		}
		if got := entry.Data["activeSubscriptions"]; got != 2 {
			t.Errorf("activeSubscriptions = %v, want 2", got)
		}
		if got := entry.Data["activeSubscriptionsByOperation"]; got != cut+"=2" {
			t.Errorf("activeSubscriptionsByOperation = %.200v, want the name cut with its count", got)
		}
	}

	twoThirds, twoThirdsHook := logrustest.NewNullLogger()
	other := &common.BrowserConnection{ActiveSubscriptions: map[string]common.GraphQlSubscription{}, Logger: logrus.NewEntry(twoThirds)}
	for i := 0; i < 3; i++ {
		other.ActiveSubscriptions[fmt.Sprint(i)] = common.GraphQlSubscription{OperationName: long}
	}
	logOnTwoThirdsOfLimit(other, 3)
	entries := twoThirdsHook.AllEntries()
	if len(entries) != 1 || entries[0].Data["activeSubscriptionsByOperation"] != cut+"=3" || entries[0].Data["activeSubscriptions"] != 3 {
		t.Errorf("the two-thirds warning: %v", entries)
	}
}
