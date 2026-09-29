package streamingserver

import (
	"strings"
	"sync"
	"testing"

	"bbb-graphql-middleware/internal/common"
)

// voiceRecipient builds a settled in-meeting recipient with the given hideUserList variable.
func voiceRecipient(userId, userListNotLocked string) streamingRecipient {
	return streamingRecipient{
		MeetingId:          testMeetingId,
		UserId:             userId,
		CurrentlyInMeeting: true,
		SessionVars:        map[string]string{"x-hasura-userlistnotlockedinmeeting": userListNotLocked},
	}
}

// Cases the stream-level tests in streams_test.go do not reach: the rule's edges rather than its
// main branches.
func TestVoiceStateVisibleTo(t *testing.T) {
	stale := voiceRecipient("u1", testMeetingId)
	stale.SessionVarsStale = true

	notInMeeting := voiceRecipient("u1", testMeetingId)
	notInMeeting.CurrentlyInMeeting = false

	tests := []struct {
		name          string
		recipient     streamingRecipient
		speakerUserId string
		speakerRole   string
		want          bool
	}{
		{"moderator role match is case-insensitive", voiceRecipient("u1", ""), "u2", "moderator", true},
		{"empty speaker role is not a moderator", voiceRecipient("u1", ""), "u2", "", false},
		{"missing session variable is not unlocked", streamingRecipient{
			MeetingId: testMeetingId, UserId: "u1", CurrentlyInMeeting: true,
		}, "u2", "VIEWER", false},
		{"session variable naming another meeting is not unlocked", voiceRecipient("u1", otherMeeting), "u2", "VIEWER", false},
		{"own row needs membership", notInMeeting, "u1", "VIEWER", false},
		{"unsettled lock state still admits a moderator", stale, "u2", "MODERATOR", true},
		{"unsettled lock state still admits the own row", stale, "u1", "VIEWER", true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := voiceStateVisibleTo(tt.recipient, testMeetingId, tt.speakerUserId, tt.speakerRole); got != tt.want {
				t.Errorf("voiceStateVisibleTo() = %v, want %v", got, tt.want)
			}
		})
	}
}

// A cached row that does not say whose it is, or with what role, falls through to the lock check.
func TestCachedVoiceStateSpeakerMalformedRows(t *testing.T) {
	rows := map[string]map[string]any{
		"no user object":         {"userId": "u2"},
		"user is not an object":  {"userId": "u2", "user": "nope"},
		"userId is not a string": {"userId": 42, "user": map[string]any{"role": "VIEWER"}},
		"empty row":              {},
	}

	locked := voiceRecipient("u1", "")
	for name, row := range rows {
		t.Run(name, func(t *testing.T) {
			speakerUserId, speakerRole := cachedVoiceStateSpeaker(row)
			if voiceStateVisibleTo(locked, testMeetingId, speakerUserId, speakerRole) {
				t.Error("a malformed row was visible to a locked recipient")
			}
		})
	}
}

func TestSendPreviousUserVoiceStateUnlockedGetsEveryRow(t *testing.T) {
	t.Cleanup(func() { RemoveMeetingUserVoiceStatesCache(testMeetingId) })

	none := map[string]*common.BrowserConnection{}
	HandleUserVoiceStateEvtMsg(msgFor(testMeetingId, "w_speaker", voiceBody()), &sync.RWMutex{}, none)
	modBody := moderatorVoiceBody()
	modBody["userId"] = "w_mod"
	HandleUserVoiceStateEvtMsg(msgFor(testMeetingId, "w_mod", modBody), &sync.RWMutex{}, none)

	unlocked := newConn("unlocked", "getUserVoiceStateStream", true, userListUnlocked())
	SendPreviousUserVoiceState(unlocked, "q1")

	got := drain(unlocked)
	if len(got) != 1 || !strings.Contains(got[0], "w_speaker") || !strings.Contains(got[0], "w_mod") {
		t.Errorf("unlocked recipient was not replayed every cached row: %v", got)
	}
}

// clearingBody is the row that ends a user's voice state when akka-apps holds no voice record for
// them any more: no name, not talking, muted, and reported as a viewer whatever their role.
func clearingBody(userId string) map[string]interface{} {
	return map[string]interface{}{
		"userId": userId, "voiceUserId": "", "userRole": "VIEWER",
		"userName": "", "userColor": "", "userSpeechLocale": "",
		"talking": false, "muted": true, "leftVoiceConf": true,
	}
}

// Everyone shown a moderator's talking indicator must also be sent the row that clears it.
func TestModeratorClearingRowReachesLockedViewer(t *testing.T) {
	t.Cleanup(func() { RemoveMeetingUserVoiceStatesCache(testMeetingId) })

	lockedViewer := newConn("lockedViewer", "getUserVoiceStateStream", true, userListLocked())
	conns := map[string]*common.BrowserConnection{"lockedViewer": lockedViewer}

	talkingMod := moderatorVoiceBody()
	talkingMod["userId"] = "w_mod"
	HandleUserVoiceStateEvtMsg(msgFor(testMeetingId, "w_mod", talkingMod), &sync.RWMutex{}, conns)
	if got := drain(lockedViewer); len(got) != 1 {
		t.Fatalf("locked viewer got %d rows for a talking moderator, want 1", len(got))
	}

	HandleUserVoiceStateEvtMsg(msgFor(testMeetingId, "w_mod", clearingBody("w_mod")), &sync.RWMutex{}, conns)
	if got := drain(lockedViewer); len(got) != 1 {
		t.Errorf("locked viewer got %d rows clearing the moderator's state, want 1", len(got))
	}

	if cached, _ := GetUserVoiceStatesCache(testMeetingId); len(cached) != 0 {
		t.Errorf("the cleared state is still cached: %v", cached)
	}
}

// The cached role only ever promotes a real moderator: a viewer's clearing row stays subject to
// the lock, and so does a row for a user with nothing cached.
func TestClearingRowForViewerStaysGated(t *testing.T) {
	t.Cleanup(func() { RemoveMeetingUserVoiceStatesCache(testMeetingId) })

	HandleUserVoiceStateEvtMsg(msgFor(testMeetingId, "w_speaker", voiceBody()),
		&sync.RWMutex{}, map[string]*common.BrowserConnection{})

	lockedViewer := newConn("lockedViewer", "getUserVoiceStateStream", true, userListLocked())
	conns := map[string]*common.BrowserConnection{"lockedViewer": lockedViewer}

	HandleUserVoiceStateEvtMsg(msgFor(testMeetingId, "w_speaker", clearingBody("w_speaker")), &sync.RWMutex{}, conns)
	HandleUserVoiceStateEvtMsg(msgFor(testMeetingId, "w_unknown", clearingBody("w_unknown")), &sync.RWMutex{}, conns)

	if got := drain(lockedViewer); len(got) != 0 {
		t.Errorf("locked viewer received a lock-governed clearing row: %v", got)
	}
}

func TestEffectiveSpeakerRole(t *testing.T) {
	t.Cleanup(func() { RemoveMeetingUserVoiceStatesCache(testMeetingId) })

	if got := effectiveSpeakerRole(testMeetingId, "w_nobody", "VIEWER"); got != "VIEWER" {
		t.Errorf("with nothing cached, role = %q, want the event's VIEWER", got)
	}

	StoreUserVoiceStatesCache(testMeetingId, "w_mod", map[string]any{
		"userId": "w_mod", "user": map[string]any{"role": "MODERATOR"},
	})
	if got := effectiveSpeakerRole(testMeetingId, "w_mod", "VIEWER"); got != "MODERATOR" {
		t.Errorf("with a cached moderator row, role = %q, want MODERATOR", got)
	}
	if got := effectiveSpeakerRole(otherMeeting, "w_mod", "VIEWER"); got != "VIEWER" {
		t.Errorf("a cached row from another meeting was applied: role = %q", got)
	}
}
