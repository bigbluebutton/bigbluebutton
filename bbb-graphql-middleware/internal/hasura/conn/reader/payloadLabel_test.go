package reader

import (
	"context"
	"fmt"
	"testing"
	"time"

	"bbb-graphql-middleware/internal/common"
	"bbb-graphql-middleware/internal/metricstest"

	"github.com/prometheus/client_golang/prometheus"
	"github.com/sirupsen/logrus"
)

// The payload size of a data message is observed under the capped label of the subscription's
// operationName, never under the name the client sent when that name is not admitted.
func TestPayloadSizeIsObservedUnderTheCappedLabel(t *testing.T) {
	browser := &common.BrowserConnection{
		MeetingId:                  "meeting-payload-label",
		Context:                    context.Background(),
		ActiveSubscriptions:        map[string]common.GraphQlSubscription{},
		FromHasuraToBrowserChannel: common.NewSafeChannelByte(10),
		Logger:                     logrus.NewEntry(logrus.New()),
	}
	browser.ActiveSubscriptions["1"] = common.GraphQlSubscription{Id: "1", Type: common.Subscription, OperationName: "get users"}
	hasura := &common.HasuraConnection{Id: "HC1", BrowserConn: browser, Context: context.Background()}
	observed := func(label string) float64 {
		return metricstest.Value(common.GqlReceivedDataPayloadSize.WithLabelValues(string(common.Subscription), label).(prometheus.Histogram))
	}
	other := observed(common.OtherOperationLabel)

	// The size is observed once per distinct payload: this one is new to the run.
	message := fmt.Sprintf(`{"type":"next","id":"1","payload":{"data":{"user":[{"userId":"%d"}]}}}`, time.Now().UnixNano())
	handleMessageReceivedFromHasura(hasura, []byte(message))

	if got := observed(common.OtherOperationLabel); got != other+1 {
		t.Errorf("gql_received_data_payload_size{operationName=%q}: %v -> %v, want +1", common.OtherOperationLabel, other, got)
	}
	if got := observed("get users"); got != 0 {
		t.Errorf("the name outside the GraphQL grammar became a label: %v", got)
	}
}

// A data message counts under the capped label of the subscription's operationName, never under
// the name the client sent when that name is not admitted.
func TestReceivedDataIsCountedUnderTheCappedLabel(t *testing.T) {
	browser := &common.BrowserConnection{
		MeetingId:                  "meeting-received-label",
		Context:                    context.Background(),
		ActiveSubscriptions:        map[string]common.GraphQlSubscription{},
		FromHasuraToBrowserChannel: common.NewSafeChannelByte(10),
		Logger:                     logrus.NewEntry(logrus.New()),
	}
	browser.ActiveSubscriptions["1"] = common.GraphQlSubscription{Id: "1", Type: common.Subscription, OperationName: "get received"}
	hasura := &common.HasuraConnection{Id: "HC1", BrowserConn: browser, Context: context.Background()}
	received := func(label string) float64 {
		return metricstest.Value(common.GqlReceivedDataCounter.WithLabelValues(string(common.Subscription), label))
	}
	other := received(common.OtherOperationLabel)

	handleMessageReceivedFromHasura(hasura, []byte(fmt.Sprintf(`{"type":"next","id":"1","payload":{"data":{"user":[{"userId":"%d"}]}}}`, time.Now().UnixNano())))

	if got := received(common.OtherOperationLabel); got != other+1 {
		t.Errorf("gql_received_data_total{operationName=%q}: %v -> %v, want +1", common.OtherOperationLabel, other, got)
	}
	if got := received("get received"); got != 0 {
		t.Errorf("the name outside the GraphQL grammar became a label: %v", got)
	}
}
