package streamingserver

import (
	"sync"
)

// The meeting-wide locks that the replays need, kept per meeting.
//
// A live event carries the lock state it was produced under, so the live paths never look here. A
// replay has no event to read it from, and the session no longer carries it either: a lock change
// is not pushed to anyone's session, it is announced once per meeting by
// LockSettingsInMeetingChangedEvtMsg. That announcement is the authoritative source and always
// overwrites. Live events only seed a meeting the middleware has not heard about yet (a meeting
// that started before this process, or whose locks were never changed); they are handled in their
// own goroutines, so an event produced before a lock change may be processed after it, and letting
// it overwrite would restore the previous state.
//
// A meeting with no recorded state reads as locked, so a replay never shows what the lock might be
// hiding just because nothing has been heard yet.
var (
	meetingHideUserList      = make(map[string]bool)
	meetingHideViewersCursor = make(map[string]bool)
	meetingLocksMutex        sync.RWMutex
)

// RecordMeetingLockSettings stores the lock state announced by LockSettingsInMeetingChangedEvtMsg.
func RecordMeetingLockSettings(meetingId string, hideUserList bool, hideViewersCursor bool) {
	meetingLocksMutex.Lock()
	defer meetingLocksMutex.Unlock()

	meetingHideUserList[meetingId] = hideUserList
	meetingHideViewersCursor[meetingId] = hideViewersCursor
}

func seedMeetingHideUserList(meetingId string, hideUserList bool) {
	meetingLocksMutex.Lock()
	defer meetingLocksMutex.Unlock()

	if _, known := meetingHideUserList[meetingId]; !known {
		meetingHideUserList[meetingId] = hideUserList
	}
}

func seedMeetingHideViewersCursor(meetingId string, hideViewersCursor bool) {
	meetingLocksMutex.Lock()
	defer meetingLocksMutex.Unlock()

	if _, known := meetingHideViewersCursor[meetingId]; !known {
		meetingHideViewersCursor[meetingId] = hideViewersCursor
	}
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
