package main

import (
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/bigbluebutton/bigbluebutton/bbb-core-api/config"
	bbbcore "github.com/bigbluebutton/bigbluebutton/bbb-core-api/gen/bbb-core"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

type Config struct {
	BbbCore            bbbcore.BbbCoreServiceClient
	ChecksumAlgorithms map[string]struct{}
	DisabledFeatures   map[string]struct{}
	ServerConfig       *config.ServerConfig
	NoRedirectClient   *http.Client
}

const retryPolicy = `{
	"methodConfig": [{
		"name": [{"service": "org.bigbluebutton.protos.BbbCoreService"}],
		"waitForReady": true,

		"retryPolicy": {
			"MaxAttempts": 5,
			"InitialBackoff": ".01s",
			"MaxBackoff": ".1s",
			"BackoffMultiplier": 2.0,
			"RetryableStatusCodes": [ "UNAVAILABLE" ]
		}
	}]
}`

const configFilePath = "config.yml"

func main() {
	app, err := parseConfiguration()
	if err != nil {
		log.Panicln(err)
		return
	}
	target := fmt.Sprintf("%s:%s", app.ServerConfig.Server.Grpc.Host, app.ServerConfig.Server.Grpc.Port)

	log.Println("Establishing connection to akka-apps through gRPC at", target)
	conn, err := grpc.Dial(target, grpc.WithTransportCredentials(insecure.NewCredentials()), grpc.WithDefaultServiceConfig(retryPolicy))
	if err != nil {
		log.Panicln(err)
		return
	}
	defer conn.Close()

	client := bbbcore.NewBbbCoreServiceClient(conn)
	app.BbbCore = client

	app.NoRedirectClient = &http.Client{
		Timeout: time.Minute,
		CheckRedirect: func(req *http.Request, via []*http.Request) error {
			return http.ErrUseLastResponse
		},
	}

	address := fmt.Sprintf("%s:%s", app.ServerConfig.Server.Host, app.ServerConfig.Server.Port)
	log.Printf("Starting bbb-core-api at %s\n", address)
	srv := &http.Server{
		Addr:    address,
		Handler: app.routes(),
	}

	err = srv.ListenAndServe()
	if err != nil {
		log.Panicln(err)
	}
}

func parseConfiguration() (*Config, error) {
	log.Println("Parsing server configuration")

	var app Config
	var serverConfig config.ServerConfig

	err := serverConfig.ParseConfig(configFilePath)
	if err != nil {
		return nil, err
	}
	app.ServerConfig = &serverConfig

	checksumAlgorithms := make(map[string]struct{})
	for _, algorithm := range app.ServerConfig.Security.Checksum.Algorithms {
		checksumAlgorithms[algorithm] = struct{}{}
	}
	app.ChecksumAlgorithms = checksumAlgorithms

	disabledFeatures := make(map[string]struct{})
	for _, feature := range app.ServerConfig.Meeting.Features.Disabled {
		disabledFeatures[feature] = struct{}{}
	}
	app.DisabledFeatures = disabledFeatures

	return &app, nil
}
