// Package api provides the functionality for quickly
// standing up a new API.
package api

import (
	"log/slog"

	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/bbbhttp"
)

// An API is a composed of a server that can be run at
// the specified address.
type API struct {
	*bbbhttp.Server
	address string
}

// Start begins running the API at a specific address.
func (api *API) Start() {
	slog.Info("API started at " + api.address)
	api.ListenAndServe(api.address)
}

// NewAPI creates a new API that is accessible at the given address.
// Register is used by the underlying server to define the routes that
// the API can handle requests on.
func NewAPI(address string, register func(server *bbbhttp.Server)) *API {
	api := configureAPI(address)
	register(api.Server)
	return api
}

func configureAPI(address string) *API {
	bbbServer := bbbhttp.NewDefaultServer()
	return &API{
		Server:  bbbServer,
		address: address,
	}
}
