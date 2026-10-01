package streamingserver

import "testing"

const (
	testMeetingId = "meeting-1"
	userListKey   = "x-hasura-userlistnotlockedinmeeting"
)

func lockedViewer(userId string) streamingRecipient {
	return streamingRecipient{
		MeetingId:          testMeetingId,
		UserId:             userId,
		CurrentlyInMeeting: true,
		SessionVars:        map[string]string{},
	}
}

func unlockedViewer(userId string) streamingRecipient {
	r := lockedViewer(userId)
	r.SessionVars = map[string]string{userListKey: testMeetingId}
	return r
}

func TestVoiceStateVisibleTo(t *testing.T) {
	staleLocked := lockedViewer("viewer-1")
	staleLocked.SessionVarsStale = true
	staleUnlocked := unlockedViewer("viewer-1")
	staleUnlocked.SessionVarsStale = true
	notInMeeting := unlockedViewer("viewer-1")
	notInMeeting.CurrentlyInMeeting = false
	membershipStale := unlockedViewer("viewer-1")
	membershipStale.MembershipStale = true
	otherMeeting := unlockedViewer("viewer-1")
	otherMeeting.MeetingId = "meeting-2"

	cases := []struct {
		name        string
		recipient   streamingRecipient
		speakerId   string
		speakerRole string
		want        bool
	}{
		{"moderator reaches a locked viewer", lockedViewer("viewer-1"), "mod-1", "MODERATOR", true},
		{"moderator role is matched case-insensitively", lockedViewer("viewer-1"), "mod-1", "moderator", true},
		{"viewer is withheld from a locked viewer", lockedViewer("viewer-1"), "viewer-2", "VIEWER", false},
		{"viewer reaches an unlocked viewer", unlockedViewer("viewer-1"), "viewer-2", "VIEWER", true},
		{"absent role grants no exemption", lockedViewer("viewer-1"), "viewer-2", "", false},
		{"absent role is still visible to an unlocked viewer", unlockedViewer("viewer-1"), "viewer-2", "", true},
		{"a locked viewer sees their own state", lockedViewer("viewer-1"), "viewer-1", "VIEWER", true},
		{"unsettled session vars withhold a viewer", staleUnlocked, "viewer-2", "VIEWER", false},
		{"unsettled session vars still pass a moderator", staleLocked, "mod-1", "MODERATOR", true},
		{"unsettled session vars still pass the recipient's own state", staleLocked, "viewer-1", "VIEWER", true},
		{"a recipient not in the meeting gets nothing", notInMeeting, "mod-1", "MODERATOR", false},
		{"unsettled membership gets nothing", membershipStale, "mod-1", "MODERATOR", false},
		{"a recipient in another meeting gets nothing", otherMeeting, "mod-1", "MODERATOR", false},
		{"an empty speaker id is not the recipient", lockedViewer(""), "", "VIEWER", false},
	}

	for _, c := range cases {
		if got := voiceStateVisibleTo(c.recipient, testMeetingId, c.speakerId, c.speakerRole); got != c.want {
			t.Errorf("%s: got %v, want %v", c.name, got, c.want)
		}
	}
}

func resetVoiceStatesCache(t *testing.T) {
	t.Helper()
	UserVoiceStatesCacheMutex.Lock()
	UserVoiceStatesCache = make(map[string]map[string]map[string]any)
	UserVoiceStatesCacheMutex.Unlock()
	t.Cleanup(func() {
		UserVoiceStatesCacheMutex.Lock()
		UserVoiceStatesCache = make(map[string]map[string]map[string]any)
		UserVoiceStatesCacheMutex.Unlock()
	})
}

func cachedRow(userId, role string) map[string]any {
	return map[string]any{
		"userId": userId,
		"user":   map[string]any{"role": role},
	}
}

func TestEffectiveSpeakerRole(t *testing.T) {
	resetVoiceStatesCache(t)

	if got := effectiveSpeakerRole(testMeetingId, "mod-1", "VIEWER"); got != "VIEWER" {
		t.Errorf("with nothing cached the event role must stand, got %q", got)
	}

	StoreUserVoiceStatesCache(testMeetingId, "mod-1", cachedRow("mod-1", "MODERATOR"))
	if got := effectiveSpeakerRole(testMeetingId, "mod-1", "VIEWER"); got != "MODERATOR" {
		t.Errorf("a cached moderator role must carry over to the row that clears it, got %q", got)
	}
	if got := effectiveSpeakerRole("meeting-2", "mod-1", "VIEWER"); got != "VIEWER" {
		t.Errorf("a role cached in another meeting must not apply, got %q", got)
	}

	StoreUserVoiceStatesCache(testMeetingId, "viewer-1", cachedRow("viewer-1", "VIEWER"))
	if got := effectiveSpeakerRole(testMeetingId, "viewer-1", "VIEWER"); got != "VIEWER" {
		t.Errorf("a cached viewer role must not grant an exemption, got %q", got)
	}
	if got := effectiveSpeakerRole(testMeetingId, "viewer-1", ""); got != "" {
		t.Errorf("an absent event role must not be upgraded from a viewer row, got %q", got)
	}

	if got := effectiveSpeakerRole(testMeetingId, "viewer-1", "MODERATOR"); got != "MODERATOR" {
		t.Errorf("a moderator event role must stand regardless of the cache, got %q", got)
	}
}

func TestCachedVoiceStateSpeaker(t *testing.T) {
	if id, role := cachedVoiceStateSpeaker(cachedRow("mod-1", "MODERATOR")); id != "mod-1" || role != "MODERATOR" {
		t.Errorf("got (%q, %q), want (\"mod-1\", \"MODERATOR\")", id, role)
	}

	if id, role := cachedVoiceStateSpeaker(map[string]any{"userId": "viewer-1"}); id != "viewer-1" || role != "" {
		t.Errorf("a row without a user map must yield an empty role, got (%q, %q)", id, role)
	}

	if id, role := cachedVoiceStateSpeaker(map[string]any{}); id != "" || role != "" {
		t.Errorf("an empty row must yield empty fields, got (%q, %q)", id, role)
	}
}
