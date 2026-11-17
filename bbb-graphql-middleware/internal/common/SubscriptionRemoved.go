package common

// Reasons a subscription leaves a connection's ActiveSubscriptions, for the reason label of
// gql_subscription_removed_total.
const (
	RemovedByClient          = "client_complete"
	RemovedByHasura          = "hasura_complete"
	RemovedOnConnectionClose = "connection_closed"
)

// RecordSubscriptionRemoved counts a subscription removed from a connection. It is called after
// ActiveSubscriptionsMutex is released: the metrics are never updated under a connection lock.
func RecordSubscriptionRemoved(subscription GraphQlSubscription, reason string) {
	GqlSubscriptionRemovedCounter.
		WithLabelValues(string(subscription.Type), subscription.MetricLabel(), reason).
		Inc()
}

// RemoveActiveSubscription removes a subscription from the connection and returns it, if it was
// active. Whoever removes it, in this lock, is the one that counts it: a later removal of the same
// id finds it gone, as nothing brings a removed entry back (the reader only updates an entry that
// still exists, with UpdateActiveSubscription).
func (bc *BrowserConnection) RemoveActiveSubscription(queryId string) (GraphQlSubscription, bool) {
	bc.ActiveSubscriptionsMutex.Lock()
	defer bc.ActiveSubscriptionsMutex.Unlock()
	subscription, active := bc.ActiveSubscriptions[queryId]
	if active {
		delete(bc.ActiveSubscriptions, queryId)
	}
	return subscription, active
}

// RecordConnectionSubscriptionsRemoved removes, when a connection closes, the subscriptions still
// active, and counts them once the lock is released. The removal, in one lock, is what keeps the
// count right: a complete for one of them handled afterwards finds it gone and does not count it
// again, and the connection is marked closed, so a subscribe still being handled does not add a
// subscription that nothing would remove.
func RecordConnectionSubscriptionsRemoved(browserConnection *BrowserConnection) {
	browserConnection.ActiveSubscriptionsMutex.Lock()
	removed := make([]GraphQlSubscription, 0, len(browserConnection.ActiveSubscriptions))
	for queryId, subscription := range browserConnection.ActiveSubscriptions {
		removed = append(removed, subscription)
		delete(browserConnection.ActiveSubscriptions, queryId)
	}
	browserConnection.ActiveSubscriptionsClosed = true
	browserConnection.ActiveSubscriptionsMutex.Unlock()

	for _, subscription := range removed {
		RecordSubscriptionRemoved(subscription, RemovedOnConnectionClose)
	}
}
