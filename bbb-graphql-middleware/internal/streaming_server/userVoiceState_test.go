package streamingserver

import (
	"encoding/json"
	"sync"
	"testing"

	"bbb-graphql-middleware/config"
	"bbb-graphql-middleware/internal/common"
)

const (
	testMeetingId = "meeting-1"
	notLockedKey  = "x-hasura-notlockedinmeeting"
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
	r.SessionVars = map[string]string{notLockedKey: testMeetingId}
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
		name         string
		recipient    streamingRecipient
		speakerId    string
		speakerRole  string
		want         bool
		hideUserList bool
	}{
		{"moderator reaches a locked viewer", lockedViewer("viewer-1"), "mod-1", "MODERATOR", true, true},
		{"moderator role is matched case-insensitively", lockedViewer("viewer-1"), "mod-1", "moderator", true, true},
		{"viewer is withheld from a locked viewer", lockedViewer("viewer-1"), "viewer-2", "VIEWER", false, true},
		{"viewer reaches an unlocked viewer", unlockedViewer("viewer-1"), "viewer-2", "VIEWER", true, true},
		{"absent role grants no exemption", lockedViewer("viewer-1"), "viewer-2", "", false, true},
		{"absent role is still visible to an unlocked viewer", unlockedViewer("viewer-1"), "viewer-2", "", true, true},
		{"a locked viewer sees their own state", lockedViewer("viewer-1"), "viewer-1", "VIEWER", true, true},
		{"unsettled session vars withhold a viewer", staleUnlocked, "viewer-2", "VIEWER", false, true},
		{"unsettled session vars still pass a moderator", staleLocked, "mod-1", "MODERATOR", true, true},
		{"unsettled session vars still pass the recipient's own state", staleLocked, "viewer-1", "VIEWER", true, true},
		{"a recipient not in the meeting gets nothing", notInMeeting, "mod-1", "MODERATOR", false, true},
		{"unsettled membership gets nothing", membershipStale, "mod-1", "MODERATOR", false, true},
		{"a recipient in another meeting gets nothing", otherMeeting, "mod-1", "MODERATOR", false, true},
		{"an empty speaker id is not the recipient", lockedViewer(""), "", "VIEWER", false, true},
		{"hideUserList off: viewer reaches a locked viewer", lockedViewer("viewer-1"), "viewer-2", "VIEWER", true, false},
		{"hideUserList off: unsettled session vars do not matter", staleLocked, "viewer-2", "VIEWER", true, false},
		{"hideUserList off: a recipient not in the meeting still gets nothing", notInMeeting, "viewer-2", "VIEWER", false, false},
	}

	for _, c := range cases {
		if got := voiceStateVisibleTo(c.recipient, testMeetingId, c.speakerId, c.speakerRole, c.hideUserList); got != c.want {
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

	if got := effectiveSpeakerRole(testMeetingId, "mod-1", "VIEWER", true); got != "VIEWER" {
		t.Errorf("with nothing cached the event role must stand, got %q", got)
	}

	StoreUserVoiceStatesCache(testMeetingId, "mod-1", cachedRow("mod-1", "MODERATOR"))
	if got := effectiveSpeakerRole(testMeetingId, "mod-1", "VIEWER", true); got != "MODERATOR" {
		t.Errorf("a cached moderator role must carry over to the row that clears it, got %q", got)
	}
	if got := effectiveSpeakerRole(testMeetingId, "mod-1", "VIEWER", false); got != "VIEWER" {
		t.Errorf("an event that is not clearing must keep its own role over a cached moderator row, got %q", got)
	}
	if got := effectiveSpeakerRole("meeting-2", "mod-1", "VIEWER", true); got != "VIEWER" {
		t.Errorf("a role cached in another meeting must not apply, got %q", got)
	}

	StoreUserVoiceStatesCache(testMeetingId, "viewer-1", cachedRow("viewer-1", "VIEWER"))
	if got := effectiveSpeakerRole(testMeetingId, "viewer-1", "VIEWER", true); got != "VIEWER" {
		t.Errorf("a cached viewer role must not grant an exemption, got %q", got)
	}
	if got := effectiveSpeakerRole(testMeetingId, "viewer-1", "", true); got != "" {
		t.Errorf("an absent event role must not be upgraded from a viewer row, got %q", got)
	}

	if got := effectiveSpeakerRole(testMeetingId, "viewer-1", "MODERATOR", false); got != "MODERATOR" {
		t.Errorf("a moderator event role must stand regardless of the cache, got %q", got)
	}
}

func TestClearedVoiceStateItem(t *testing.T) {
	item := map[string]any{
		"userId":          "mod-1",
		"voiceUserId":     "vu-1",
		"muted":           false,
		"talking":         true,
		"leftVoiceConf":   false,
		"voiceActivityAt": "2026-01-01T00:00:00.000Z",
		"user": map[string]any{
			"role":         "VIEWER",
			"color":        "#123456",
			"name":         "Mod",
			"speechLocale": "en",
		},
	}

	cleared := clearedVoiceStateItem(item)
	if cleared["userId"] != "mod-1" || cleared["muted"] != true || cleared["talking"] != false {
		t.Errorf("the row must end the user's talking and unmuted state, got %v", cleared)
	}
	if cleared["voiceUserId"] != "" {
		t.Errorf("the row must not carry the voice user id, got %v", cleared["voiceUserId"])
	}

	user := cleared["user"].(map[string]any)
	if user["name"] != "" || user["color"] != "" || user["speechLocale"] != "" {
		t.Errorf("the row must carry no identifying detail, got %v", user)
	}
	if user["role"] != "VIEWER" {
		t.Errorf("the row must carry the user's current role, got %v", user["role"])
	}

	if item["talking"] != true || item["user"].(map[string]any)["name"] != "Mod" {
		t.Error("the source row must not be modified")
	}
}

func newVoiceStateSubscriber(userId string, sessionVars map[string]string) *common.BrowserConnection {
	return &common.BrowserConnection{
		Id:                         "conn-" + userId,
		MeetingId:                  testMeetingId,
		UserId:                     userId,
		CurrentlyInMeeting:         true,
		BBBWebSessionVariables:     sessionVars,
		ActiveStreamings:           map[string][]string{config.OpUserVoiceStateStream: {"query-" + userId}},
		FromHasuraToBrowserChannel: common.NewSafeChannelByte(16),
	}
}

func voiceStateEvent(userId, role, name string, talking, muted, leftVoiceConf bool) common.RedisMessage {
	var msg common.RedisMessage
	msg.Core.Header.Name = "UserVoiceStateEvtMsg"
	msg.Core.Header.MeetingId = testMeetingId
	msg.Core.Header.UserId = userId
	msg.Core.Body = map[string]any{
		"voiceConf":        "voice-conf-1",
		"userId":           userId,
		"voiceUserId":      "vu-" + userId,
		"userRole":         role,
		"userName":         name,
		"userColor":        "#123456",
		"userSpeechLocale": "",
		"talking":          talking,
		"muted":            muted,
		"leftVoiceConf":    leftVoiceConf,
		"hideUserList":     true,
	}
	return msg
}

// receivedVoiceStateRows drains the frames sent to a connection and returns the rows they carried.
func receivedVoiceStateRows(t *testing.T, bc *common.BrowserConnection) []map[string]any {
	t.Helper()

	rows := make([]map[string]any, 0)
	for {
		select {
		case frame := <-bc.FromHasuraToBrowserChannel.ReceiveChannel():
			var decoded struct {
				Id      string `json:"id"`
				Payload struct {
					Data struct {
						Rows []map[string]any `json:"user_voice_activity_stream"`
					} `json:"data"`
				} `json:"payload"`
			}
			if err := json.Unmarshal(frame, &decoded); err != nil {
				t.Fatalf("frame is not valid JSON: %v", err)
			}
			if decoded.Id != "query-"+bc.UserId {
				t.Errorf("frame carries query id %q, want %q", decoded.Id, "query-"+bc.UserId)
			}
			rows = append(rows, decoded.Payload.Data.Rows...)
		default:
			return rows
		}
	}
}

func rowUser(row map[string]any) map[string]any {
	user, _ := row["user"].(map[string]any)
	return user
}

func TestDemotedModeratorIsClearedForLockedViewers(t *testing.T) {
	resetVoiceStatesCache(t)

	locked := newVoiceStateSubscriber("viewer-1", map[string]string{})
	unlocked := newVoiceStateSubscriber("viewer-2", map[string]string{notLockedKey: testMeetingId})
	connections := map[string]*common.BrowserConnection{locked.Id: locked, unlocked.Id: unlocked}
	var connectionsMutex sync.RWMutex

	// An unmuted moderator is visible to everyone.
	HandleUserVoiceStateEvtMsg(voiceStateEvent("mod-1", "MODERATOR", "Mod", false, false, false), &connectionsMutex, connections)
	for _, bc := range []*common.BrowserConnection{locked, unlocked} {
		rows := receivedVoiceStateRows(t, bc)
		if len(rows) != 1 || rowUser(rows[0])["name"] != "Mod" {
			t.Fatalf("%s: a moderator's voice state must reach every recipient, got %v", bc.UserId, rows)
		}
	}

	// The demotion: akka-apps re-sends the user's voice state with the new role.
	HandleUserVoiceStateEvtMsg(voiceStateEvent("mod-1", "VIEWER", "Mod", true, false, false), &connectionsMutex, connections)

	lockedRows := receivedVoiceStateRows(t, locked)
	if len(lockedRows) != 1 {
		t.Fatalf("a locked viewer must get exactly one row clearing the demoted user, got %v", lockedRows)
	}
	cleared := lockedRows[0]
	if cleared["userId"] != "mod-1" || cleared["talking"] != false || cleared["muted"] != true {
		t.Errorf("the locked viewer's row must clear the demoted user's state, got %v", cleared)
	}
	if user := rowUser(cleared); user["name"] != "" || user["color"] != "" || user["role"] != "VIEWER" {
		t.Errorf("the locked viewer's row must not identify the demoted user, got %v", user)
	}

	unlockedRows := receivedVoiceStateRows(t, unlocked)
	if len(unlockedRows) != 1 || rowUser(unlockedRows[0])["name"] != "Mod" || unlockedRows[0]["talking"] != true {
		t.Errorf("an unlocked viewer must get the demoted user's actual state, got %v", unlockedRows)
	}

	// From then on the demoted user is a viewer: their state no longer reaches the locked viewer.
	HandleUserVoiceStateEvtMsg(voiceStateEvent("mod-1", "VIEWER", "Mod", false, false, false), &connectionsMutex, connections)
	if rows := receivedVoiceStateRows(t, locked); len(rows) != 0 {
		t.Errorf("a demoted user's later voice state must not reach a locked viewer, got %v", rows)
	}
	if rows := receivedVoiceStateRows(t, unlocked); len(rows) != 1 {
		t.Errorf("a demoted user's later voice state must still reach an unlocked viewer, got %v", rows)
	}
}

func TestDepartingModeratorIsClearedForLockedViewers(t *testing.T) {
	resetVoiceStatesCache(t)

	locked := newVoiceStateSubscriber("viewer-1", map[string]string{})
	connections := map[string]*common.BrowserConnection{locked.Id: locked}
	var connectionsMutex sync.RWMutex

	HandleUserVoiceStateEvtMsg(voiceStateEvent("mod-1", "MODERATOR", "Mod", true, false, false), &connectionsMutex, connections)
	receivedVoiceStateRows(t, locked)

	// akka-apps no longer holds a voice record for the user: VIEWER, no name, leftVoiceConf.
	HandleUserVoiceStateEvtMsg(voiceStateEvent("mod-1", "VIEWER", "", false, true, true), &connectionsMutex, connections)

	rows := receivedVoiceStateRows(t, locked)
	if len(rows) != 1 || rows[0]["talking"] != false || rows[0]["muted"] != true || rows[0]["leftVoiceConf"] != true {
		t.Errorf("a locked viewer must get the row clearing a departing moderator, got %v", rows)
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
