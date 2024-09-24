package retransmiter

import (
	"bbb-graphql-middleware/internal/common"
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
			subscription.OperationName != "getUserInfo" &&
			subscription.OperationName != "getUserCurrent" {
			hc.BrowserConn.Logger.Debugf("Skipping retransmit %s because the user is offline", subscription.OperationName)
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
