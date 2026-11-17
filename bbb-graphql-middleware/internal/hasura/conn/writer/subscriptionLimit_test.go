package writer

import (
	"fmt"
	"testing"

	"bbb-graphql-middleware/internal/common"
	"bbb-graphql-middleware/internal/metricstest"

	"github.com/sirupsen/logrus"
	logrustest "github.com/sirupsen/logrus/hooks/test"
)

func TestSubscriptionTypeOf(t *testing.T) {
	cases := []struct {
		query string
		want  common.QueryType
	}{
		{`subscription getUsers { user { userId } }`, common.Subscription},
		{`subscription getChat { chat_message_public_stream(batch_size: 10, cursor: {initial_value: {createdAt: "x"}}) { createdAt } }`, common.Streaming},
		{`subscription UsersCount { user_aggregate { aggregate { count } } }`, common.SubscriptionAggregate},
	}
	for _, c := range cases {
		if got := subscriptionTypeOf(c.query); got != c.want {
			t.Errorf("subscriptionTypeOf(%q) = %q, want %q", c.query, got, c.want)
		}
	}
}

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
