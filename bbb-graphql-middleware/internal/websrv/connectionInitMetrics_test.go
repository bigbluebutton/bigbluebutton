package websrv

import (
	"errors"
	"testing"

	"bbb-graphql-middleware/internal/common"
	"bbb-graphql-middleware/internal/metricstest"
)

func TestRecordConnectionInitCountsOnlyAcceptedConnections(t *testing.T) {
	accepted := metricstest.Value(common.WsConnectionAcceptedCounter)

	recordConnectionInit(errors.New("error on trying to check authorization"), "meeting_not_found")
	if got := metricstest.Value(common.WsConnectionAcceptedCounter); got != accepted {
		t.Fatalf("a rejected connection was counted as accepted: %v -> %v", accepted, got)
	}

	recordConnectionInit(nil, "")
	if got := metricstest.Value(common.WsConnectionAcceptedCounter); got != accepted+1 {
		t.Fatalf("an accepted connection was not counted: %v -> %v", accepted, got)
	}
}
