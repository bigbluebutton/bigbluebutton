package gql_actions

import (
	"testing"

	"bbb-graphql-middleware/internal/common"
	"bbb-graphql-middleware/internal/metricstest"

	"golang.org/x/time/rate"
)

// A mutation counts under the capped label of its operationName, never under the name the client
// sent when that name is not admitted.
func TestMutationsAreCountedUnderTheCappedLabel(t *testing.T) {
	c := startClient(t, rate.NewLimiter(rate.Inf, 1))
	mutations := func(label string) float64 {
		return metricstest.Value(common.GqlMutationsCounter.WithLabelValues(label))
	}
	other := mutations(common.OtherOperationLabel)

	if reply := c.mutate(t, "set muted"); reply != "next" {
		t.Fatalf("the mutation was answered with %q", reply)
	}
	if got := mutations(common.OtherOperationLabel); got != other+1 {
		t.Errorf("gql_mutation_total{operationName=%q}: %v -> %v, want +1", common.OtherOperationLabel, other, got)
	}
	if got := mutations("set muted"); got != 0 {
		t.Errorf("the name outside the GraphQL grammar became a label: %v", got)
	}
}
