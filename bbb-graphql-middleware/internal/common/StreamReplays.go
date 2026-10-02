package common

// A middleware-managed stream replays its cached state to each new subscriber. That replay is
// authorized like any other send, so a connection that is not yet a member of the meeting receives
// nothing - and because the client subscribes once and does not retry, the replay would otherwise
// be lost for the life of the subscription.
//
// This is not a rare case: the client opens its GraphQL connection before joining, so a connection
// is routinely settled and not-in-meeting at the moment it subscribes. Withheld replays are
// therefore recorded here and re-attempted when membership arrives.

// MarkStreamReplayPending records that a subscription's replay was withheld.
func (bc *BrowserConnection) MarkStreamReplayPending(operationName string, queryId string) {
	bc.ActiveStreamingsMutex.Lock()
	defer bc.ActiveStreamingsMutex.Unlock()

	if bc.PendingStreamReplays == nil {
		bc.PendingStreamReplays = make(map[string][]string)
	}
	bc.PendingStreamReplays[operationName] = append(bc.PendingStreamReplays[operationName], queryId)
}

// TakePendingStreamReplays removes and returns everything recorded so far. The caller re-marks
// whatever it still cannot deliver, so a connection that never joins does not accumulate retries.
func (bc *BrowserConnection) TakePendingStreamReplays() map[string][]string {
	bc.ActiveStreamingsMutex.Lock()
	defer bc.ActiveStreamingsMutex.Unlock()

	pending := bc.PendingStreamReplays
	bc.PendingStreamReplays = nil

	return pending
}
