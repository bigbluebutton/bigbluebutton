package common

// NoteActiveSubscriptionsLocked keeps the highest number of active subscriptions the connection
// has held. The caller holds ActiveSubscriptionsMutex for writing.
func (bc *BrowserConnection) NoteActiveSubscriptionsLocked() {
	if n := len(bc.ActiveSubscriptions); n > bc.ActiveSubscriptionsPeak {
		bc.ActiveSubscriptionsPeak = n
	}
}

// RecordConnectionSubscriptionsPeak observes, when a connection closes, the highest number of
// active subscriptions it held.
func RecordConnectionSubscriptionsPeak(browserConnection *BrowserConnection) {
	browserConnection.ActiveSubscriptionsMutex.RLock()
	peak := browserConnection.ActiveSubscriptionsPeak
	browserConnection.ActiveSubscriptionsMutex.RUnlock()
	WsConnectionSubscriptionsPeak.Observe(float64(peak))
}
