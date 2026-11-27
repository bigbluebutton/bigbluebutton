package retransmiter

import (
	"slices"

	"bbb-graphql-middleware/config"
	"bbb-graphql-middleware/internal/common"
)

func RetransmitSubscriptionStartMessages(hc *common.HasuraConnection) {
	// Read before taking the subscriptions lock, so this pass sees one consistent value and does
	// not nest the connection lock inside another.
	currentlyInMeeting := hc.BrowserConn.IsCurrentlyInMeeting()

	hc.BrowserConn.ActiveSubscriptionsMutex.RLock()
	subscriptionsToProcess := make(map[string]common.GraphQlSubscription, 0)
	for queryId, subscription := range hc.BrowserConn.ActiveSubscriptions {
		// Not retransmitting Mutations
		if subscription.Type == common.Mutation {
			continue
		}

		// When user left the meeting, Retransmit only Presence Manager subscriptions
		if !currentlyInMeeting &&
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

			// The resend carries the type and the name stored when the subscription started, so the
			// writer does not decide them again.
			resend := &common.BrowserMessage{
				Raw: subscription.Message,
				Operation: &common.Operation{
					Type:      subscription.Type,
					Name:      subscription.OperationName,
					Streaming: subscription.StreamCursorField != "",
				},
			}
			if subscription.Type == common.Streaming && subscription.StreamCursorCurrValue != nil {
				resend.Raw = common.PatchQuerySettingLastCursorValue(subscription)
			}
			queued := hc.BrowserConn.FromBrowserToHasuraChannel.SendWait(hc.Context, resend)

			// Counted once queued: a resend the connection did not take (it ended meanwhile) is
			// resent, and counted, by the next connection.
			if queued {
				common.GqlSubscriptionRetransmittedCounter.
					WithLabelValues(string(subscription.Type), subscription.MetricLabel()).
					Inc()
			}
		}
	}
}
