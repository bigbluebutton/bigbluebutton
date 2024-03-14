package main

import (
	"context"
	"fmt"
	"github.com/iMDT/bbb-graphql-middleware/internal/common"
	"github.com/iMDT/bbb-graphql-middleware/internal/msgpatch"
	"github.com/iMDT/bbb-graphql-middleware/internal/websrv"
	log "github.com/sirupsen/logrus"
	"golang.org/x/time/rate"
	"net/http"
	"os"
	"strconv"
	"time"
)

func main() {
	// Configure logger
	if logLevelFromEnvVar, err := log.ParseLevel(os.Getenv("BBB_GRAPHQL_MIDDLEWARE_LOG_LEVEL")); err == nil {
		log.SetLevel(logLevelFromEnvVar)
	} else {
		log.SetLevel(log.InfoLevel)
	}

	log.SetFormatter(&log.JSONFormatter{})
	log := log.WithField("_routine", "main")

	common.InitUniqueID()
	log = log.WithField("graphql-middleware-uid", common.GetUniqueID())

	log.Infof("Logger level=%v", log.Logger.Level)

	//Clear cache from last exec
	msgpatch.ClearAllCaches()

	// Listen msgs from akka (for example to invalidate connection)
	go websrv.StartRedisListener()

	// Websocket listener

	//Define IP to listen
	listenIp := "127.0.0.1"
	if envListenIp := os.Getenv("BBB_GRAPHQL_MIDDLEWARE_LISTEN_IP"); envListenIp != "" {
		listenIp = envListenIp
	}

	// Define port to listen on
	listenPort := 8378
	if envListenPort := os.Getenv("BBB_GRAPHQL_MIDDLEWARE_LISTEN_PORT"); envListenPort != "" {
		if envListenPortAsInt, err := strconv.Atoi(envListenPort); err == nil {
			listenPort = envListenPortAsInt
		}
	}

	//Define new Connections Rate Limit
	rateLimitInMs := 50
	if envRateLimitInMs := os.Getenv("BBB_GRAPHQL_MIDDLEWARE_RATE_LIMIT_IN_MS"); envRateLimitInMs != "" {
		if envRateLimitInMsAsInt, err := strconv.Atoi(envRateLimitInMs); err == nil {
			rateLimitInMs = envRateLimitInMsAsInt
		}
	}
	limiterInterval := rate.NewLimiter(rate.Every(time.Duration(rateLimitInMs)*time.Millisecond), 1)

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		ctx, cancel := context.WithTimeout(context.Background(), 120*time.Second)
		defer cancel()

		if err := limiterInterval.Wait(ctx); err != nil {
			http.Error(w, "Rate limit exceeded", http.StatusTooManyRequests)
			return
		}

		websrv.ConnectionHandler(w, r)
	})

	log.Infof("listening on %v:%v", listenIp, listenPort)
	log.Fatal(http.ListenAndServe(fmt.Sprintf("%v:%v", listenIp, listenPort), nil))

}
