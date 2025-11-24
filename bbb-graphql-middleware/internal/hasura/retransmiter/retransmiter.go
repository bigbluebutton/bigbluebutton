package retransmiter

import (
	"slices"

	"bbb-graphql-middleware/config"
	"bbb-graphql-middleware/internal/common"
)

func RetransmitSubscriptionStartMessages(hc *common.HasuraConnection) {
	hc.BrowserConn.ActiveSubscriptionsMutex.RLock()
	subscriptionsToProcess := make(map[string]common.GraphQlSubscription, 0)
	for queryId, subscription := range hc.BrowserConn.ActiveSubscriptions {
		// Not retransmitting Mutations
		if subscription.Type == common.Mutation {
			continue
		}

		// When user left the meeting, Retransmit only Presence Manager subscriptions
		if !hc.BrowserConn.CurrentlyInMeeting &&
			!slices.Contains(config.AllowedSubscriptionsForNotInMeetingUsers, subscription.OperationName) {
			hc.BrowserConn.Logger.Debugf("Skipping retransmit %s because the user is not in meeting", subscription.OperationName)
			continue
		}

		subscriptionsToProcess[queryId] = subscription
	}
	hc.BrowserConn.ActiveSubscriptionsMutex.RUnlock()

	for _, subscription := range subscriptionsToProcess {
		if subscription.LastSeenOnHasuraConnection != hc.Id {
			hc.BrowserConn.Logger.Tracef("retransmiting subscription start: %v", string(subscription.Message))

			if subscription.Type == common.Streaming && subscription.StreamCursorCurrValue != nil {
				hc.BrowserConn.FromBrowserToHasuraChannel.SendWait(hc.Context, common.PatchQuerySettingLastCursorValue(subscription))
			} else {
				hc.BrowserConn.FromBrowserToHasuraChannel.SendWait(hc.Context, subscription.Message)
			}
		}
	}
}
