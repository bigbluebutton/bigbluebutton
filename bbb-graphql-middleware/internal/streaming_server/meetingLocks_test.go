package streamingserver

import (
	"context"
	"encoding/json"
	"sync"
	"testing"

	"bbb-graphql-middleware/config"
	"bbb-graphql-middleware/internal/common"
)

func resetMeetingLocks(t *testing.T) {
	t.Helper()
	RemoveMeetingLockSettings(testMeetingId)
	t.Cleanup(func() { RemoveMeetingLockSettings(testMeetingId) })
}

func resetCursorsCache(t *testing.T) {
	t.Helper()
	RemoveMeetingCursorsCache(testMeetingId)
	t.Cleanup(func() { RemoveMeetingCursorsCache(testMeetingId) })
}

func TestMeetingLocksReadAsLockedUntilKnown(t *testing.T) {
	resetMeetingLocks(t)

	if !meetingHidesUserList(testMeetingId) || !meetingHidesViewersCursor(testMeetingId) {
		t.Error("a meeting with no recorded lock state must read as locked")
	}
}

// lockMessage builds a Redis message for testMeetingId with the given body, as the read loop sees it.
func lockMessage(name string, body map[string]any) common.RedisMessage {
	var msg common.RedisMessage
	msg.Core.Header.Name = name
	msg.Core.Header.MeetingId = testMeetingId
	msg.Core.Body = body
	return msg
}

func recordLockSettingsChange(hideUserList, hideViewersCursor bool) {
	RecordMeetingLocks("LockSettingsInMeetingChangedEvtMsg", lockMessage("LockSettingsInMeetingChangedEvtMsg", map[string]any{
		"hideUserList":      hideUserList,
		"hideViewersCursor": hideViewersCursor,
	}))
}

func TestRecordMeetingLocksLatestMessageWins(t *testing.T) {
	resetMeetingLocks(t)

	recordLockSettingsChange(true, true)
	if !meetingHidesUserList(testMeetingId) || !meetingHidesViewersCursor(testMeetingId) {
		t.Fatal("a lock settings change must be recorded")
	}

	// The lock settings change that turned the locks off was lost: the next events that carry the
	// lock correct the state although an entry already exists.
	RecordMeetingLocks("UserVoiceStateEvtMsg", lockMessage("UserVoiceStateEvtMsg", map[string]any{"hideUserList": false}))
	if meetingHidesUserList(testMeetingId) {
		t.Error("a voice state event carrying hideUserList must update an existing entry")
	}

	RecordMeetingLocks("SendCursorPositionEvtMsg", lockMessage("SendCursorPositionEvtMsg", map[string]any{"userIsViewer": true, "hiddenForLockedViewers": false}))
	if meetingHidesViewersCursor(testMeetingId) {
		t.Error("a viewer's cursor event carrying hiddenForLockedViewers must update an existing entry")
	}

	// And back on, from the events alone.
	RecordMeetingLocks("UserVoiceStateEvtMsg", lockMessage("UserVoiceStateEvtMsg", map[string]any{"hideUserList": true}))
	RecordMeetingLocks("SendCursorPositionEvtMsg", lockMessage("SendCursorPositionEvtMsg", map[string]any{"userIsViewer": true, "hiddenForLockedViewers": true}))
	if !meetingHidesUserList(testMeetingId) || !meetingHidesViewersCursor(testMeetingId) {
		t.Error("a later event carrying the lock must overwrite the previous one")
	}

	RemoveMeetingLockSettings(testMeetingId)
	if !meetingHidesUserList(testMeetingId) {
		t.Error("a removed meeting must read as locked again")
	}
}

func TestRecordMeetingLocksIgnoresMessagesWithoutTheLock(t *testing.T) {
	resetMeetingLocks(t)

	recordLockSettingsChange(false, true)

	// An older akka-apps sends neither field.
	RecordMeetingLocks("UserVoiceStateEvtMsg", lockMessage("UserVoiceStateEvtMsg", map[string]any{"talking": true}))
	RecordMeetingLocks("SendCursorPositionEvtMsg", lockMessage("SendCursorPositionEvtMsg", map[string]any{"userIsViewer": true}))
	// A moderator's cursor carries false whatever the lock, so it says nothing about it.
	RecordMeetingLocks("SendCursorPositionEvtMsg", lockMessage("SendCursorPositionEvtMsg", map[string]any{"userIsViewer": false, "hiddenForLockedViewers": false}))
	// A message that is not a lock carrier, even with a matching field name.
	RecordMeetingLocks("NotifyAllInMeetingEvtMsg", lockMessage("NotifyAllInMeetingEvtMsg", map[string]any{"hideUserList": true}))

	if meetingHidesUserList(testMeetingId) || !meetingHidesViewersCursor(testMeetingId) {
		t.Error("a message without the lock must leave the recorded state unchanged")
	}

	// Nor does it create an entry for a meeting with none.
	RemoveMeetingLockSettings(testMeetingId)
	RecordMeetingLocks("UserVoiceStateEvtMsg", lockMessage("UserVoiceStateEvtMsg", map[string]any{"talking": true}))
	if !meetingHidesUserList(testMeetingId) {
		t.Error("a message without the lock must not record an unlocked state")
	}
}

func TestVoiceStateEventCarriesTheLock(t *testing.T) {
	resetVoiceStatesCache(t)
	resetMeetingLocks(t)

	locked := newVoiceStateSubscriber("viewer-1", map[string]string{})
	connections := map[string]*common.BrowserConnection{locked.Id: locked}
	var connectionsMutex sync.RWMutex

	unlockedEvent := voiceStateEvent("viewer-2", "VIEWER", "Viewer", true, false, false)
	unlockedEvent.Core.Body["hideUserList"] = false
	HandleUserVoiceStateEvtMsg(unlockedEvent, &connectionsMutex, connections)
	if rows := receivedVoiceStateRows(t, locked); len(rows) != 1 || rowUser(rows[0])["name"] != "Viewer" {
		t.Errorf("with hideUserList off a viewer's voice state must reach a locked viewer, got %v", rows)
	}

	// The lock is switched on: the very next event applies it, with no session refresh.
	recordLockSettingsChange(true, false)
	HandleUserVoiceStateEvtMsg(voiceStateEvent("viewer-2", "VIEWER", "Viewer", false, false, false), &connectionsMutex, connections)
	if rows := receivedVoiceStateRows(t, locked); len(rows) != 0 {
		t.Errorf("with hideUserList on a viewer's voice state must not reach a locked viewer, got %v", rows)
	}

	// An event without the field (older akka-apps) falls back to the recorded state.
	legacyEvent := voiceStateEvent("viewer-2", "VIEWER", "Viewer", true, false, false)
	delete(legacyEvent.Core.Body, "hideUserList")
	HandleUserVoiceStateEvtMsg(legacyEvent, &connectionsMutex, connections)
	if rows := receivedVoiceStateRows(t, locked); len(rows) != 0 {
		t.Errorf("an event without hideUserList must follow the recorded lock state, got %v", rows)
	}
}

func TestVoiceStateReplayFollowsTheCurrentLock(t *testing.T) {
	resetVoiceStatesCache(t)
	resetMeetingLocks(t)

	StoreUserVoiceStatesCache(testMeetingId, "viewer-2", cachedRow("viewer-2", "VIEWER"))
	locked := newVoiceStateSubscriber("viewer-1", map[string]string{})
	locked.Context = context.Background()

	replayed := func() []map[string]any {
		if !SendPreviousUserVoiceState(locked, "query-viewer-1") {
			t.Fatal("a recipient in the meeting must get a replay frame")
		}
		return receivedVoiceStateRows(t, locked)
	}

	if rows := replayed(); len(rows) != 0 {
		t.Errorf("with no recorded lock state a viewer's row must be withheld from a locked viewer, got %v", rows)
	}

	recordLockSettingsChange(false, false)
	if rows := replayed(); len(rows) != 1 {
		t.Errorf("with hideUserList off a viewer's row must be replayed to a locked viewer, got %v", rows)
	}

	recordLockSettingsChange(true, false)
	if rows := replayed(); len(rows) != 0 {
		t.Errorf("with hideUserList on a viewer's row must be withheld from a locked viewer, got %v", rows)
	}
}

func TestCursorVisibleTo(t *testing.T) {
	staleLocked := lockedViewer("viewer-1")
	staleLocked.SessionVarsStale = true
	notInMeeting := unlockedViewer("viewer-1")
	notInMeeting.CurrentlyInMeeting = false

	cases := []struct {
		name                   string
		recipient              streamingRecipient
		hiddenForLockedViewers bool
		want                   bool
	}{
		{"a hidden cursor is withheld from a locked viewer", lockedViewer("viewer-1"), true, false},
		{"a hidden cursor reaches an unlocked viewer", unlockedViewer("viewer-1"), true, true},
		{"a cursor that is not hidden reaches a locked viewer", lockedViewer("viewer-1"), false, true},
		{"unsettled session vars withhold a hidden cursor", staleLocked, true, false},
		{"unsettled session vars still pass a cursor that is not hidden", staleLocked, false, true},
		{"a recipient not in the meeting gets nothing", notInMeeting, false, false},
	}

	for _, c := range cases {
		if got := cursorVisibleTo(c.recipient, testMeetingId, c.hiddenForLockedViewers); got != c.want {
			t.Errorf("%s: got %v, want %v", c.name, got, c.want)
		}
	}
}

func TestCursorReplayFollowsTheCurrentLock(t *testing.T) {
	resetCursorsCache(t)
	resetMeetingLocks(t)

	StoreCursorsCache(testMeetingId, "viewer-2", map[string]any{"userId": "viewer-2"}, true)
	StoreCursorsCache(testMeetingId, "mod-1", map[string]any{"userId": "mod-1"}, false)

	locked := &common.BrowserConnection{
		MeetingId:                  testMeetingId,
		UserId:                     "viewer-1",
		CurrentlyInMeeting:         true,
		BBBWebSessionVariables:     map[string]string{},
		Context:                    context.Background(),
		ActiveStreamings:           map[string][]string{config.OpCursorCoordinatesStream: {"q1"}},
		FromHasuraToBrowserChannel: common.NewSafeChannelByte(4),
	}

	replayedUsers := func() map[string]bool {
		if !SendPreviousCursorPosition(locked, "q1") {
			t.Fatal("a recipient in the meeting must get a replay frame")
		}
		var decoded struct {
			Payload struct {
				Data struct {
					Rows []map[string]any `json:"pres_page_cursor_stream"`
				} `json:"data"`
			} `json:"payload"`
		}
		if err := json.Unmarshal(<-locked.FromHasuraToBrowserChannel.ReceiveChannel(), &decoded); err != nil {
			t.Fatalf("frame is not valid JSON: %v", err)
		}
		users := make(map[string]bool)
		for _, row := range decoded.Payload.Data.Rows {
			users[row["userId"].(string)] = true
		}
		return users
	}

	if users := replayedUsers(); users["viewer-2"] || !users["mod-1"] {
		t.Errorf("with no recorded lock state only the moderator's cursor may be replayed, got %v", users)
	}

	recordLockSettingsChange(false, false)
	if users := replayedUsers(); !users["viewer-2"] || !users["mod-1"] {
		t.Errorf("with hideViewersCursor off every cursor must be replayed, got %v", users)
	}

	recordLockSettingsChange(false, true)
	if users := replayedUsers(); users["viewer-2"] || !users["mod-1"] {
		t.Errorf("with hideViewersCursor on a viewer's cursor must be withheld from a locked viewer, got %v", users)
	}
}
