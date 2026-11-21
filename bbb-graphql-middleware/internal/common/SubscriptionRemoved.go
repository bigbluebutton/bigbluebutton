package common

// Reasons a subscription leaves a connection's ActiveSubscriptions, for the reason label of
// gql_subscription_removed_total.
const (
	RemovedByClient          = "client_complete"
	RemovedByHasura          = "hasura_complete"
	RemovedOnConnectionClose = "connection_closed"
)

// RecordSubscriptionRemoved counts a subscription removed from a connection.
func RecordSubscriptionRemoved(subscription GraphQlSubscription, reason string) {
	GqlSubscriptionRemovedCounter.
		WithLabelValues(string(subscription.Type), subscription.MetricLabel(), reason).
		Inc()
}

// RecordConnectionSubscriptionsRemoved counts the subscriptions still active when a connection
// closes and removes them, in the same lock, so a complete for one of them that is handled
// afterwards finds it gone and does not count it again.
func RecordConnectionSubscriptionsRemoved(browserConnection *BrowserConnection) {
	browserConnection.ActiveSubscriptionsMutex.Lock()
	defer browserConnection.ActiveSubscriptionsMutex.Unlock()
	for queryId, subscription := range browserConnection.ActiveSubscriptions {
		RecordSubscriptionRemoved(subscription, RemovedOnConnectionClose)
		delete(browserConnection.ActiveSubscriptions, queryId)
	}
}
