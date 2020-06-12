import { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Auth from '/imports/ui/services/auth';
import logger from '/imports/startup/client/logger';
import GroupChat from '/imports/api/group-chat';
import Annotations from '/imports/api/annotations';
import Users from '/imports/api/users';
import AnnotationsTextService from '/imports/ui/components/whiteboard/annotations/text/service';
import AnnotationsLocal from '/imports/ui/components/whiteboard/service';


const CHAT_CONFIG = Meteor.settings.public.chat;
const CHAT_ENABLED = CHAT_CONFIG.enabled;
const PUBLIC_GROUP_CHAT_ID = CHAT_CONFIG.public_group_id;
const PUBLIC_CHAT_TYPE = CHAT_CONFIG.type_public;
const TYPING_INDICATOR_ENABLED = CHAT_CONFIG.typingIndicator.enabled;
const SUBSCRIPTIONS = [
  'users', 'meetings', 'polls', 'presentations', 'slides', 'slide-positions', 'captions',
  'voiceUsers', 'whiteboard-multi-user', 'screenshare', 'group-chat',
  'presentation-pods', 'users-settings', 'guestUser', 'users-infos', 'note', 'meeting-time-remaining',
  'network-information', 'ping-pong', 'local-settings', 'users-typing', 'record-meetings', 'video-streams',
  'voice-call-states',
];

class Subscriptions extends Component {
  componentDidUpdate() {
    const { subscriptionsReady } = this.props;
    if (subscriptionsReady) {
      Session.set('subscriptionsReady', true);
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
    subscriptionsHandlers.push(Meteor.subscribe('users', currentUser.role, subscriptionErrorHandler));
    subscriptionsHandlers.push(Meteor.subscribe('breakouts', currentUser.role, subscriptionErrorHandler));
  }

  let groupChatMessageHandler = {};

  if (CHAT_ENABLED) {
    const chats = GroupChat.find({
      $or: [
        {
          meetingId,
          access: PUBLIC_CHAT_TYPE,
          chatId: { $ne: PUBLIC_GROUP_CHAT_ID },
        },
        { meetingId, users: { $all: [requesterUserId] } },
      ],
    }).fetch();

    const chatIds = chats.map(chat => chat.chatId);

    groupChatMessageHandler = Meteor.subscribe('group-chat-msg', chatIds, subscriptionErrorHandler);
    subscriptionsHandlers.push(groupChatMessageHandler);
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

  return {
    subscriptionsReady: ready,
    subscriptionsHandlers,
  };
})(Subscriptions);
