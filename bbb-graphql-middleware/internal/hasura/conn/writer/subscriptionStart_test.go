package writer

import (
	"testing"

	"bbb-graphql-middleware/internal/common"
	"bbb-graphql-middleware/internal/metricstest"
)

func TestRecordSubscriptionStartSkipsRetransmissions(t *testing.T) {
	started := func() float64 {
		return metricstest.Value(common.GqlSubscribeCounter.WithLabelValues(string(common.Subscription), "getUsers"))
	}
	before := started()

	recordSubscriptionStart(common.Subscription, "getUsers", false)
	recordSubscriptionStart(common.Subscription, "getUsers", true) // the same id again: a retransmission

	if got := started(); got != before+1 {
		t.Errorf("gql_subscription_total: %v -> %v, want +1", before, got)
	}
}
