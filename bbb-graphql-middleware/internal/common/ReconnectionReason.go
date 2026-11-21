package common

import "slices"

// Reasons a connection to Hasura ends while the browser stays connected, for the reason label of
// gql_hasura_reconnection_total. A reconnection requested by akka-apps carries its own reason,
// one of requestedReconnectionReasons (fixed literals in akka-apps), or ReconnectionOtherRequest
// for any other.
const (
	ReconnectionOtherRequest          = "other_request"
	ReconnectionHasuraReadError       = "hasura_read_error"
	ReconnectionHasuraWriteError      = "hasura_write_error"
	ReconnectionInvalidBrowserMessage = "invalid_browser_message"
	ReconnectionDialError             = "dial_error"
	ReconnectionOther                 = "other"
)

// requestedReconnectionReasons are the reasons akka-apps requests a reconnection with that the
// metric labels by name: a closed list of its own, so a reason added to akka-apps (or to a list
// kept for another purpose) does not become a label without a decision here.
var requestedReconnectionReasons = []string{
	"role_changed",
	"lock_user_changed",
	"assigned_presenter",
	"assigned_presenter_automatically",
}

// ReconnectionReason is the reason label of a reconnection requested by akka-apps.
func ReconnectionReason(requested string) string {
	if slices.Contains(requestedReconnectionReasons, requested) {
		return requested
	}
	return ReconnectionOtherRequest
}

// SetCloseReason records why the connection to Hasura is ending. The first reason wins: the
// read or write that fails after a requested cancel does not replace the request.
func (hc *HasuraConnection) SetCloseReason(reason string) {
	hc.closeReason.CompareAndSwap(nil, &reason)
}

// CloseReason is the recorded reason, or ReconnectionOther when none was recorded.
func (hc *HasuraConnection) CloseReason() string {
	if reason := hc.closeReason.Load(); reason != nil {
		return *reason
	}
	return ReconnectionOther
}
