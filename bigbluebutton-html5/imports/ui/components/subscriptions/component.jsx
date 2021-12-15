import { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Auth from '/imports/ui/services/auth';
import logger from '/imports/startup/client/logger';
import GroupChat from '/imports/api/group-chat';
import Annotations from '/imports/api/annotations';
import Users from '/imports/api/users';
import AnnotationsTextService from '/imports/ui/components/whiteboard/annotations/text/service';
import { Annotations as AnnotationsLocal } from '/imports/ui/components/whiteboard/service';


const CHAT_CONFIG = Meteor.settings.public.chat;
const CHAT_ENABLED = CHAT_CONFIG.enabled;
const PUBLIC_GROUP_CHAT_ID = CHAT_CONFIG.public_group_id;
const PUBLIC_CHAT_TYPE = CHAT_CONFIG.type_public;
const TYPING_INDICATOR_ENABLED = CHAT_CONFIG.typingIndicator.enabled;
const SUBSCRIPTIONS = [
  'users', 'meetings', 'polls', 'presentations', 'slides', 'slide-positions', 'captions',
  'voiceUsers', 'whiteboard-multi-user', 'screenshare', 'group-chat',
  'presentation-pods', 'users-settings', 'guestUser', 'users-infos', 'note', 'meeting-time-remaining',
  'local-settings', 'users-typing', 'record-meetings', 'video-streams',
  'connection-status', 'voice-call-states', 'external-video-meetings',
];

const EVENT_NAME = 'bbb-group-chat-messages-subscription-has-stoppped';
const EVENT_NAME_SUBSCRIPTION_READY = 'bbb-group-chat-messages-subscriptions-ready';

class Subscriptions extends Component {
  componentDidUpdate() {
    const { subscriptionsReady } = this.props;
    if (subscriptionsReady) {
      Session.set('subscriptionsReady', true);
      const event = new Event(EVENT_NAME_SUBSCRIPTION_READY);
      window.dispatchEvent(event);
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
  if (Session.get('codeError')) {
    return {
      subscriptionsReady: true,
    };
  }

  const currentUser = Users.findOne({ intId: requesterUserId }, { fields: { role: 1 } });

  const subscriptionErrorHandler = {
    onError: (error) => {
      logger.error({
        logCode: 'startup_client_subscription_error',
        extraInfo: { error },
      }, 'Error while subscribing to collections');
      Session.set('codeError', error.error);
    },
  };

  let subscriptionsHandlers = SUBSCRIPTIONS.map((name) => {
    if ((!TYPING_INDICATOR_ENABLED && name.indexOf('typing') !== -1)
      || (!CHAT_ENABLED && name.indexOf('chat') !== -1)) return;

    return Meteor.subscribe(name, subscriptionErrorHandler);
  });

  if (currentUser) {
    subscriptionsHandlers.push(Meteor.subscribe('meetings', currentUser.role, subscriptionErrorHandler));
    subscriptionsHandlers.push(Meteor.subscribe('users', currentUser.role, {
      ...subscriptionErrorHandler,
      onStop: () => {
        const event = new Event(EVENT_NAME);
        window.dispatchEvent(event);
      },
    }));
    subscriptionsHandlers.push(Meteor.subscribe('breakouts', currentUser.role, subscriptionErrorHandler));
    subscriptionsHandlers.push(Meteor.subscribe('guestUser', currentUser.role, subscriptionErrorHandler));
  }

  const annotationsHandler = Meteor.subscribe('annotations', {
    onReady: () => {
      const activeTextShapeId = AnnotationsTextService.activeTextShapeId();
      AnnotationsLocal.remove({ id: { $ne: `${activeTextShapeId}-fake` } });
      Annotations.find({ id: { $ne: activeTextShapeId } }, { reactive: false }).forEach((a) => {
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

  subscriptionsHandlers = subscriptionsHandlers.filter(obj => obj);
  const ready = subscriptionsHandlers.every(handler => handler.ready());
  let groupChatMessageHandler = {};

  if (CHAT_ENABLED && ready) {
    const chatsCount = GroupChat.find({
      $or: [
        {
          meetingId,
          access: PUBLIC_CHAT_TYPE,
          chatId: { $ne: PUBLIC_GROUP_CHAT_ID },
        },
        { meetingId, users: { $all: [requesterUserId] } },
      ],
    }).count();

    const subHandler = {
      ...subscriptionErrorHandler,
    };

    groupChatMessageHandler = Meteor.subscribe('group-chat-msg', chatsCount, subHandler);
  }

  // TODO: Refactor all the late subscribers
  let usersPersistentDataHandler = {};
  if (ready) {
    usersPersistentDataHandler = Meteor.subscribe('users-persistent-data');
  }

  return {
    subscriptionsReady: ready,
    subscriptionsHandlers,
  };
})(Subscriptions);
