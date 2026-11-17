package websrv

import (
	"errors"
	"testing"

	"bbb-graphql-middleware/internal/common"

	"github.com/prometheus/client_golang/prometheus"
)

func TestMetricsRegisterOnce(t *testing.T) {
	// Registration runs once however many times it is called, so this test also passes with
	// -count=2.
	common.RegisterMetrics()
	common.RegisterMetrics()
	RegisterConnectionMetrics()
	RegisterConnectionMetrics()

	expected := map[string]prometheus.Collector{
		"HttpConnectionGauge":                    common.HttpConnectionGauge,
		"HttpConnectionCounter":                  common.HttpConnectionCounter,
		"WsConnectionAcceptedCounter":            common.WsConnectionAcceptedCounter,
		"WsConnectionRejectedCounter":            common.WsConnectionRejectedCounter,
		"GqlSubscribeCounter":                    common.GqlSubscribeCounter,
		"GqlSubscriptionRetransmittedCounter":    common.GqlSubscriptionRetransmittedCounter,
		"GqlSubscriptionLimitRejectedCounter":    common.GqlSubscriptionLimitRejectedCounter,
		"GqlSubscriptionRemovedCounter":          common.GqlSubscriptionRemovedCounter,
		"WsConnectionSubscriptionsPeak":          common.WsConnectionSubscriptionsPeak,
		"GqlSubscriptionFirstDataDuration":       common.GqlSubscriptionFirstDataDuration,
		"GqlHasuraReconnectionCounter":           common.GqlHasuraReconnectionCounter,
		"GqlReceivedDataCounter":                 common.GqlReceivedDataCounter,
		"GqlMutationsCounter":                    common.GqlMutationsCounter,
		"GqlMutationRateLimitExceededCounter":    common.GqlMutationRateLimitExceededCounter,
		"AuthHookRequestDuration":                common.AuthHookRequestDuration,
		"AuthHookRequestCounter":                 common.AuthHookRequestCounter,
		"SessionVarsHookRequestDuration":         common.SessionVarsHookRequestDuration,
		"SessionVarsHookRequestCounter":          common.SessionVarsHookRequestCounter,
		"HttpConnectionRateLimitWait":            common.HttpConnectionRateLimitWait,
		"HttpConnectionRateLimitExceededCounter": common.HttpConnectionRateLimitExceededCounter,
		"GqlQueryRateLimitWait":                  common.GqlQueryRateLimitWait,
		"GqlQueryRateLimitExceededCounter":       common.GqlQueryRateLimitExceededCounter,
		"GqlReceivedDataPayloadSize":             common.GqlReceivedDataPayloadSize,
		"ApplicationsLatency":                    common.ApplicationsLatency,
	}
	if common.AdvancedMetricsEnabled() {
		expected["GqlReceivedDataPayloadLength"] = common.GqlReceivedDataPayloadLength
	}
	// The registry knows a registered collector; one that was not registered is accepted here,
	// and is taken out again so the default registry stays as the program leaves it.
	for name, collector := range expected {
		err := prometheus.Register(collector)
		var alreadyRegistered prometheus.AlreadyRegisteredError
		if !errors.As(err, &alreadyRegistered) {
			if err == nil {
				prometheus.Unregister(collector)
			}
			t.Errorf("%s is not registered (Register returned %v)", name, err)
		}
	}

	// The gauge computed on collection has no variable of its own: find it by name.
	maxGauge := prometheus.NewGaugeFunc(prometheus.GaugeOpts{
		Name: "ws_connection_subscriptions_max",
		Help: "Highest number of active subscriptions held by a single Websocket connection",
	}, func() float64 { return 0 })
	var alreadyRegistered prometheus.AlreadyRegisteredError
	if err := prometheus.Register(maxGauge); !errors.As(err, &alreadyRegistered) {
		if err == nil {
			prometheus.Unregister(maxGauge)
		}
		t.Errorf("ws_connection_subscriptions_max is not registered (Register returned %v)", err)
	}
}
