package main

import (
	"fmt"
	"github.com/iMDT/bbb-graphql-middleware/internal/common"
	"github.com/iMDT/bbb-graphql-middleware/internal/msgpatch"
	"github.com/iMDT/bbb-graphql-middleware/internal/websrv"
	log "github.com/sirupsen/logrus"
	"net/http"
	"os"
	"strconv"
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

	http.HandleFunc("/", websrv.ConnectionHandler)

	log.Infof("listening on %v:%v", listenIp, listenPort)
	log.Fatal(http.ListenAndServe(fmt.Sprintf("%v:%v", listenIp, listenPort), nil))

}
