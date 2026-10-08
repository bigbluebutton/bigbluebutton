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

func TestMeetingLocksSeedOnlyFillsTheUnknown(t *testing.T) {
	resetMeetingLocks(t)

	seedMeetingHideUserList(testMeetingId, false)
	seedMeetingHideViewersCursor(testMeetingId, false)
	if meetingHidesUserList(testMeetingId) || meetingHidesViewersCursor(testMeetingId) {
		t.Fatal("a seed must fill a meeting with no recorded lock state")
	}

	RecordMeetingLockSettings(testMeetingId, true, true)
	if !meetingHidesUserList(testMeetingId) || !meetingHidesViewersCursor(testMeetingId) {
		t.Fatal("a lock settings change must overwrite a seed")
	}

	// An event produced before the change but handled after it must not restore the old state.
	seedMeetingHideUserList(testMeetingId, false)
	seedMeetingHideViewersCursor(testMeetingId, false)
	if !meetingHidesUserList(testMeetingId) || !meetingHidesViewersCursor(testMeetingId) {
		t.Error("a seed must not overwrite a recorded lock settings change")
	}

	RemoveMeetingLockSettings(testMeetingId)
	if !meetingHidesUserList(testMeetingId) {
		t.Error("a removed meeting must read as locked again")
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
	if meetingHidesUserList(testMeetingId) {
		t.Error("the event must seed the meeting's hideUserList state")
	}

	// The lock is switched on: the very next event applies it, with no session refresh.
	RecordMeetingLockSettings(testMeetingId, true, false)
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

	RecordMeetingLockSettings(testMeetingId, false, false)
	if rows := replayed(); len(rows) != 1 {
		t.Errorf("with hideUserList off a viewer's row must be replayed to a locked viewer, got %v", rows)
	}

	RecordMeetingLockSettings(testMeetingId, true, false)
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

	RecordMeetingLockSettings(testMeetingId, false, false)
	if users := replayedUsers(); !users["viewer-2"] || !users["mod-1"] {
		t.Errorf("with hideViewersCursor off every cursor must be replayed, got %v", users)
	}

	RecordMeetingLockSettings(testMeetingId, false, true)
	if users := replayedUsers(); users["viewer-2"] || !users["mod-1"] {
		t.Errorf("with hideViewersCursor on a viewer's cursor must be withheld from a locked viewer, got %v", users)
	}
}
