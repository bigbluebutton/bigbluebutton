package retransmiter

import (
	"bbb-graphql-middleware/config"
	"bbb-graphql-middleware/internal/common"
	"slices"
)

func RetransmitSubscriptionStartMessages(hc *common.HasuraConnection) {
	hc.BrowserConn.ActiveSubscriptionsMutex.RLock()
	defer hc.BrowserConn.ActiveSubscriptionsMutex.RUnlock()

	userCurrentlyInMeeting := false
	if hasuraRole, exists := hc.BrowserConn.BBBWebSessionVariables["x-hasura-role"]; exists {
		userCurrentlyInMeeting = hasuraRole == "bbb_client"
	}

	for _, subscription := range hc.BrowserConn.ActiveSubscriptions {
		//Not retransmitting Mutations
		if subscription.Type == common.Mutation {
			continue
		}

		//When user left the meeting, Retransmit only Presence Manager subscriptions
		if !userCurrentlyInMeeting &&
			!slices.Contains(config.AllowedSubscriptionsForNotInMeetingUsers, subscription.OperationName) {
			hc.BrowserConn.Logger.Debugf("Skipping retransmit %s because the user is not in meeting", subscription.OperationName)
			continue
		}

		if subscription.LastSeenOnHasuraConnection != hc.Id {
			hc.BrowserConn.Logger.Tracef("retransmiting subscription start: %v", string(subscription.Message))

			if subscription.Type == common.Streaming && subscription.StreamCursorCurrValue != nil {
				hc.BrowserConn.FromBrowserToHasuraChannel.Send(common.PatchQuerySettingLastCursorValue(subscription))
			} else {
				hc.BrowserConn.FromBrowserToHasuraChannel.Send(subscription.Message)
			}
		}
	}

}
