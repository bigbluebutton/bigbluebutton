package common

import "github.com/prometheus/client_golang/prometheus"

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
	GqlReceivedDataPayloadSize = prometheus.NewHistogramVec(
		prometheus.HistogramOpts{
			Name: "gql_received_data_payload_size",
			Help: "Size of received data payload",
		},
		[]string{"type", "operationName"},
	)
)

func init() {
	prometheus.MustRegister(HttpConnectionGauge)
	prometheus.MustRegister(HttpConnectionCounter)
	prometheus.MustRegister(WsConnectionAcceptedCounter)
	prometheus.MustRegister(WsConnectionRejectedCounter)
	prometheus.MustRegister(GqlSubscribeCounter)
	prometheus.MustRegister(GqlReceivedDataCounter)
	prometheus.MustRegister(GqlReceivedDataPayloadSize)
	prometheus.MustRegister(GqlMutationsCounter)

}
