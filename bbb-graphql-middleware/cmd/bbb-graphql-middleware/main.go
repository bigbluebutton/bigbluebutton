package main

import (
	"bbb-graphql-middleware/config"
	"bbb-graphql-middleware/internal/common"
	"bbb-graphql-middleware/internal/websrv"
	"context"
	"errors"
	"fmt"
	"github.com/prometheus/client_golang/prometheus/promhttp"
	log "github.com/sirupsen/logrus"
	"net/http"
	"time"
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

	common.InitUniqueID()
	log = log.WithField("graphql-middleware-uid", common.GetUniqueID())

	log.Infof("Logger level=%v", log.Logger.Level)

	// Listen msgs from akka (for example to invalidate connection)
	go websrv.StartRedisListener()

	if cfg.Server.JsonPatchDisabled {
		log.Infof("Json Patch Disabled!")
	}

	// Websocket listener

	rateLimiter := common.NewCustomRateLimiter(cfg.Server.MaxConnectionsPerSecond)
	http.HandleFunc("/graphql", func(w http.ResponseWriter, r *http.Request) {
		ctx, cancel := context.WithTimeout(r.Context(), 120*time.Second)
		defer cancel()

		common.HttpConnectionGauge.Inc()
		common.HttpConnectionCounter.Inc()
		defer common.HttpConnectionGauge.Dec()

		if err := rateLimiter.Wait(ctx); err != nil {
			if !errors.Is(err, context.Canceled) {
				http.Error(w, "Request cancelled or rate limit exceeded", http.StatusTooManyRequests)
			}

			return
		}

		websrv.ConnectionHandler(w, r)
	})

	// Add Prometheus metrics endpoint
	http.Handle("/metrics", promhttp.Handler())

	log.Infof("listening on %v:%v", cfg.Server.Host, cfg.Server.Port)
	log.Fatal(http.ListenAndServe(fmt.Sprintf("%v:%v", cfg.Server.Host, cfg.Server.Port), nil))
}
