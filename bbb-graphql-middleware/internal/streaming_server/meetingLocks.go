package streamingserver

import (
	"sync"

	"bbb-graphql-middleware/internal/common"
)

// The meeting-wide locks that the replays need, kept per meeting.
//
// A live event carries the lock state it was produced under, so the live paths never look here. A
// replay has no event to read it from, and the session no longer carries it either: a lock change
// is not pushed to anyone's session. The state is therefore taken from every message that carries
// it - LockSettingsInMeetingChangedEvtMsg, and the voice state and cursor events - by
// RecordMeetingLocks, which the Redis read loop calls synchronously, before handing the message to
// its handler goroutine. Updates are thus applied in the order akka-apps published them and the
// latest message always wins, so a dropped lock settings change is corrected by the next event
// that carries the lock rather than persisting for the rest of the meeting.
//
// A meeting with no recorded state reads as locked, so a replay never shows what the lock might be
// hiding just because nothing has been heard yet.
var (
	meetingHideUserList      = make(map[string]bool)
	meetingHideViewersCursor = make(map[string]bool)
	meetingLocksMutex        sync.RWMutex
)

// RecordMeetingLocks updates the meeting's lock state from a Redis message, if it carries any. A
// message without the field, from an akka-apps that does not send it, leaves the state unchanged.
//
// Must be called from the Redis read loop itself, not from a goroutine: the "latest wins" rule
// relies on messages being applied in the order they were published.
func RecordMeetingLocks(messageName string, receivedMessage common.RedisMessage) {
	meetingId := receivedMessage.Core.Header.MeetingId
	body := receivedMessage.Core.Body

	switch messageName {
	case "LockSettingsInMeetingChangedEvtMsg":
		if hideUserList, ok := body["hideUserList"].(bool); ok {
			setMeetingLock(meetingHideUserList, meetingId, hideUserList)
		}
		if hideViewersCursor, ok := body["hideViewersCursor"].(bool); ok {
			setMeetingLock(meetingHideViewersCursor, meetingId, hideViewersCursor)
		}
	case "UserVoiceStateEvtMsg":
		if hideUserList, ok := body["hideUserList"].(bool); ok {
			setMeetingLock(meetingHideUserList, meetingId, hideUserList)
		}
	case "SendCursorPositionEvtMsg":
		// Only a viewer's cursor says anything about hideViewersCursor: for anyone else the flag is
		// false whatever the lock.
		cursorIsFromViewer, _ := body["userIsViewer"].(bool)
		if hiddenForLockedViewers, ok := body["hiddenForLockedViewers"].(bool); ok && cursorIsFromViewer {
			setMeetingLock(meetingHideViewersCursor, meetingId, hiddenForLockedViewers)
		}
	}
}

func setMeetingLock(locks map[string]bool, meetingId string, value bool) {
	meetingLocksMutex.Lock()
	defer meetingLocksMutex.Unlock()

	locks[meetingId] = value
}

func meetingHidesUserList(meetingId string) bool {
	meetingLocksMutex.RLock()
	defer meetingLocksMutex.RUnlock()

	hideUserList, known := meetingHideUserList[meetingId]

	return !known || hideUserList
}

func meetingHidesViewersCursor(meetingId string) bool {
	meetingLocksMutex.RLock()
	defer meetingLocksMutex.RUnlock()

	hideViewersCursor, known := meetingHideViewersCursor[meetingId]

	return !known || hideViewersCursor
}

func RemoveMeetingLockSettings(meetingId string) {
	meetingLocksMutex.Lock()
	defer meetingLocksMutex.Unlock()

	delete(meetingHideUserList, meetingId)
	delete(meetingHideViewersCursor, meetingId)
}
