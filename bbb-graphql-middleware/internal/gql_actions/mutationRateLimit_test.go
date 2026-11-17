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
