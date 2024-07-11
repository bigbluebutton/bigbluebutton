package main

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"

	mw "github.com/bigbluebutton/bigbluebutton/bbb-core-api/cmd/middleware"
)

func (app *Config) routes() http.Handler {
	mux := chi.NewRouter()

	mux.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"https://*", "http://*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE"},
		AllowedHeaders:   []string{"Accept", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	mux.Use(middleware.Heartbeat("/ping"))

	mux.Use(mw.ValidateChecksum(app.ServerConfig, app.ChecksumAlgorithms, app.writeXML))

	mux.Get("/isMeetingRunning", app.isMeetingRunning)

	mux.Get("/getMeetingInfo", app.getMeetingInfo)

	mux.Get("/getMeetings", app.getMeetings)

	mux.Get("/create", app.createMeeting)

	mux.Post("/create", app.createMeetingPost)

	return mux
}