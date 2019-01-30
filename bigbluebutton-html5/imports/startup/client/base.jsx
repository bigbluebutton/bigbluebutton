import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';
import Auth from '/imports/ui/services/auth';
import AppContainer from '/imports/ui/components/app/container';
import ErrorScreen from '/imports/ui/components/error-screen/component';
import MeetingEnded from '/imports/ui/components/meeting-ended/component';
import LoadingScreen from '/imports/ui/components/loading-screen/component';
import Settings from '/imports/ui/services/settings';
import AudioManager from '/imports/ui/services/audio-manager';
import logger from '/imports/startup/client/logger';
import Users from '/imports/api/users';
import Annotations from '/imports/api/annotations';
import AnnotationsLocal from '/imports/ui/components/whiteboard/service';
import GroupChat from '/imports/api/group-chat';
import mapUser from '/imports/ui/services/user/mapUser';
import { Session } from 'meteor/session';
import IntlStartup from './intl';

const CHAT_CONFIG = Meteor.settings.public.chat;
const PUBLIC_GROUP_CHAT_ID = CHAT_CONFIG.public_group_id;
const PUBLIC_CHAT_TYPE = CHAT_CONFIG.type_public;

const propTypes = {
  subscriptionsReady: PropTypes.bool.isRequired,
  locale: PropTypes.string,
  approved: PropTypes.bool,
  meetingEnded: PropTypes.bool,
};

const defaultProps = {
  locale: undefined,
  approved: undefined,
  meetingEnded: false,
};

class Base extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
    };

    this.updateLoadingState = this.updateLoadingState.bind(this);
  }

  componentDidUpdate(prevProps) {
    const { ejected, approved } = this.props;
    const { loading } = this.state;

    if (approved && loading) this.updateLoadingState(false);

    if (prevProps.ejected || ejected) {
      Session.set('codeError', '403');
      Session.set('isMeetingEnded', true);
    }
  }

  updateLoadingState(loading = false) {
    this.setState({
      loading,
    });
  }

  renderByState() {
    const { updateLoadingState } = this;
    const stateControls = { updateLoadingState };

    const { loading } = this.state;

    const codeError = Session.get('codeError');
    const { subscriptionsReady, meetingEnded } = this.props;

    if (meetingEnded) {
      AudioManager.exitAudio();
      return (<MeetingEnded code={Session.get('codeError')} />);
    }

    if (codeError) {
      logger.error(`User could not log in HTML5, hit ${codeError}`);
      return (<ErrorScreen code={codeError} />);
    }

    if (loading || !subscriptionsReady) {
      return (<LoadingScreen>{loading}</LoadingScreen>);
    }
    // this.props.annotationsHandler.stop();

    if (subscriptionsReady) {
      logger.info('Subscriptions are ready');
    }

    return (<AppContainer {...this.props} baseControls={stateControls} />);
  }

  render() {
    const { updateLoadingState } = this;
    const { locale } = this.props;
    const stateControls = { updateLoadingState };

    return (
      <IntlStartup locale={locale} baseControls={stateControls}>
        {this.renderByState()}
      </IntlStartup>
    );
  }
}

Base.propTypes = propTypes;
Base.defaultProps = defaultProps;

const SUBSCRIPTIONS_NAME = [
  'users', 'meetings', 'polls', 'presentations',
  'slides', 'captions', 'voiceUsers', 'whiteboard-multi-user', 'screenshare',
  'group-chat', 'presentation-pods', 'users-settings',
];

const BaseContainer = withTracker(() => {
  const { locale } = Settings.application;
  const { credentials, loggedIn } = Auth;
  const { meetingId, requesterUserId } = credentials;
  let breakoutRoomSubscriptionHandler;
  if (!loggedIn) {
    return {
      locale,
      subscriptionsReady: false,
    };
  }

  const subscriptionErrorHandler = {
    onError: (error) => {
      logger.error(error);
      Session.set('isMeetingEnded', true);
      Session.set('codeError', error.error);
    },
  };

  const subscriptionsHandlers = SUBSCRIPTIONS_NAME
    .map(name => Meteor.subscribe(name, credentials, subscriptionErrorHandler));

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

  const groupChatMessageHandler = Meteor.subscribe('group-chat-msg', credentials, chatIds, subscriptionErrorHandler);
  const User = Users.findOne({ intId: credentials.requesterUserId });

  if (User) {
    const mappedUser = mapUser(User);
    breakoutRoomSubscriptionHandler = Meteor.subscribe('breakouts', credentials, mappedUser.isModerator, subscriptionErrorHandler);
  }

  const annotationsHandler = Meteor.subscribe('annotations', credentials, {
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

  const subscriptionsReady = subscriptionsHandlers.every(handler => handler.ready());
  return {
    approved: Users.findOne({ userId: Auth.userID, approved: true, guest: true }),
    ejected: Users.findOne({ userId: Auth.userID, ejected: true }),
    meetingEnded: Session.get('isMeetingEnded'),
    locale,
    subscriptionsReady,
    annotationsHandler,
    groupChatMessageHandler,
    breakoutRoomSubscriptionHandler,
  };
})(Base);

export default BaseContainer;
