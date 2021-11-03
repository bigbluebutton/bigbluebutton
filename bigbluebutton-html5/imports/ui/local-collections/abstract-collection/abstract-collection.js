import SubscriptionRegistry from '/imports/ui/services/subscription-registry/subscriptionRegistry';
import CollectionEventsBroker from '/imports/ui/services/collection-hooks-callbacks/collection-hooks-callbacks';

class AbstractCollection {
  constructor(serverCollection, localCollection, options = {}) {
    this.serverCollection = serverCollection;
    this.localCollection = localCollection;

    this.lastSubscriptionId = '';
    this.options = options;
    this.ignoreDeletes = false;
    this.createObserver();
  }

  setIgnoreDeletes(value) {
    this.ignoreDeletes = value;
  }

  // Replicates remote collection to local collection ( avoiding cleanup during the forced resync )
  createObserver() {
    const self = this;

    const addedCallback = function (item) {
      const subscription = SubscriptionRegistry
        .getSubscription(self.serverCollection._name);

      if (item.id === 'publication-stop-marker' && item.stopped) {
        self.ignoreDeletes = true;
        return;
      }
      // If the subscriptionId changes means the subscriptions was redone
      // or theres more than one subscription per collection
      if (subscription && (self.lastSubscriptionId !== subscription.subscriptionId)) {
        const wasEmpty = self.lastSubscriptionId === '';
        self.lastSubscriptionId = subscription.subscriptionId;
        if (!wasEmpty) {
          self.PollForReadyStatus(() => {
            self.ignoreDeletes = false;
            self.removeOldSubscriptionData();
          });
        }
      }

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
      if (self.ignoreDeletes) {
        return;
      }
      const selector = { referenceId: item.referenceId };

      self.localCollection.remove(selector);
    };

    CollectionEventsBroker.addListener(this.serverCollection._name, 'added', addedCallback);
    CollectionEventsBroker.addListener(this.serverCollection._name, 'changed', changedCallback);
    CollectionEventsBroker.addListener(this.serverCollection._name, 'removed', removedCallback);
  }

  PollForReadyStatus(func) {
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

export default AbstractCollection;
