package retransmiter

import (
	"github.com/iMDT/bbb-graphql-middleware/internal/common"
	log "github.com/sirupsen/logrus"
)

func RetransmitSubscriptionStartMessages(hc *common.HasuraConnection, fromBrowserToHasuraChannel *common.SafeChannel) {
	log := log.WithField("_routine", "RetransmitSubscriptionStartMessages").WithField("browserConnectionId", hc.BrowserConn.Id).WithField("hasuraConnectionId", hc.Id)

	hc.BrowserConn.ActiveSubscriptionsMutex.RLock()
	for _, subscription := range hc.BrowserConn.ActiveSubscriptions {

		//Not retransmitting Mutations
		if subscription.Type == common.Mutation {
			continue
		}

		if subscription.LastSeenOnHasuraConnection != hc.Id {

			log.Tracef("retransmiting subscription start: %v", subscription.Message)

			if subscription.Type == common.Streaming && subscription.StreamCursorCurrValue != nil {
				fromBrowserToHasuraChannel.Send(common.PatchQuerySettingLastCursorValue(subscription))
			} else {
				fromBrowserToHasuraChannel.Send(subscription.Message)
			}
		}
	}
	hc.BrowserConn.ActiveSubscriptionsMutex.RUnlock()
}
