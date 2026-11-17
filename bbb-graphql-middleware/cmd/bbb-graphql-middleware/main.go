package main

import (
	"fmt"
	"net/http"

	"bbb-graphql-middleware/config"
	"bbb-graphql-middleware/internal/common"
	"bbb-graphql-middleware/internal/websrv"

	"github.com/prometheus/client_golang/prometheus/promhttp"
	log "github.com/sirupsen/logrus"
	"golang.org/x/time/rate"
)

func main() {
	cfg := config.GetConfig()

	// Configure logger
	if logLevelFromConfig, err := log.ParseLevel(cfg.LogLevel); err == nil {
		log.SetLevel(logLevelFromConfig)
		if logLevelFromConfig > log.InfoLevel {
			log.SetReportCaller(true)
		}
	} else {
		log.SetLevel(log.InfoLevel)
	}
	log.SetFormatter(&log.JSONFormatter{})
	log := log.WithField("_routine", "main")

	// Refuse to start on a configuration that expresses the not-in-meeting rule two ways at once.
	if err := config.ValidateSubscriptionLists(); err != nil {
		log.Fatalf("Invalid subscription configuration: %v", err)
	}

	common.RegisterMetrics()
	common.InitMetricOperationNames()

	common.InitUniqueID()
	log = log.WithField("graphql-middleware-uid", common.GetUniqueID())

	log.Infof("Logger level=%v", log.Logger.Level)

	// Keep the HTTP port closed until Redis is subscribed so clients keep retrying.
	subscriber := websrv.WaitForRedisSubscription()
	go websrv.ListenRedisMessages(subscriber)

	if cfg.Server.JsonPatchDisabled {
		log.Infof("Json Patch Disabled!")
	}

	// Routine to check for idle connections and close them
	go websrv.InvalidateIdleBrowserConnectionsRoutine()

	// Websocket listener

	rateLimiter := rate.NewLimiter(rate.Limit(cfg.Server.MaxConnectionsPerSecond), cfg.Server.MaxConnectionsPerSecond)

	http.HandleFunc("/graphql", websrv.RateLimitedConnectionHandler(rateLimiter, websrv.ConnectionHandler))

	http.HandleFunc("/graphql-reconnection", websrv.ReconnectionHandler)

	// Add Prometheus metrics endpoint
	http.Handle("/metrics", promhttp.Handler())

	log.Infof("listening on %v:%v", cfg.Server.Host, cfg.Server.Port)
	log.Fatal(http.ListenAndServe(fmt.Sprintf("%v:%v", cfg.Server.Host, cfg.Server.Port), nil))
}
