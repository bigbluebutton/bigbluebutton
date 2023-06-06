import { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Auth from '/imports/ui/services/auth';
import logger from '/imports/startup/client/logger';
import GroupChat from '/imports/api/group-chat';
import Annotations from '/imports/api/annotations';
import Users from '/imports/api/users';
import { Annotations as AnnotationsLocal } from '/imports/ui/components/whiteboard/service';
import {
  localCollectionRegistry,
} from '/client/collection-mirror-initializer';
import SubscriptionRegistry, { subscriptionReactivity } from '../../services/subscription-registry/subscriptionRegistry';
import { isChatEnabled } from '/imports/ui/services/features';

const CHAT_CONFIG = Meteor.settings.public.chat;
const PUBLIC_GROUP_CHAT_ID = CHAT_CONFIG.public_group_id;
const PUBLIC_CHAT_TYPE = CHAT_CONFIG.type_public;
const TYPING_INDICATOR_ENABLED = CHAT_CONFIG.typingIndicator.enabled;
const SUBSCRIPTIONS = [
  'users', 'meetings', 'polls', 'presentations', 'slides', 'slide-positions', 'captions',
  'voiceUsers', 'whiteboard-multi-user', 'screenshare', 'group-chat',
  'presentation-pods', 'users-settings', 'guestUser', 'users-infos', 'meeting-time-remaining',
  'local-settings', 'users-typing', 'record-meetings', 'video-streams',
  'connection-status', 'voice-call-states', 'external-video-meetings', 'breakouts', 'breakouts-history',
  'pads', 'pads-sessions', 'pads-updates', 'notifications', 'audio-captions',
  'layout-meetings', 'user-reaction',
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
  componentDidUpdate() {
    const { subscriptionsReady } = this.props;
    if (subscriptionsReady) {
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
  const { meetingId, requesterUserId } = credentials;
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
      logger.error({
        logCode: 'startup_client_subscription_error',
        extraInfo: { error },
      }, 'Error while subscribing to collections');
      Session.set('codeError', error.error);
    },
  };

  const currentUser = Users.findOne({ intId: requesterUserId }, { fields: { role: 1 } });

  let subscriptionsHandlers = SUBSCRIPTIONS.map((name) => {
    let subscriptionHandlers = subscriptionErrorHandler;
    if ((!TYPING_INDICATOR_ENABLED && name.indexOf('typing') !== -1)
      || (!isChatEnabled() && name.indexOf('chat') !== -1)) return null;

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

  if (currentUser && (oldRole !== currentUser?.role)) {
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
        SubscriptionRegistry.getSubscription('breakouts-history'),
        SubscriptionRegistry.getSubscription('connection-status'),
        SubscriptionRegistry.getSubscription('guestUser'),
      ].forEach((item) => {
        if (item) item.stop();
      });
    }
    oldRole = currentUser?.role;
  }

  subscriptionsHandlers = subscriptionsHandlers.filter(obj => obj);
  const ready = subscriptionsHandlers.every(handler => handler.ready());
  let groupChatMessageHandler = {};

  if (isChatEnabled() && ready) {
    const subHandler = {
      ...subscriptionErrorHandler,
    };

    groupChatMessageHandler = Meteor.subscribe('group-chat-msg', subHandler);
  }

  // TODO: Refactor all the late subscribers
  let usersPersistentDataHandler = {};
  if (ready) {
    usersPersistentDataHandler = Meteor.subscribe('users-persistent-data');
    const annotationsHandler = Meteor.subscribe('annotations', {
      onReady: () => {
        AnnotationsLocal.remove({});
        Annotations.find({}, { reactive: false }).forEach((a) => {
          try {
            AnnotationsLocal.insert(a);
          } catch (e) {
            // TODO
          }
        });
        annotationsHandler.stop();
      },
      ...subscriptionErrorHandler,
    });

    Object.values(localCollectionRegistry).forEach(
      (localCollection) => localCollection.checkForStaleData(),
    );
  }

  return {
    subscriptionsReady: ready,
    subscriptionsHandlers,
  };
})(Subscriptions);
