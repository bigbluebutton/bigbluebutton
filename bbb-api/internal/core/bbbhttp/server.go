package bbbhttp

import (
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
)

// A Server is used to assist the construction of BBB APIs by
// bootstrapping common dependencies and configurations, implementing
// desired middleware, and running the server itself.
type Server struct {
	*chi.Mux

	idleTimeout  time.Duration
	readTimeout  time.Duration
	writeTimeout time.Duration

	enableParamCollection bool
	enableCORS            bool
}

// A ServerOption allows a builder of an API to override default
// behaviour of the provided default [Server].
type ServerOption func(*Server)

// DisableParamCollection disbales the collection of request
// parameters from the query string and request body into a
// unified parameter map.
func DisableParamCollection() ServerOption {
	return func(s *Server) {
		s.enableParamCollection = false
	}
}

// DisableCORS disallows CORS for browser clients.
func DisableCORS() ServerOption {
	return func(s *Server) {
		s.enableCORS = false
	}
}

// NewDefaultServer creates a new [Server] with appropriate default
// configurations suitable for the construction of most APIs.
func NewDefaultServer(opts ...ServerOption) *Server {
	server := &Server{
		Mux:                   chi.NewMux(),
		idleTimeout:           60 * time.Second,
		readTimeout:           10 * time.Second,
		writeTimeout:          30 * time.Second,
		enableParamCollection: true,
		enableCORS:            true,
	}

	for _, opt := range opts {
		opt(server)
	}

	server.initialize()

	return server
}

// AddRoute adds a new route pattern for the given HTTP method that executes the
// provided handler function when called.
func (s *Server) AddRoute(method string, pattern string, handlerFn http.HandlerFunc) {
	switch method {
	case http.MethodPost:
		s.Post(pattern, handlerFn)
	case http.MethodPut:
		s.Put(pattern, handlerFn)
	case http.MethodPatch:
		s.Patch(pattern, handlerFn)
	case http.MethodDelete:
		s.Delete(pattern, handlerFn)
	case http.MethodHead:
		s.Head(pattern, handlerFn)
	case http.MethodOptions:
		s.Options(pattern, handlerFn)
	case http.MethodConnect:
		s.Connect(pattern, handlerFn)
	case http.MethodTrace:
		s.Trace(pattern, handlerFn)
	default:
		s.Get(pattern, handlerFn)
	}
}

// ListenAndServe initializes an underlying HTTP server and begins
// running it at the desired address.
func (s *Server) ListenAndServe(address string) {
	server := &http.Server{
		Addr:         address,
		IdleTimeout:  s.idleTimeout,
		ReadTimeout:  s.readTimeout,
		WriteTimeout: s.writeTimeout,
		Handler:      s.Mux,
	}
	err := server.ListenAndServe()
	if err != nil {
		panic(err)
	}
}

func (s *Server) initialize() {
	if s.enableParamCollection {
		s.Mux.Use(CollectParams())
	}
	if s.enableCORS {
		s.Mux.Use(cors.Handler(cors.Options{
			AllowedOrigins:   []string{"https://*", "http://*"},
			AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE"},
			AllowedHeaders:   []string{"Accept", "Content-Type", "X-CSRF-Token"},
			ExposedHeaders:   []string{"Link"},
			AllowCredentials: true,
			MaxAge:           300,
		}))
	}
	s.Mux.Use(middleware.Heartbeat("/ping"))
	s.Mux.Use(middleware.Recoverer)
}
