package bbbhttp

import "github.com/go-chi/chi/v5"

type Server struct {
	*chi.Mux
}
