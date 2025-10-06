package websrv

import (
	"net/http"

	log "github.com/sirupsen/logrus"
)

func ReconnectionHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Only GET method is allowed", http.StatusMethodNotAllowed)
		return
	}

	sessionToken := r.URL.Query().Get("sessionToken")
	if sessionToken == "" {
		http.Error(w, "Missing 'sessionToken' parameter", http.StatusBadRequest)
		return
	}

	reason := r.URL.Query().Get("reason")

	log.Debugf("Reconnection request received for sessionToken: %s, reason: %s", sessionToken, reason)

	go InvalidateSessionTokenHasuraConnections(sessionToken)
}
