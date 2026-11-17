package common

import (
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

// Values of the result label of the hook request counters.
const (
	HookRequestOk           = "ok"
	HookRequestUnauthorized = "unauthorized"
	HookRequestError        = "error"
)

// TimeBucketsSeconds are the buckets of the middleware's time histograms in seconds; they
// resolve the 150 ms and 333 ms poll intervals of Hasura.
var TimeBucketsSeconds = []float64{0.01, 0.05, 0.1, 0.15, 0.25, 0.333, 0.5, 1, 2, 5, 10}

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
			Help: "Total number of Websocket connections rejected",
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

// RegisterMetrics registers the collectors with the default Prometheus registry.
//
// Called once from main. It is not an init() because the advanced-metrics decision below reads
// the config, and package initialisation must stay free of file I/O.
func RegisterMetrics() {
	prometheus.MustRegister(HttpConnectionGauge)
	prometheus.MustRegister(HttpConnectionCounter)
	prometheus.MustRegister(WsConnectionAcceptedCounter)
	prometheus.MustRegister(WsConnectionRejectedCounter)
	prometheus.MustRegister(GqlSubscribeCounter)
	prometheus.MustRegister(GqlSubscriptionRetransmittedCounter)
	prometheus.MustRegister(GqlSubscriptionLimitRejectedCounter)
	prometheus.MustRegister(GqlSubscriptionRemovedCounter)
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
}
