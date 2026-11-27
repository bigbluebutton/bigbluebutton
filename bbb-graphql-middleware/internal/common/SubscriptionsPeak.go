package common

// NoteActiveSubscriptionsLocked keeps the number of active subscriptions, which the metrics read
// without taking ActiveSubscriptionsMutex, and the highest number the connection has held. The
// caller holds ActiveSubscriptionsMutex for writing and calls it after every change of
// ActiveSubscriptions.
func (bc *BrowserConnection) NoteActiveSubscriptionsLocked() {
	n := len(bc.ActiveSubscriptions)
	bc.ActiveSubscriptionsCount.Store(int64(n))
	if n > bc.ActiveSubscriptionsPeak {
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
