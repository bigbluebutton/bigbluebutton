import { Tracker } from 'meteor/tracker';

export const subscriptionReactivity = new Tracker.Dependency();
// Create the subscription and store its data to use in the client (E.G. subscriptionId)
class SubscriptionRegistry {
  constructor() {
    this.registry = {};
  }

  createSubscription(subscription, options, ...params) {
    const opt = { ...options };
    opt.onStop = () => {
      subscriptionReactivity.changed();
      if (options.onStop) options.onStop();
      this.registry[subscription] = null;
    };
    this.registry[subscription] = Meteor.subscribe(subscription, ...params, opt);
    return this.registry[subscription];
  }

  getSubscription(name) {
    return this.registry[name];
  }
}

export default new SubscriptionRegistry();
