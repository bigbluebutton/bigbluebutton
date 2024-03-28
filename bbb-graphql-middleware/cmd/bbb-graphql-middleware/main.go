package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"github.com/iMDT/bbb-graphql-middleware/internal/common"
	"github.com/iMDT/bbb-graphql-middleware/internal/msgpatch"
	"github.com/iMDT/bbb-graphql-middleware/internal/websrv"
	log "github.com/sirupsen/logrus"
	"net/http"
	"os"
	"runtime"
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

	go func() {
		for {
			time.Sleep(5 * time.Second)
			jsonOverviewBytes, err := json.Marshal(common.GetActivitiesOverview())
			if err != nil {
				log.Fatalf("Error occurred during marshaling. Error: %s", err.Error())
			}

			log.WithField("data", string(jsonOverviewBytes)).Info("Activities Overview")

			activitiesOverviewSummary := make(map[string]int64)
			activitiesOverviewSummary["activeBla"] = common.GetActivitiesOverview()["bla-Added"] - common.GetActivitiesOverview()["bla-Removed"]
			activitiesOverviewSummary["activeWsConnections"] = common.GetActivitiesOverview()["__WebsocketConnection-Added"] - common.GetActivitiesOverview()["__WebsocketConnection-Removed"]
			activitiesOverviewSummary["activeBrowserHandlers"] = common.GetActivitiesOverview()["__BrowserConnection-Added"] - common.GetActivitiesOverview()["__BrowserConnection-Removed"]
			activitiesOverviewSummary["activeSubscriptions"] = common.GetActivitiesOverview()["_Hasura-subscription-Added"] - common.GetActivitiesOverview()["_Hasura-subscription-Completed"]
			activitiesOverviewSummary["pendingMutations"] = common.GetActivitiesOverview()["_Hasura-mutation-Added"] - common.GetActivitiesOverview()["_Hasura-mutation-Completed"]
			activitiesOverviewSummary["numGoroutine"] = int64(runtime.NumGoroutine())
			jsonOverviewSummaryBytes, _ := json.Marshal(activitiesOverviewSummary)
			log.WithField("data", string(jsonOverviewSummaryBytes)).Info("Activities Overview Summary")
		}
	}()

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
	maxConnPerSecond := 10
	if envMaxConnPerSecond := os.Getenv("BBB_GRAPHQL_MIDDLEWARE_MAX_CONN_PER_SECOND"); envMaxConnPerSecond != "" {
		if envMaxConnPerSecondAsInt, err := strconv.Atoi(envMaxConnPerSecond); err == nil {
			maxConnPerSecond = envMaxConnPerSecondAsInt
		}
	}
	rateLimiter := common.NewCustomRateLimiter(maxConnPerSecond)

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		ctx, cancel := context.WithTimeout(r.Context(), 120*time.Second)
		defer cancel()

		common.ActivitiesOverviewIncIndex("__WebsocketConnection-Added")
		defer common.ActivitiesOverviewIncIndex("__WebsocketConnection-Removed")

		if err := rateLimiter.Wait(ctx); err != nil {
			if !errors.Is(err, context.Canceled) {
				http.Error(w, "Request cancelled or rate limit exceeded", http.StatusTooManyRequests)
			}

			return
		}

		websrv.ConnectionHandler(w, r)
	})

	log.Infof("listening on %v:%v", listenIp, listenPort)
	log.Fatal(http.ListenAndServe(fmt.Sprintf("%v:%v", listenIp, listenPort), nil))

}
