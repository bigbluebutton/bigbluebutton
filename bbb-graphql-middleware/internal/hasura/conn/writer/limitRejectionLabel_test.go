package writer

import (
	"encoding/json"
	"testing"

	"bbb-graphql-middleware/internal/common"
	"bbb-graphql-middleware/internal/metricstest"
)

// A subscription rejected by the limit counts under the capped label of its operationName, never
// under the name the client sent when that name is not admitted.
func TestALimitRejectionIsCountedUnderTheCappedLabel(t *testing.T) {
	setSubscriptionLimit(t, 1)
	w := startWriter(t, newBrowserConnection(true))
	rejected := func(label string) float64 {
		return metricstest.Value(common.GqlSubscriptionLimitRejectedCounter.WithLabelValues(string(common.Subscription), label))
	}
	other := rejected(common.OtherOperationLabel)

	w.send(subscribeOperation("1", "getUsers"))
	w.expectSent(t)
	w.send(subscribeOperation("2", "get users"))
	w.waitUntil(t, func() bool { return rejected(common.OtherOperationLabel) == other+1 })

	if got := rejected("get users"); got != 0 {
		t.Errorf("the name outside the GraphQL grammar became a label: %v", got)
	}
}

// A subscription rejected by the limit counts under the type of its query.
func TestALimitRejectionIsCountedUnderTheTypeOfTheQuery(t *testing.T) {
	setSubscriptionLimit(t, 1)
	w := startWriter(t, newBrowserConnection(true))
	rejected := func() float64 {
		return metricstest.Value(common.GqlSubscriptionLimitRejectedCounter.WithLabelValues(string(common.Streaming), "getRejectedStream"))
	}
	before := rejected()

	w.send(subscribeOperation("1", "getUsers"))
	w.expectSent(t)
	message, _ := json.Marshal(map[string]interface{}{"id": "2", "type": "subscribe", "payload": map[string]interface{}{
		"operationName": "getRejectedStream",
		"query":         `subscription getRejectedStream { chat_stream(batch_size: 10, cursor: {initial_value: {createdAt: "x"}}) { createdAt } }`,
	}})
	w.send(string(message))
	w.waitUntil(t, func() bool { return rejected() == before+1 })
}
