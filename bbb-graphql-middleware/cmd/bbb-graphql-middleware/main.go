package main

import (
	"fmt"
	"github.com/iMDT/bbb-graphql-middleware/internal/websrv"
	"github.com/iMDT/bbb-graphql-middleware/internal/websrv/invalidator"
	log "github.com/sirupsen/logrus"
	"net/http"
	"os"
	"strconv"
)

func main() {
	// Configure logger
	log.SetLevel(log.InfoLevel)
	log.SetFormatter(&log.JSONFormatter{})
	log := log.WithField("_routine", "SessionTokenReader")

	// Connection invalidator
	go invalidator.BrowserConnectionInvalidator()

	// Websocket listener
	// set default port
	var listenPort = 8378

	// Check if the environment variable BBB_GRAPHQL_MIDDLEWARE_LISTEN_PORT exists
	envListenPort := os.Getenv("BBB_GRAPHQL_MIDDLEWARE_LISTEN_PORT")
	if envListenPort != "" {
		envListenPortAsInt, err := strconv.Atoi(envListenPort)
		if err == nil {
			listenPort = envListenPortAsInt
		}
	}

	http.HandleFunc("/", websrv.ConnectionHandler)

	log.Infof("listening on port %v", listenPort)
	log.Fatal(http.ListenAndServe(fmt.Sprintf(":%v", listenPort), nil))

}
