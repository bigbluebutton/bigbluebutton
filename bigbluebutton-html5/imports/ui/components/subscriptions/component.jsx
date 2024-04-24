import { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Auth from '/imports/ui/services/auth';
import logger from '/imports/startup/client/logger';
import Users from '/imports/api/users';
import { localCollectionRegistry } from '/client/collection-mirror-initializer';
import SubscriptionRegistry, {
  subscriptionReactivity,
} from '../../services/subscription-registry/subscriptionRegistry';
import { isChatEnabled } from '/imports/ui/services/features';

const CHAT_CONFIG = window.meetingClientSettings.public.chat;
const TYPING_INDICATOR_ENABLED = CHAT_CONFIG.typingIndicator.enabled;
const SUBSCRIPTIONS = [
  // 'users',
  // 'meetings',
  // 'captions',
  // 'voiceUsers',
  // 'screenshare',
  'users-settings',
  'users-infos',
  'meeting-time-remaining',
  // 'record-meetings',
  'video-streams',
  'voice-call-states',
  // 'breakouts',
  // 'breakouts-history',
  'pads',
  'pads-sessions',
  'pads-updates',
  // 'notifications',
  'layout-meetings',
  'user-reaction',
  'timer',
];
const {
  localBreakoutsSync,
  localBreakoutsHistorySync,
  localGuestUsersSync,
  localMeetingsSync,
  localUsersSync,
} = localCollectionRegistry;

const EVENT_NAME = 'bbb-group-chat-messages-subscription-has-stoppped';
const EVENT_NAME_SUBSCRIPTION_READY = 'bbb-group-chat-messages-subscriptions-ready';

let oldRole = '';

class Subscriptions extends Component {
  componentDidMount() {
    Session.set('subscriptionsReady', false);
  }

  componentDidUpdate() {
    const { subscriptionsReady } = this.props;
    const clientSettings = JSON.parse(sessionStorage.getItem('clientStartupSettings') || '{}')
    console.log('clientSettings', clientSettings);
    if (subscriptionsReady || clientSettings.skipMeteorConnection) {
      Session.set('subscriptionsReady', true);
      const event = new Event(EVENT_NAME_SUBSCRIPTION_READY);
      window.dispatchEvent(event);
      Session.set('globalIgnoreDeletes', false);
    }
  }

  render() {
    const { children } = this.props;
    return children;
  }
}

export default withTracker(() => {
  const { credentials } = Auth;
  const { requesterUserId } = credentials;
  const clientSettings = JSON.parse(sessionStorage.getItem('clientStartupSettings') || '{}');
  const userWillAuth = Session.get('userWillAuth');
  // This if exist because when a unauth user try to subscribe to a publisher
  // it returns a empty collection to the subscription
  // and not rerun when the user is authenticated
  if (userWillAuth) return {};

  if (Session.get('codeError')) {
    return {
      subscriptionsReady: true,
    };
  }

  const subscriptionErrorHandler = {
    onError: (error) => {
      logger.error(
        {
          logCode: 'startup_client_subscription_error',
          extraInfo: { error },
        },
        'Error while subscribing to collections'
      );
      console.log('-------------------------', {error});
      Session.set('codeError', error.error);
    },
  };

  const currentUser = Users.findOne({ userId: requesterUserId }, { fields: { role: 1 } });

  let subscriptionsHandlers = SUBSCRIPTIONS.map((name) => {
    if (clientSettings.skipMeteorConnection) return null;
    let subscriptionHandlers = subscriptionErrorHandler;
    if (
      (!TYPING_INDICATOR_ENABLED && name.indexOf('typing') !== -1) ||
      (!isChatEnabled() && name.indexOf('chat') !== -1)
    )
      return null;

    if (name === 'users') {
      subscriptionHandlers = {
        ...subscriptionHandlers,
        onStop: () => {
          const event = new Event(EVENT_NAME);
          window.dispatchEvent(event);
        },
      };
    }

    return SubscriptionRegistry.createSubscription(name, subscriptionHandlers);
  });

  if (currentUser && oldRole !== currentUser?.role) {
    // stop subscription from the client-side as the server-side only watch moderators
    if (oldRole === 'VIEWER' && currentUser?.role === 'MODERATOR') {
      // let this withTracker re-execute when a subscription is stopped
      subscriptionReactivity.depend();
      localBreakoutsSync.setIgnoreDeletes(true);
      localBreakoutsHistorySync.setIgnoreDeletes(true);
      localGuestUsersSync.setIgnoreDeletes(true);
      localMeetingsSync.setIgnoreDeletes(true);
      localUsersSync.setIgnoreDeletes(true);
      // Prevent data being removed by subscription stop
      // stop role dependent subscriptions
      [
        SubscriptionRegistry.getSubscription('meetings'),
        SubscriptionRegistry.getSubscription('users'),
        SubscriptionRegistry.getSubscription('breakouts'),
        // SubscriptionRegistry.getSubscription('breakouts-history'),
        SubscriptionRegistry.getSubscription('guestUser'),
      ].forEach((item) => {
        if (item) item.stop();
      });
    }
    oldRole = currentUser?.role;
  }

  subscriptionsHandlers = subscriptionsHandlers.filter((obj) => obj);
  const ready = subscriptionsHandlers
    .every((handler) => handler.ready() || clientSettings.skipMeteorConnection);
  // TODO: Refactor all the late subscribers
  if (ready) {
    Object.values(localCollectionRegistry).forEach((localCollection) =>
      localCollection.checkForStaleData()
    );
  }
  

  return {
    subscriptionsReady: ready,
    subscriptionsHandlers,
  };
})(Subscriptions);
