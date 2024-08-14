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
	GqlSubscriptionCounter = prometheus.NewCounterVec(
		prometheus.CounterOpts{
			Name: "gql_subscription_total",
			Help: "Total number of Graphql subscriptions",
		},
		[]string{"operationName"},
	)
	GqlSubscriptionStreamingCounter = prometheus.NewCounterVec(
		prometheus.CounterOpts{
			Name: "gql_subscription_streaming_total",
			Help: "Total number of Graphql subscriptions streaming",
		},
		[]string{"operationName"},
	)
	GqlQueriesCounter = prometheus.NewCounterVec(
		prometheus.CounterOpts{
			Name: "gql_query_total",
			Help: "Total number of Graphql queries",
		},
		[]string{"operationName"},
	)
	GqlMutationsCounter = prometheus.NewCounterVec(
		prometheus.CounterOpts{
			Name: "gql_mutation_total",
			Help: "Total number of Graphql mutations",
		},
		[]string{"operationName"},
	)
)

func init() {
	prometheus.MustRegister(HttpConnectionGauge)
	prometheus.MustRegister(HttpConnectionCounter)
	prometheus.MustRegister(WsConnectionAcceptedCounter)
	prometheus.MustRegister(WsConnectionRejectedCounter)
	prometheus.MustRegister(GqlSubscriptionCounter)
	prometheus.MustRegister(GqlSubscriptionStreamingCounter)
	prometheus.MustRegister(GqlQueriesCounter)
	prometheus.MustRegister(GqlMutationsCounter)

}
