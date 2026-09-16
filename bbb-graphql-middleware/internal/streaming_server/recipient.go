package streamingserver

import (
	"bbb-graphql-middleware/internal/common"
)

// streamingRecipient is an immutable snapshot of the BrowserConnection fields the streaming
// handlers need in order to decide whether a connection may receive a message.
//
// Snapshotting under the connection lock keeps the predicates pure (and so unit-testable) and
// gives one fan-out a single consistent view of a connection that refreshUserSessionVariables may
// rewrite under the write lock at any time.
//
// SessionVars aliases the connection's map rather than copying it. That is sound only because
// refreshUserSessionVariables replaces the map wholesale; it must never be mutated in place.
type streamingRecipient struct {
	MeetingId          string
	UserId             string
	CurrentlyInMeeting bool
	MembershipStale    bool
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
		MembershipStale:    bc.MembershipStale,
		SessionVarsStale:   bc.SessionVariablesStale,
		SessionVars:        bc.BBBWebSessionVariables,
	}
}

// inMeeting is the base rule every middleware-managed stream must satisfy before any send.
//
// These subscriptions are answered here rather than forwarded to Hasura, so the streaming server
// is the only place their recipients are authorized; the checks that apply to forwarded
// subscriptions do not reach them. Delivery is limited to connections currently in the meeting.
//
// Membership is evaluated per send rather than once at subscription time, because a subscription
// outlives changes to it and the registration is not revisited.
func (r streamingRecipient) inMeeting(meetingId string) bool {
	// Guard the empty string explicitly, so a connection that has not completed connection_init
	// cannot match on an empty meeting id.
	if meetingId == "" || r.MeetingId != meetingId {
		return false
	}

	// A reconnection request whose reason could have moved the user in or out of the meeting
	// leaves the cached value unsettled until a refresh publishes the current one. Treat it as
	// unknown rather than reusing it.
	if r.MembershipStale {
		return false
	}

	return r.CurrentlyInMeeting
}

// sessionVar reads a lock-derived session variable.
//
// These variables are absent, not false, for a connection that is not in the meeting (see
// UserInfoService.generateResponseMap). Callers must therefore treat an empty result as
// "not permitted" rather than "not locked", and check membership before relying on one.
func (r streamingRecipient) sessionVar(key string) string {
	return r.SessionVars[key]
}

// sessionVarsSettled reports whether the cached session variables can be trusted right now. A
// refresh in flight, or one that failed, leaves the previous values in place.
//
// Not only the lock-derived variables: the moderator and presenter variables are cached here too,
// and they are not lock-derived.
func (r streamingRecipient) sessionVarsSettled() bool {
	return !r.SessionVarsStale
}
