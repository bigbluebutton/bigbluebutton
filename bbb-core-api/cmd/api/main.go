package main

import (
	bbb_core "bbb-core-api/gen/bbb-core"
	"fmt"
	"log"
	"net/http"

	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

const webPort = "9100"
const grpcHost = "127.0.0.1"
const grpcPort = "9000"
const target = grpcHost + ":" + grpcPort

type Config struct {
	BbbCore bbb_core.BbbCoreServiceClient
}

func main() {
	log.Println("Attempting to connect to akka-apps through gRPC at", target)
	conn, err := grpc.Dial(target, grpc.WithTransportCredentials(insecure.NewCredentials()), grpc.WithBlock())
	if err != nil {
		log.Panicln(err)
		return
	}

	log.Println("Successfully connected to akka-apps")

	client := bbb_core.NewBbbCoreServiceClient(conn)

	app := Config{
		BbbCore: client,
	}

	log.Printf("Starting bbb-core-api on port %s\n", webPort)
	srv := &http.Server{
		Addr:    fmt.Sprintf(":%s", webPort),
		Handler: app.routes(),
	}

	err = srv.ListenAndServe()
	if err != nil {
		log.Panicln(err)
	}
}
