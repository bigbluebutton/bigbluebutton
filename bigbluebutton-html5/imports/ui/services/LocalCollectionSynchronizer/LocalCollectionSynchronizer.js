import SubscriptionRegistry from '/imports/ui/services/subscription-registry/subscriptionRegistry';
import CollectionEventsBroker from '/imports/ui/services/LiveDataEventBroker/LiveDataEventBroker';

/*
This class connects a local collection with the LiveDataEventBroker, propagating the changes of a server-side published cursor to a local collection.

It also guarantee that in case of a reconnection or a re-subscription, the data is only removed after subscription is ready, avoiding the situation of missing data during re-synchronization.
*/

class LocalCollectionSynchronizer {
  constructor(serverCollection, localCollection, options = {}) {
    this.serverCollection = serverCollection;
    this.localCollection = localCollection;

    this.lastSubscriptionId = '';
    this.options = options;
    this.ignoreDeletes = false;
    this.checkForStaleData = this.checkForStaleData.bind(this);
  }

  /*
  This method allow to enable/disable the ignoreDeletes feature.
  When enabled, system will skip the received deletes ( not apply on local collection ).
  Don't panic: these deletes will be processed when the subscription gets ready - see removeOldSubscriptionData method.
  */
  setIgnoreDeletes(value) {
    this.ignoreDeletes = value;
  }

  // Replicates remote collection to local collection ( avoiding cleanup during the forced resync )
  setupListeners() {
    const self = this;

    const addedCallback = function (item) {
      if (item.id === 'publication-stop-marker' && item.stopped) {
        self.ignoreDeletes = true;
        return;
      }

      self.checkForStaleData();
      const selector = { referenceId: item.referenceId };
      const itemExistInCollection = self.localCollection.findOne(selector);

      const { _id, ...restItem } = item;
      const payload = {
        subscriptionId: self.lastSubscriptionId,
        ...restItem,
      };

      if (itemExistInCollection) {
        self.localCollection.update(selector, payload);
      } else {
        self.localCollection.insert(payload);
      }
    };

    const changedCallback = function (item) {
      const {
        _id,
        ...restFields
      } = item;
      const selector = { referenceId: item.referenceId };
      const payload = {
        $set: {
          ...restFields,
          subscriptionId: self.lastSubscriptionId,
        },
      };
      self.localCollection.update(selector, payload);
    };

    const removedCallback = function (item) {
      const globalIgnoreDeletes = Session.get('globalIgnoreDeletes');
      if (self.ignoreDeletes || globalIgnoreDeletes) {
        return;
      }
      const selector = { referenceId: item.referenceId };

      self.localCollection.remove(selector);
    };

    CollectionEventsBroker.addListener(this.serverCollection._name, 'added', addedCallback);
    CollectionEventsBroker.addListener(this.serverCollection._name, 'changed', changedCallback);
    CollectionEventsBroker.addListener(this.serverCollection._name, 'removed', removedCallback);
  }

  /*
  This method calls the function received as parameter when the subscription gets ready.
*/
  callWhenSubscriptionReady(func) {
    const temp = (res) => {
      setTimeout(() => {
        const subscription = SubscriptionRegistry.getSubscription(this.serverCollection._name);
        if (subscription.ready()) {
          func();
          return res();
        }
        return temp(res);
      }, 100);
    };
    const tempPromise = new Promise((res) => {
      temp(res);
    });
    return tempPromise;
  }

  checkForStaleData() {
    const subscription = SubscriptionRegistry.getSubscription(this.serverCollection._name);

    // If the subscriptionId changes means the subscriptions was redone
    // or theres more than one subscription per collection
    if (subscription && (this.lastSubscriptionId !== subscription.subscriptionId)) {
      const wasEmpty = this.lastSubscriptionId === '';
      this.lastSubscriptionId = subscription.subscriptionId;
      if (!wasEmpty) {
        this.callWhenSubscriptionReady(() => {
          this.ignoreDeletes = false;
          Session.set('globalIgnoreDeletes', false);
          this.removeOldSubscriptionData();
        });
      }
    }
  }

  /*
  This method removes data from previous subscriptions after the current one is ready.
  */
  removeOldSubscriptionData() {
    const subscription = SubscriptionRegistry.getSubscription(this.serverCollection._name);

    const selector = {
      subscriptionId: {
        $nin: [subscription.subscriptionId],
      },
    };

    const oldSubscriptionItems = this.localCollection.find(selector).fetch();
    oldSubscriptionItems.forEach((item) => {
      this.localCollection.remove({
        meetingId: item.meetingId,
        ...selector,
      });
    });
  }
}

export default LocalCollectionSynchronizer;
