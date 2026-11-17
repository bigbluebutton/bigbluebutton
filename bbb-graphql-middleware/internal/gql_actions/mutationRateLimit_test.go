package gql_actions

import (
	"testing"

	"bbb-graphql-middleware/internal/common"
	"bbb-graphql-middleware/internal/metricstest"

	"golang.org/x/time/rate"
)

func TestMutationAllowedCountsRejections(t *testing.T) {
	limiter := rate.NewLimiter(0, 1) // one mutation, no refill
	before := metricstest.Value(common.GqlMutationRateLimitExceededCounter)

	if !mutationAllowed(limiter) {
		t.Fatal("the first mutation was rejected")
	}
	if mutationAllowed(limiter) {
		t.Fatal("the second mutation was allowed")
	}
	if got := metricstest.Value(common.GqlMutationRateLimitExceededCounter); got != before+1 {
		t.Errorf("gql_mutation_rate_limit_exceeded_total: %v -> %v, want +1", before, got)
	}
}

// A mutation over the rate limit, through the client: rejected with an error to the browser, and
// counted.
func TestTheClientCountsTheMutationsOverTheRateLimit(t *testing.T) {
	c := startClient(t, rate.NewLimiter(0, 1)) // one mutation, no refill
	before := metricstest.Value(common.GqlMutationRateLimitExceededCounter)

	if reply := c.mutate(t, "setMuted"); reply != "next" {
		t.Fatalf("the first mutation was answered with %q", reply)
	}
	<-c.browser.FromHasuraToBrowserChannel.ReceiveChannel() // its complete
	if reply := c.mutate(t, "setMuted"); reply != "error" {
		t.Fatalf("the mutation over the limit was answered with %q, want an error", reply)
	}
	if got := metricstest.Value(common.GqlMutationRateLimitExceededCounter); got != before+1 {
		t.Errorf("gql_mutation_rate_limit_exceeded_total: %v -> %v, want +1", before, got)
	}
}
