package replayer

import (
	"github.com/iMDT/bbb-graphql-middleware/internal/common"
	log "github.com/sirupsen/logrus"
)

func ReplaySubscriptionStartMessages(hc *common.HasuraConnection, fromBrowserChannel chan interface{}) {
	log := log.WithField("_routine", "ReplaySubscriptionStartMessages").WithField("browserConnectionId", hc.Browserconn.Id).WithField("hasuraConnectionId", hc.Id)

	hc.Browserconn.ActiveSubscriptionsMutex.Lock()
	for _, subscription := range hc.Browserconn.ActiveSubscriptions {
		if subscription.LastSeenOnHasuraConnetion != hc.Id {
			log.Tracef("replaying subscription start: %v", subscription.Message)
			fromBrowserChannel <- subscription.Message
		}
	}
	hc.Browserconn.ActiveSubscriptionsMutex.Unlock()
}
