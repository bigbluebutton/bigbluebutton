import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Auth from '/imports/ui/services/auth';
import logger from '/imports/startup/client/logger';
import GroupChat from '/imports/api/group-chat';
import Users from '/imports/api/users';
import Annotations from '/imports/api/annotations';
import AnnotationsTextService from '/imports/ui/components/whiteboard/annotations/text/service';
import AnnotationsLocal from '/imports/ui/components/whiteboard/service';
import mapUser from '/imports/ui/services/user/mapUser';

const CHAT_CONFIG = Meteor.settings.public.chat;
const PUBLIC_GROUP_CHAT_ID = CHAT_CONFIG.public_group_id;
const PUBLIC_CHAT_TYPE = CHAT_CONFIG.type_public;
const SUBSCRIPTIONS = [
  'users', 'meetings', 'polls', 'presentations', 'slides', 'captions',
  'voiceUsers', 'whiteboard-multi-user', 'screenshare', 'group-chat',
  'presentation-pods', 'users-settings', 'guestUser', 'users-infos',
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

  const subscriptionErrorHandler = {
    onError: (error) => {
      logger.error({ logCode: 'startup_client_subscription_error' }, error);
      Session.set('codeError', error.error);
    },
  };

  const subscriptionsHandlers = SUBSCRIPTIONS.map(name => Meteor.subscribe(name, credentials, subscriptionErrorHandler));

  let groupChatMessageHandler = {};
  // let annotationsHandler = {};

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
  groupChatMessageHandler = Meteor.subscribe('group-chat-msg', credentials, chatIds, subscriptionErrorHandler);
  subscriptionsHandlers.push(groupChatMessageHandler);
  const User = Users.findOne({ intId: requesterUserId });

  if (User) {
    const mappedUser = mapUser(User);
    Meteor.subscribe('users', credentials, mappedUser.isModerator, subscriptionErrorHandler);
    Meteor.subscribe('breakouts', credentials, mappedUser.isModerator, subscriptionErrorHandler);
    Meteor.subscribe('meetings', credentials, mappedUser.isModerator, subscriptionErrorHandler);
  }

  const annotationsHandler = Meteor.subscribe('annotations', credentials, {
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

  const ready = subscriptionsHandlers.every(handler => handler.ready());

  return {
    subscriptionsReady: ready,
    subscriptionsHandlers,
  };
})(Subscriptions);
