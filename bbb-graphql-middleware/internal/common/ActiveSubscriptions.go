package common

// UpdateActiveSubscription applies update to the entry currently stored for id, under the write lock,
// and reports whether the entry still exists. A removed entry is never recreated.
func (bc *BrowserConnection) UpdateActiveSubscription(id string, update func(*GraphQlSubscription)) bool {
	bc.ActiveSubscriptionsMutex.Lock()
	defer bc.ActiveSubscriptionsMutex.Unlock()

	subscription, ok := bc.ActiveSubscriptions[id]
	if !ok {
		return false
	}

	update(&subscription)
	bc.ActiveSubscriptions[id] = subscription
	return true
}
