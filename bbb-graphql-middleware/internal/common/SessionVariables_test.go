package common

import (
	"testing"
	"time"
)

func TestReconnectionAffectsMembership(t *testing.T) {
	preserving := []string{
		"role_changed",
		"lock_user_changed",
		"assigned_presenter",
		"assigned_presenter_automatically",
	}
	for _, reason := range preserving {
		if ReconnectionAffectsMembership(reason) {
			t.Errorf("%q carries a role/lock change only and must not mark membership unknown", reason)
		}
	}

	affecting := []string{
		"user_joined",
		"user_left_expired",
		"user_loggedout",
		"user_requested_eject_reason",
		"system_requested_eject_reason",
		"duplicate_user_in_meeting_eject_reason",
		"user_inactivity_eject_reason",
		// The eject paths forward a human-readable sentence rather than a code, so the reasons
		// that must fail closed cannot be enumerated - they have to be the default.
		"No permission to eject user from meeting.",
		"User moved to another room",
		"",
		"some_reason_added_after_this_test_was_written",
	}
	for _, reason := range affecting {
		if !ReconnectionAffectsMembership(reason) {
			t.Errorf("%q must be treated as possibly membership-changing", reason)
		}
	}
}

func TestMarkSessionVariablesStale(t *testing.T) {
	bc := &BrowserConnection{}

	bc.MarkSessionVariablesStale(false)
	if !bc.SessionVariablesStale {
		t.Error("a reconnection must always leave the lock-derived variables unsettled")
	}
	if bc.MembershipStale {
		t.Error("a reason that cannot change membership must leave membership settled")
	}

	bc.MarkSessionVariablesStale(true)
	if !bc.MembershipStale || !bc.SessionVariablesStale {
		t.Error("a membership-affecting reason must leave both unsettled")
	}
	if bc.SessionVariablesGeneration != 2 {
		t.Errorf("generation = %d after two invalidations, want 2", bc.SessionVariablesGeneration)
	}
}

// A refresh that started before a later invalidation carries state that has already been
// superseded. Applying it would settle the connection on a value that is known to be out of date.
func TestApplySessionVariablesDiscardsSupersededResult(t *testing.T) {
	bc := &BrowserConnection{}

	bc.MarkSessionVariablesStale(true)
	inFlight, _, _, _ := bc.SessionVariablesRefreshTarget()

	// A second reconnection lands while that fetch is still outstanding.
	bc.MarkSessionVariablesStale(true)

	if bc.ApplySessionVariables(inFlight, map[string]string{"x-hasura-role": "bbb_client"}, true) {
		t.Fatal("a result fetched under a superseded generation must not be applied")
	}
	if !bc.MembershipStale || !bc.SessionVariablesStale {
		t.Error("a discarded result must leave the connection unsettled")
	}
	if bc.CurrentlyInMeeting {
		t.Error("a discarded result must not reach CurrentlyInMeeting")
	}

	current, _, _, _ := bc.SessionVariablesRefreshTarget()
	if !bc.ApplySessionVariables(current, map[string]string{"x-hasura-role": "bbb_client"}, true) {
		t.Fatal("a result for the current generation must be applied")
	}
	if bc.MembershipStale || bc.SessionVariablesStale {
		t.Error("a successful refresh must settle both marks")
	}
	if !bc.CurrentlyInMeeting {
		t.Error("a successful refresh must publish the fetched membership")
	}
}

func TestApplySessionVariablesReplacesMapWholesale(t *testing.T) {
	bc := &BrowserConnection{}
	bc.ApplySessionVariables(0, map[string]string{"x-hasura-notlockedinmeeting": "m1"}, true)

	// Readers alias this map, so a refresh must swap it rather than merge into the previous one.
	bc.ApplySessionVariables(0, map[string]string{"x-hasura-role": "bbb_client"}, true)

	if _, carriedOver := bc.BBBWebSessionVariables["x-hasura-notlockedinmeeting"]; carriedOver {
		t.Error("a variable absent from the refresh result survived it")
	}
}

func TestBeginSessionVariablesRefreshAdmitsOne(t *testing.T) {
	bc := &BrowserConnection{}

	if !bc.BeginSessionVariablesRefresh() {
		t.Fatal("the first caller must take the refresh slot")
	}
	if bc.BeginSessionVariablesRefresh() {
		t.Error("a burst of reconnections must not start a refresh loop each")
	}

	bc.EndSessionVariablesRefresh()
	if !bc.BeginSessionVariablesRefresh() {
		t.Error("the slot must be reusable once the previous loop finished")
	}
}

// Releasing the slot while the connection is unsettled would leave nothing running to settle it,
// and every gate treats unsettled as "not permitted".
func TestReleaseSessionVariablesRefreshIfSettled(t *testing.T) {
	bc := &BrowserConnection{}
	bc.BeginSessionVariablesRefresh()
	bc.MarkSessionVariablesStale(true)

	if bc.ReleaseSessionVariablesRefreshIfSettled() {
		t.Fatal("the slot must not be released while the connection is unsettled")
	}
	if !bc.SessionVariablesRefreshing {
		t.Error("a refused release must leave the slot held")
	}
	if bc.BeginSessionVariablesRefresh() {
		t.Error("the slot is still held, so nothing else should be able to take it")
	}

	generation, _, _, _ := bc.SessionVariablesRefreshTarget()
	bc.ApplySessionVariables(generation, map[string]string{"x-hasura-role": "bbb_client"}, true)

	if !bc.ReleaseSessionVariablesRefreshIfSettled() {
		t.Fatal("a settled connection must release the slot")
	}
	if !bc.BeginSessionVariablesRefresh() {
		t.Error("the released slot must be available again")
	}
}

func TestNextRefreshDelay(t *testing.T) {
	first := NextRefreshDelay(0)
	if first <= 0 {
		t.Fatalf("NextRefreshDelay(0) = %v, want a positive delay", first)
	}

	previous := first
	for attempt := 1; attempt < 20; attempt++ {
		delay := NextRefreshDelay(attempt)
		if delay < previous {
			t.Errorf("NextRefreshDelay(%d) = %v, shorter than the previous %v", attempt, delay, previous)
		}
		if delay > refreshRetryMaxDelay {
			t.Errorf("NextRefreshDelay(%d) = %v, above the %v cap", attempt, delay, refreshRetryMaxDelay)
		}
		previous = delay
	}

	if got := NextRefreshDelay(1000); got != refreshRetryMaxDelay {
		t.Errorf("NextRefreshDelay(1000) = %v, want the cap %v", got, refreshRetryMaxDelay)
	}
	if got := NextRefreshDelay(-1); got != refreshRetryBaseDelay {
		t.Errorf("NextRefreshDelay(-1) = %v, want the base delay %v", got, time.Duration(refreshRetryBaseDelay))
	}
}
