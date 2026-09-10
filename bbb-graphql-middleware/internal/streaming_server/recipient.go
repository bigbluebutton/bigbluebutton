package streamingserver

import (
	"bbb-graphql-middleware/internal/common"
)

// streamingRecipient is an immutable snapshot of the BrowserConnection fields the streaming
// handlers need in order to decide whether a connection may receive a message.
//
// Snapshotting under the connection lock keeps the predicates pure (and so unit-testable) and
// avoids retaining a reference to BBBWebSessionVariables, which refreshUserSessionVariables
// replaces wholesale under the write lock. It also removes a pre-existing data race: several
// handlers read MeetingId/UserId with no lock at all while that refresh writes them.
type streamingRecipient struct {
	MeetingId          string
	UserId             string
	CurrentlyInMeeting bool
	SessionVarsStale   bool
	SessionVars        map[string]string
}

func snapshotStreamingRecipient(bc *common.BrowserConnection) streamingRecipient {
	bc.RLock()
	defer bc.RUnlock()

	return streamingRecipient{
		MeetingId:          bc.MeetingId,
		UserId:             bc.UserId,
		CurrentlyInMeeting: bc.CurrentlyInMeeting,
		SessionVarsStale:   bc.SessionVariablesStale,
		SessionVars:        bc.BBBWebSessionVariables,
	}
}

// inMeeting is the base rule every middleware-managed stream must satisfy before any send.
//
// These subscriptions are short-circuited in websrv/reader before they reach Hasura, so neither
// the writer's AllowedSubscriptionsForNotInMeetingUsers gate nor any row-level permission ever
// applies to them - the streaming server is their only authorization point. Hasura grants the
// bbb_client_not_in_meeting role no access to the underlying data, so a connection that is not
// currently in the meeting (guest lobby, ejected, left) must receive nothing.
//
// Membership is not static: a user can be ejected while holding an open websocket, and their
// ActiveStreamings entry survives that. So this has to be checked per send, not only at
// subscription time.
func (r streamingRecipient) inMeeting(meetingId string) bool {
	// Guard the empty string explicitly: without it, a connection that has not completed
	// connection_init would match an empty meetingId against an empty session variable.
	if meetingId == "" || r.MeetingId != meetingId {
		return false
	}

	return r.CurrentlyInMeeting
}

// sessionVar reads a lock-derived session variable.
//
// Callers must treat a false result as "not permitted" rather than "not locked": for a connection
// that is not in the meeting these variables are absent rather than false (see
// UserInfoService.generateResponseMap, whose not-in-meeting branch omits every lock variable), so
// a bare equality test on them fails open.
func (r streamingRecipient) sessionVar(key string) string {
	return r.SessionVars[key]
}

// lockStateKnown reports whether lock-derived session variables can be trusted right now. A
// refresh in flight, or one that failed, leaves the previous values in place.
func (r streamingRecipient) lockStateKnown() bool {
	return !r.SessionVarsStale
}
