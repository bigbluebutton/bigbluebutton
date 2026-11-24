package common

import (
	"sync"

	"bbb-graphql-middleware/config"

	"github.com/prometheus/client_golang/prometheus"
)

// AdvancedMetricsEnabled reports whether the optional payload-length metric is collected.
//
// Read through config on each call rather than captured into a package variable: package
// initialisation must not touch the config file, so that importing this package does not require
// an installed config.
func AdvancedMetricsEnabled() bool {
	return config.GetConfig().PrometheusAdvancedMetricsEnabled
}

// Values of the reason label of gql_query_rejected_total: the configuration key of the limit or
// list that refused the operation, or max_query_nesting for the fixed bound on braces and brackets.
const (
	QueryRejectedMaxQueryLength          = "max_query_length"
	QueryRejectedMaxQueryNesting         = "max_query_nesting"
	QueryRejectedMaxQueryDepth           = "max_query_depth"
	QueryRejectedMaxQueryVariablesLength = "max_query_variables_length"
	QueryRejectedSubscriptionsAllowed    = "subscriptions_allowed_list"
	QueryRejectedSubscriptionsDenied     = "subscriptions_denied_list"
	QueryRejectedMaxMutationLength       = "max_mutation_length"
)

// QueryRejectionReasons are the values of the reason label of gql_query_rejected_total.
var QueryRejectionReasons = []string{
	QueryRejectedMaxQueryLength,
	QueryRejectedMaxQueryNesting,
	QueryRejectedMaxQueryDepth,
	QueryRejectedMaxQueryVariablesLength,
	QueryRejectedSubscriptionsAllowed,
	QueryRejectedSubscriptionsDenied,
	QueryRejectedMaxMutationLength,
}

// RecordQueryRejection counts an operation refused by an input check, by the check. The refused
// operation is not stored or forwarded, so it is counted in no start counter.
func RecordQueryRejection(reason string) {
	GqlQueryRejectedCounter.WithLabelValues(reason).Inc()
}

// Values of the result label of the hook request counters.
const (
	HookRequestOk           = "ok"
	HookRequestUnauthorized = "unauthorized"
	HookRequestError        = "error"
)

// TimeBucketsSeconds are the buckets of the middleware's time histograms in seconds; they
// resolve the 150 ms and 333 ms poll intervals of Hasura, and reach the 30 s and 120 s bounds of
// the rate limiter waits.
var TimeBucketsSeconds = []float64{0.01, 0.05, 0.1, 0.15, 0.25, 0.333, 0.5, 1, 2, 5, 10, 30, 60, 120}

var (
	HttpConnectionGauge = prometheus.NewGauge(prometheus.GaugeOpts{
		Name: "http_connection_active",
		Help: "Number of active HTTP connections",
	})
	HttpConnectionCounter = prometheus.NewCounter(prometheus.CounterOpts{
		Name: "http_connection_total",
		Help: "Total number of HTTP connections",
	})
	WsConnectionAcceptedCounter = prometheus.NewCounter(prometheus.CounterOpts{
		Name: "ws_connection_accepted",
		Help: "Total number of Websocket connections accepted",
	})
	WsConnectionRejectedCounter = prometheus.NewCounterVec(
		prometheus.CounterOpts{
			Name: "ws_connection_rejected",
			Help: "Total number of Websocket connections rejected, by reason: the error message id of the refusal, closed_before_init, init_timeout or other",
		},
		[]string{"reason"},
	)
	GqlSubscribeCounter = prometheus.NewCounterVec(
		prometheus.CounterOpts{
			Name: "gql_subscription_total",
			Help: "Total number of Graphql subscriptions started by clients",
		},
		[]string{"type", "operationName"},
	)
	GqlSubscriptionRetransmittedCounter = prometheus.NewCounterVec(
		prometheus.CounterOpts{
			Name: "gql_subscription_retransmitted_total",
			Help: "Total number of Graphql subscriptions queued to be resent to Hasura after a reconnection",
		},
		[]string{"type", "operationName"},
	)
	GqlQueryRejectedCounter = prometheus.NewCounterVec(
		prometheus.CounterOpts{
			Name: "gql_query_rejected_total",
			Help: "Total number of operations refused by a configured limit or list, or by the fixed nesting bound, before they reach Hasura or bbb-graphql-actions, by reason: max_query_length, max_query_nesting, max_query_depth, max_query_variables_length, subscriptions_allowed_list, subscriptions_denied_list or max_mutation_length. A refused operation is counted in neither gql_subscription_total nor gql_mutation_total",
		},
		[]string{"reason"},
	)
	GqlSubscriptionLimitRejectedCounter = prometheus.NewCounterVec(
		prometheus.CounterOpts{
			Name: "gql_subscription_limit_rejected_total",
			Help: "Total number of Graphql subscriptions rejected by the per-connection limit",
		},
		[]string{"type", "operationName"},
	)
	AuthHookRequestDuration = prometheus.NewHistogram(prometheus.HistogramOpts{
		Name:    "auth_hook_request_duration_seconds",
		Help:    "Duration of each authorization request to bbb-web, in seconds",
		Buckets: TimeBucketsSeconds,
	})
	AuthHookRequestCounter = prometheus.NewCounterVec(
		prometheus.CounterOpts{
			Name: "auth_hook_request_total",
			Help: "Total number of authorization requests to bbb-web",
		},
		[]string{"result"},
	)
	SessionVarsHookRequestDuration = prometheus.NewHistogram(prometheus.HistogramOpts{
		Name:    "session_vars_hook_request_duration_seconds",
		Help:    "Duration of each session variables request to akka-apps (/userInfo), in seconds",
		Buckets: TimeBucketsSeconds,
	})
	SessionVarsHookRequestCounter = prometheus.NewCounterVec(
		prometheus.CounterOpts{
			Name: "session_vars_hook_request_total",
			Help: "Total number of session variables requests to akka-apps (/userInfo)",
		},
		[]string{"result"},
	)
	HttpConnectionRateLimitWait = prometheus.NewHistogram(prometheus.HistogramOpts{
		Name:    "http_connection_rate_limit_wait_seconds",
		Help:    "Time a new connection waited in the server connection rate limiter, in seconds",
		Buckets: TimeBucketsSeconds,
	})
	HttpConnectionRateLimitExceededCounter = prometheus.NewCounter(prometheus.CounterOpts{
		Name: "http_connection_rate_limit_exceeded_total",
		Help: "Total number of connections that timed out in the rate limiter",
	})
	GqlQueryRateLimitWait = prometheus.NewHistogram(prometheus.HistogramOpts{
		Name:    "gql_query_rate_limit_wait_seconds",
		Help:    "Time a subscribe message waited in the per-connection query rate limiter, in seconds",
		Buckets: TimeBucketsSeconds,
	})
	GqlQueryRateLimitExceededCounter = prometheus.NewCounter(prometheus.CounterOpts{
		Name: "gql_query_rate_limit_exceeded_total",
		Help: "Total number of subscribe messages that timed out in the rate limiter",
	})
	GqlSubscriptionRemovedCounter = prometheus.NewCounterVec(
		prometheus.CounterOpts{
			Name: "gql_subscription_removed_total",
			Help: "Total number of Graphql subscriptions removed, by reason",
		},
		[]string{"type", "operationName", "reason"},
	)
	GqlHasuraReconnectionCounter = prometheus.NewCounterVec(
		prometheus.CounterOpts{
			Name: "gql_hasura_reconnection_total",
			Help: "Total number of attempts of the middleware to connect to Hasura again, one per dial, by why the previous connection or attempt ended",
		},
		[]string{"reason"},
	)
	GqlSubscriptionFirstDataDuration = prometheus.NewHistogramVec(
		prometheus.HistogramOpts{
			Name:    "gql_subscription_first_data_duration_seconds",
			Help:    "Time from forwarding a subscription to Hasura until its first data message, in seconds",
			Buckets: TimeBucketsSeconds,
		},
		[]string{"type"},
	)
	WsConnectionSubscriptionsPeak = prometheus.NewHistogram(prometheus.HistogramOpts{
		Name: "ws_connection_subscriptions_peak",
		Help: "Highest number of active subscriptions a Websocket connection held, observed when it closes",
		// Past 150, the default max_connection_concurrent_subscriptions: the limit can be raised, and
		// the peak can pass it, since it never rejects a resend or a query.
		Buckets: []float64{10, 20, 30, 40, 50, 75, 100, 125, 150, 175, 200, 250, 300, 500},
	})
	GqlMutationRateLimitExceededCounter = prometheus.NewCounter(prometheus.CounterOpts{
		Name: "gql_mutation_rate_limit_exceeded_total",
		Help: "Total number of mutations rejected by the mutation rate limiter",
	})
	GqlMutationsCounter = prometheus.NewCounterVec(
		prometheus.CounterOpts{
			Name: "gql_mutation_total",
			Help: "Total number of Graphql mutations",
		},
		[]string{"operationName"},
	)
	GqlReceivedDataCounter = prometheus.NewCounterVec(
		prometheus.CounterOpts{
			Name: "gql_received_data_total",
			Help: "Frequency of updates of a given data",
		},
		[]string{"type", "operationName"},
	)
	GqlReceivedDataPayloadLength = prometheus.NewHistogramVec(
		prometheus.HistogramOpts{
			Name: "gql_received_data_payload_length",
			Help: "Length (number of positions) of received data payload",
			Buckets: []float64{
				1,
				10,
				50,
				100,
				300,
				600,
			},
		},
		[]string{"type", "operationName"},
	)
	GqlReceivedDataPayloadSize = prometheus.NewHistogramVec(
		prometheus.HistogramOpts{
			Name: "gql_received_data_payload_size",
			Help: "Size (in bytes) of received data payload",
			Buckets: []float64{
				200,
				600,
				1200,
				5000,
				10000,
				30000,
			},
		},
		[]string{"type", "operationName"},
	)
	ApplicationsLatency = prometheus.NewHistogramVec(
		prometheus.HistogramOpts{
			Name: "bbb_application_reach_latency_milliseconds",
			Help: "Time from previous stage until message arrives at the application",
			Buckets: []float64{
				50,
				100,
				500,
				1000,
				2000,
				4000,
				8000,
			},
		},
		[]string{"application"},
	)
)

var registerMetricsOnce sync.Once

// RegisterMetrics registers the collectors with the default Prometheus registry, once however
// many times it is called (main calls it once; tests may call it again).
//
// It is not an init() because the advanced-metrics decision below reads the config, and package
// initialisation must stay free of file I/O.
func RegisterMetrics() {
	registerMetricsOnce.Do(registerMetrics)
}

func registerMetrics() {
	prometheus.MustRegister(HttpConnectionGauge)
	prometheus.MustRegister(HttpConnectionCounter)
	prometheus.MustRegister(WsConnectionAcceptedCounter)
	prometheus.MustRegister(WsConnectionRejectedCounter)
	prometheus.MustRegister(GqlSubscribeCounter)
	prometheus.MustRegister(GqlSubscriptionRetransmittedCounter)
	prometheus.MustRegister(GqlSubscriptionLimitRejectedCounter)
	prometheus.MustRegister(GqlQueryRejectedCounter)
	prometheus.MustRegister(GqlSubscriptionRemovedCounter)
	prometheus.MustRegister(WsConnectionSubscriptionsPeak)
	prometheus.MustRegister(GqlSubscriptionFirstDataDuration)
	prometheus.MustRegister(GqlHasuraReconnectionCounter)
	prometheus.MustRegister(GqlReceivedDataCounter)
	prometheus.MustRegister(GqlMutationsCounter)
	prometheus.MustRegister(GqlMutationRateLimitExceededCounter)
	prometheus.MustRegister(AuthHookRequestDuration)
	prometheus.MustRegister(AuthHookRequestCounter)
	prometheus.MustRegister(SessionVarsHookRequestDuration)
	prometheus.MustRegister(SessionVarsHookRequestCounter)
	prometheus.MustRegister(HttpConnectionRateLimitWait)
	prometheus.MustRegister(HttpConnectionRateLimitExceededCounter)
	prometheus.MustRegister(GqlQueryRateLimitWait)
	prometheus.MustRegister(GqlQueryRateLimitExceededCounter)
	prometheus.MustRegister(GqlReceivedDataPayloadSize)
	if AdvancedMetricsEnabled() {
		prometheus.MustRegister(GqlReceivedDataPayloadLength)
	}
	prometheus.MustRegister(ApplicationsLatency)
	createClosedLabelSeries()
}

// createClosedLabelSeries creates, at zero, the series of the labels whose values are a closed
// set, so they exist from the start and rate() and increase() see the first event after it. The
// series that carry an operationName label are left to appear with the traffic.
func createClosedLabelSeries() {
	for _, result := range []string{HookRequestOk, HookRequestUnauthorized, HookRequestError} {
		AuthHookRequestCounter.WithLabelValues(result)
		SessionVarsHookRequestCounter.WithLabelValues(result)
	}
	for _, queryType := range []QueryType{Query, Subscription, Streaming, SubscriptionAggregate, Mutation} {
		GqlSubscriptionFirstDataDuration.WithLabelValues(string(queryType))
	}
	for _, reason := range reconnectionReasons() {
		GqlHasuraReconnectionCounter.WithLabelValues(reason)
	}
	for _, reason := range QueryRejectionReasons {
		GqlQueryRejectedCounter.WithLabelValues(reason)
	}
}
