package common

import (
	"slices"
	"testing"

	"bbb-graphql-middleware/config"
)

func TestReconnectionReason(t *testing.T) {
	cases := map[string]string{
		"role_changed":                     "role_changed",
		"lock_user_changed":                "lock_user_changed",
		"assigned_presenter":               "assigned_presenter",
		"assigned_presenter_automatically": "assigned_presenter_automatically",
		"user_joined":                      "user_joined",
		"user was ejected by a moderator":  ReconnectionOtherRequest,
		"":                                 ReconnectionOtherRequest,
	}
	for requested, want := range cases {
		if got := ReconnectionReason(requested); got != want {
			t.Errorf("ReconnectionReason(%q) = %q, want %q", requested, got, want)
		}
	}
}

func TestHasuraConnectionKeepsTheFirstCloseReason(t *testing.T) {
	hc := &HasuraConnection{}
	if got := hc.CloseReason(); got != ReconnectionOther {
		t.Errorf("no reason set: %q, want %q", got, ReconnectionOther)
	}
	hc.SetCloseReason("lock_user_changed")
	hc.SetCloseReason(ReconnectionHasuraReadError) // the read that fails after the cancel
	if got := hc.CloseReason(); got != "lock_user_changed" {
		t.Errorf("close reason = %q, want the first one, lock_user_changed", got)
	}
}

// The reasons that preserve membership are requested by akka-apps under fixed names; each of them
// needs its own label, so the test fails if that list gains a reason the metric does not label.
func TestEveryMembershipPreservingReasonHasALabel(t *testing.T) {
	for _, reason := range config.ReconnectionReasonsPreservingMembership {
		if !slices.Contains(requestedReconnectionReasons, reason) {
			t.Errorf("reconnection reason %q has no label of its own in gql_hasura_reconnection_total", reason)
		}
	}
}
