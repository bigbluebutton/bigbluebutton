package main

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"

	"github.com/bigbluebutton/bigbluebutton/bbb-core-api/internal/mime"
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

	mux.Use(app.validateChecksum)
	mux.Use(app.collectParams)

	mux.Get("/isMeetingRunning", app.isMeetingRunning)
	mux.With(app.validateContentType([]mime.MimeType{mime.ApplicationFormURLEncoded, mime.MultipartFormData})).Post("/isMeetingRunning", app.isMeetingRunning)

	mux.Get("/getMeetingInfo", app.getMeetingInfo)
	mux.With(app.validateContentType([]mime.MimeType{mime.ApplicationFormURLEncoded, mime.MultipartFormData})).Post("/getMeetingInfo", app.getMeetingInfo)

	mux.Get("/getMeetings", app.getMeetings)
	mux.With(app.validateContentType([]mime.MimeType{mime.ApplicationFormURLEncoded, mime.MultipartFormData})).Post("/getMeetings", app.getMeetings)

	mux.Get("/create", app.createMeeting)
	mux.With(app.validateContentType([]mime.MimeType{mime.ApplicationFormURLEncoded, mime.MultipartFormData, mime.ApplicationXML, mime.TextXML})).Post("/create", app.createMeeting)

	return mux
}
