package main

import (
	"fmt"
	"log"
	"net/http"
)

const webPort = "9100"

type Config struct{}

func main() {
	app := Config{}

	log.Printf("Starting bbb-core-api on port %s\n", webPort)
	srv := &http.Server{
		Addr:    fmt.Sprintf(":%s", webPort),
		Handler: app.routes(),
	}

	err := srv.ListenAndServe()
	if err != nil {
		log.Panicln(err)
	}
}
