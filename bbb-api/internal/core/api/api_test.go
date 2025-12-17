package api

import (
	"fmt"
	"net/http"
	"strings"
	"testing"

	"github.com/bigbluebutton/bigbluebutton/bbb-api/internal/core/bbbhttp"
)

var listeningHost string
var listeningPort string

func (api *API) ListenAndServe(address string) {
	parts := strings.Split(address, ":")
	if len(parts) != 2 {
		return
	}
	listeningHost = parts[0]
	listeningPort = parts[1]
}

func TestAPIStart(t *testing.T) {
	host := "localhost"
	port := "8080"
	address := fmt.Sprintf("%s:%s", host, port)

	api := NewAPI(address, func(server *bbbhttp.Server) {
		// Test function; no routes needed.
	})
	api.Start()

	if listeningHost != host {
		t.Errorf("ListenAndServe() wrong host - got: %s, want: %s", listeningHost, host)
	}
	if listeningPort != port {
		t.Errorf("ListenAndServe() wrong port - got: %s, want: %s", listeningPort, port)
	}
}

func TestNewAPI(t *testing.T) {
	routes := []string{"/bigbluebutton/test/"}
	host := "localhost"
	port := "8080"
	address := fmt.Sprintf("%s:%s", host, port)

	api := NewAPI(address, func(server *bbbhttp.Server) {
		server.AddRoute(http.MethodGet, "/bigbluebutton/test/", func(w http.ResponseWriter, r *http.Request) {
			// Test function; no routes needed.
		})
	})

	if api.Server == nil {
		t.Error("NewAPI() did not initialize correctly - server is nil")
	}

	if api.address != address {
		t.Errorf("NewAPI() did not initialize correctly - wrong address - got: %s, want: %s", api.address, address)
	}

	for i, r := range api.Routes() {
		if r.Pattern != routes[i] {
			t.Errorf("NewAPI() did not initialize correctly - wrong service routes - got: %s, want: %s", routes[i], r.Pattern)
		}
	}
}
