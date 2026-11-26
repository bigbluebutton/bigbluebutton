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
			Help: "Total number of Graphql subscriptions",
		},
		[]string{"type", "operationName"},
	)
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
	prometheus.MustRegister(GqlReceivedDataCounter)
	prometheus.MustRegister(GqlMutationsCounter)
	prometheus.MustRegister(GqlReceivedDataPayloadSize)
	if AdvancedMetricsEnabled() {
		prometheus.MustRegister(GqlReceivedDataPayloadLength)
	}
	prometheus.MustRegister(ApplicationsLatency)
}
