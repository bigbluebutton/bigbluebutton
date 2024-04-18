package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	bbbcore "github.com/bigbluebutton/bigbluebutton/bbb-core-api/gen/bbb-core"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
	"gopkg.in/yaml.v3"
)

type Config struct {
	BbbCore            bbbcore.BbbCoreServiceClient `yaml:"-"`
	ChecksumAlgorithms map[string]struct{}          `yaml:"-"`
	DisabledFeatures   map[string]struct{}          `yaml:"-"`
	Server             struct {
		Host string `yaml:"host"`
		Port string `yaml:"port"`
		Grpc struct {
			Host string `yaml:"host"`
			Port string `yaml:"port"`
		} `yaml:"grpc"`
	} `yaml:"server"`
	Security struct {
		Salt     string `yaml:"salt"`
		Checksum struct {
			Algorithms []string `yaml:"algorithms"`
		} `yaml:"checksum"`
	} `yaml:"security"`
	Meeting struct {
		Camera struct {
			Cap       uint8 `yaml:"cap"`
			MaxPinned uint8 `yaml:"max_pinned"`
		} `yaml:"camera"`
		Features struct {
			Disabled []string `yaml:"disabled"`
		} `yaml:"features"`
	} `yaml:"meeting"`
	User struct {
		Camera struct {
			Cap uint8 `yaml:"cap"`
		} `yaml:"camera"`
	}
	Recording struct {
		NotifyRecordingIsOn bool `yaml:"notifyRecordingIsOn"`
	} `yaml:"recording"`
	Presentation struct {
		Upload struct {
			External struct {
				Description string `yaml:"description"`
				Url         string `yaml:"url"`
			} `yaml:"external"`
		} `yaml:"upload"`
	} `yaml:"presentation"`
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

func main() {
	app := parseConfiguration()
	target := fmt.Sprintf("%s:%s", app.Server.Grpc.Host, app.Server.Grpc.Port)

	log.Println("Establishing connection to akka-apps through gRPC at", target)
	conn, err := grpc.Dial(target, grpc.WithTransportCredentials(insecure.NewCredentials()), grpc.WithDefaultServiceConfig(retryPolicy))
	if err != nil {
		log.Panicln(err)
		return
	}
	defer conn.Close()

	client := bbbcore.NewBbbCoreServiceClient(conn)
	app.BbbCore = client

	address := fmt.Sprintf("%s:%s", app.Server.Host, app.Server.Port)
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

func parseConfiguration() *Config {
	log.Println("Parsing server configuration")

	f, err := os.Open("config.yml")
	if err != nil {
		log.Println(err)
		return nil
	}
	defer f.Close()

	var app Config
	decoder := yaml.NewDecoder(f)
	err = decoder.Decode(&app)
	if err != nil {
		log.Println(err)
		return nil
	}

	checksumAlgorithms := make(map[string]struct{})
	for _, algorithm := range app.Security.Checksum.Algorithms {
		checksumAlgorithms[algorithm] = struct{}{}
	}
	app.ChecksumAlgorithms = checksumAlgorithms

	disabledFeatures := make(map[string]struct{})
	for _, feature := range app.Meeting.Features.Disabled {
		disabledFeatures[feature] = struct{}{}
	}
	app.DisabledFeatures = disabledFeatures

	return &app
}
