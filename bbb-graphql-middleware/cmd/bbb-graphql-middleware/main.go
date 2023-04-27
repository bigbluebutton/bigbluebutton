package main

import (
	"fmt"
	"github.com/iMDT/bbb-graphql-middleware/internal/websrv"
	"github.com/iMDT/bbb-graphql-middleware/internal/websrv/invalidator"
	log "github.com/sirupsen/logrus"
	"net/http"
)

func main() {
	// Configure logger
	log.SetLevel(log.InfoLevel)
	log.SetFormatter(&log.JSONFormatter{})
	log := log.WithField("_routine", "SessionTokenReader")

	// Connection invalidator
	go invalidator.BrowserConnectionInvalidator()

	// Websocket listener
	var listenPort = 8378
	http.HandleFunc("/", websrv.ConnectionHandler)

	log.Infof("listening on port %v", listenPort)
	log.Fatal(http.ListenAndServe(fmt.Sprintf(":%v", listenPort), nil))

}
