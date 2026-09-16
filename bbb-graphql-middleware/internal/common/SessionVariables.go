package common

import (
	"slices"
	"time"

	"bbb-graphql-middleware/config"
)

// Session variables are fetched from akka-apps and cached on the connection. Two things are derived
// from them and used to authorize delivery: meeting membership (CurrentlyInMeeting) and the
// lock-derived variables. A reconnection request tells us the cached copy is superseded, but not
// what it now says, so between that request and a successful refresh the affected state is unknown
// and must be treated as such rather than used at its previous value.
//
// The two are tracked separately because they are invalidated at very different rates. A lock or
// role change cannot alter membership, and those changes fan out to every locked viewer in a
// meeting; treating membership as unknown for each of them would withhold stream data that the
// recipients are entitled to, and stream data withheld is lost rather than delayed.

const (
	refreshRetryBaseDelay = 250 * time.Millisecond
	refreshRetryMaxDelay  = 30 * time.Second
)

// ReconnectionAffectsMembership reports whether a reconnection reason could have changed the user's
// meeting membership.
//
// Unrecognised reasons - including the empty string - count as membership-affecting, so the safe
// answer is the default and a reason that is added upstream without being classified here costs a
// refresh rather than an authorization gap.
func ReconnectionAffectsMembership(reason string) bool {
	return !slices.Contains(config.ReconnectionReasonsPreservingMembership, reason)
}

// MarkSessionVariablesStale records that a reconnection request has superseded this connection's
// session variables, and opens a new generation so that any refresh already in flight is discarded
// rather than applied over the newer state.
//
// Membership is marked only when the reason could have changed it; the lock-derived variables are
// always marked, since every reconnection reason can change those.
func (bc *BrowserConnection) MarkSessionVariablesStale(affectsMembership bool) {
	bc.Lock()
	defer bc.Unlock()

	bc.SessionVariablesStale = true
	if affectsMembership {
		bc.MembershipStale = true
	}
	bc.SessionVariablesGeneration++
}

// BeginSessionVariablesRefresh claims the connection's single refresh slot, reporting whether the
// caller took it. A refresh already running will observe the new generation on its next attempt, so
// a burst of reconnection requests needs one goroutine between them rather than one each.
func (bc *BrowserConnection) BeginSessionVariablesRefresh() bool {
	bc.Lock()
	defer bc.Unlock()

	if bc.SessionVariablesRefreshing {
		return false
	}
	bc.SessionVariablesRefreshing = true

	return true
}

// ReleaseSessionVariablesRefreshIfSettled gives up the refresh slot, but only if nothing has
// invalidated the connection in the meantime; it reports whether the slot was released.
//
// The test and the release have to be one critical section. A reconnection arriving between them
// would find the slot still taken and start nothing, and the release would then leave the
// connection marked unsettled with no refresh running to settle it - which, since every gate treats
// unsettled as "not permitted", would silently strand the connection for the life of the socket.
func (bc *BrowserConnection) ReleaseSessionVariablesRefreshIfSettled() bool {
	bc.Lock()
	defer bc.Unlock()

	if bc.SessionVariablesStale || bc.MembershipStale {
		return false
	}
	bc.SessionVariablesRefreshing = false

	return true
}

// EndSessionVariablesRefresh gives up the refresh slot unconditionally. Only for abandoning a
// connection that is going away; use ReleaseSessionVariablesRefreshIfSettled otherwise.
func (bc *BrowserConnection) EndSessionVariablesRefresh() {
	bc.Lock()
	defer bc.Unlock()

	bc.SessionVariablesRefreshing = false
}

// SessionVariablesRefreshTarget reads the generation to fetch for together with the identity to
// fetch it with, in one critical section, so the result cannot be applied against a generation that
// belongs to a different session token.
func (bc *BrowserConnection) SessionVariablesRefreshTarget() (generation uint64, id string, sessionToken string, clientSessionUUID string) {
	bc.RLock()
	defer bc.RUnlock()

	return bc.SessionVariablesGeneration, bc.Id, bc.SessionToken, bc.ClientSessionUUID
}

// ApplySessionVariables stores a refresh result and settles the connection, reporting whether it
// was applied. A result fetched under a superseded generation is discarded and leaves both marks
// set, so the connection stays unsettled until a refresh of the current generation completes.
func (bc *BrowserConnection) ApplySessionVariables(generation uint64, sessionVariables map[string]string, currentlyInMeeting bool) bool {
	bc.Lock()
	defer bc.Unlock()

	if bc.SessionVariablesGeneration != generation {
		return false
	}

	// Replaced wholesale, never merged into: readers alias this map rather than copying it.
	bc.BBBWebSessionVariables = sessionVariables
	bc.CurrentlyInMeeting = currentlyInMeeting
	bc.SessionVariablesStale = false
	bc.MembershipStale = false

	return true
}

// IsCurrentlyInMeeting reads the cached membership under the connection lock.
func (bc *BrowserConnection) IsCurrentlyInMeeting() bool {
	bc.RLock()
	defer bc.RUnlock()

	return bc.CurrentlyInMeeting
}

// NextRefreshDelay is the backoff schedule for retrying a failed refresh. It doubles from
// refreshRetryBaseDelay and is capped, so a connection whose refresh keeps failing keeps trying
// without adding load in proportion to how long akka-apps has been unreachable.
func NextRefreshDelay(attempt int) time.Duration {
	delay := refreshRetryBaseDelay
	for i := 0; i < attempt && delay < refreshRetryMaxDelay; i++ {
		delay *= 2
	}

	if delay > refreshRetryMaxDelay {
		return refreshRetryMaxDelay
	}

	return delay
}
