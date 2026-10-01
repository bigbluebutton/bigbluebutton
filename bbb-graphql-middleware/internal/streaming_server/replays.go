package streamingserver

import (
	"bbb-graphql-middleware/config"
	"bbb-graphql-middleware/internal/common"
)

// sendStreamReplay dispatches to the replay for one middleware-managed stream and reports whether a
// frame was sent. Streams that have no replay report true: there is nothing to retry for them.
func sendStreamReplay(browserConnection *common.BrowserConnection, operationName string, queryId string) bool {
	switch operationName {
	case config.OpCursorCoordinatesStream:
		return SendPreviousCursorPosition(browserConnection, queryId)
	case config.OpUserVoiceStateStream:
		return SendPreviousUserVoiceState(browserConnection, queryId)
	}

	return true
}

// ReplayPendingStreams re-attempts the replays withheld while the connection was not a member of
// the meeting. Called once a session-variable refresh settles the connection.
//
// Anything still undeliverable is recorded again, so a connection that never joins simply keeps its
// pending entries and one that joins later receives its replay then.
func ReplayPendingStreams(browserConnection *common.BrowserConnection) {
	for operationName, queryIds := range browserConnection.TakePendingStreamReplays() {
		for _, queryId := range queryIds {
			if sendStreamReplay(browserConnection, operationName, queryId) {
				browserConnection.Logger.Debugf("Delivered deferred %s replay", operationName)

				continue
			}

			browserConnection.MarkStreamReplayPending(operationName, queryId)
			browserConnection.Logger.Debugf("Deferred %s replay again: still not in the meeting", operationName)
		}
	}
}
