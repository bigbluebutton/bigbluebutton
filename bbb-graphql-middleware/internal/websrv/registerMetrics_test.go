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
		"GqlQueryRejectedCounter":                common.GqlQueryRejectedCounter,
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
		Help: "Highest number of entries (subscriptions, and queries in flight) held by one of the Websocket connections open at the time of the scrape",
	}, func() float64 { return 0 })
	var alreadyRegistered prometheus.AlreadyRegisteredError
	if err := prometheus.Register(maxGauge); !errors.As(err, &alreadyRegistered) {
		if err == nil {
			prometheus.Unregister(maxGauge)
		}
		t.Errorf("ws_connection_subscriptions_max is not registered (Register returned %v)", err)
	}
}

// The series of the labels whose values are a closed set exist once the metrics are registered,
// before any traffic.
func TestTheClosedLabelSetsExistFromTheStart(t *testing.T) {
	common.RegisterMetrics()
	RegisterConnectionMetrics()
	families, err := prometheus.DefaultGatherer.Gather()
	if err != nil {
		t.Fatal(err)
	}
	exported := map[string]bool{}
	for _, family := range families {
		for _, metric := range family.Metric {
			for _, label := range metric.Label {
				exported[family.GetName()+"/"+label.GetValue()] = true
			}
		}
	}
	want := map[string][]string{
		"auth_hook_request_total":                      {"ok", "unauthorized", "error"},
		"session_vars_hook_request_total":              {"ok", "unauthorized", "error"},
		"gql_subscription_first_data_duration_seconds": {"query", "subscription", "streaming", "subscription_aggregate", "mutation"},
		"gql_hasura_reconnection_total": {"other_request", "hasura_read_error", "hasura_write_error", "invalid_browser_message", "dial_error", "other",
			"role_changed", "lock_user_changed", "assigned_presenter", "assigned_presenter_automatically", "user_joined"},
		"ws_connection_rejected": {"param_missing", "too_many_connections", "check_authorization_error", "meeting_not_found", "user_not_found",
			"connections_limit_exceeded", "closed_before_init", "init_timeout", "other"},
		"gql_query_rejected_total": {"max_query_length", "max_query_nesting", "max_query_depth", "max_query_variables_length",
			"subscriptions_allowed_list", "subscriptions_denied_list", "max_mutation_length"},
	}
	for name, values := range want {
		for _, value := range values {
			if !exported[name+"/"+value] {
				t.Errorf("%s{%s} is not exported", name, value)
			}
		}
	}
}
