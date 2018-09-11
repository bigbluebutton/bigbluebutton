import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { withRouter } from 'react-router';
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
import IntlStartup from './intl';

const CHAT_CONFIG = Meteor.settings.public.chat;
const PUBLIC_GROUP_CHAT_ID = CHAT_CONFIG.public_group_id;
const PUBLIC_CHAT_TYPE = CHAT_CONFIG.type_public;

const propTypes = {
  error: PropTypes.object,
  errorCode: PropTypes.number,
  subscriptionsReady: PropTypes.bool.isRequired,
  locale: PropTypes.string,
  endedCode: PropTypes.string,
  approved: PropTypes.bool,
};

const defaultProps = {
  error: undefined,
  errorCode: undefined,
  locale: undefined,
  endedCode: undefined,
  approved: undefined,
};

class Base extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      error: props.error || null,
    };

    this.updateLoadingState = this.updateLoadingState.bind(this);
    this.updateErrorState = this.updateErrorState.bind(this);
  }

  componentWillUpdate() {
    const { approved } = this.props;
    const isLoading = this.state.loading;

    if (approved && isLoading) this.updateLoadingState(false);
  }

  updateLoadingState(loading = false) {
    this.setState({
      loading,
    });
  }

  updateErrorState(error = null) {
    this.setState({
      error,
    });
  }

  renderByState() {
    const { updateLoadingState, updateErrorState } = this;
    const stateControls = { updateLoadingState, updateErrorState };

    const { loading, error } = this.state;

    const { subscriptionsReady, errorCode } = this.props;
    const { endedCode } = this.props.params;

    if (endedCode) {
      AudioManager.exitAudio();
      return (<MeetingEnded code={endedCode} />);
    }

    if (error || errorCode) {
      logger.error(`User could not log in HTML5, hit ${errorCode}`);
      return (<ErrorScreen code={errorCode}>{error}</ErrorScreen>);
    }

    if (loading || !subscriptionsReady) {
      return (<LoadingScreen>{loading}</LoadingScreen>);
    }
    // this.props.annotationsHandler.stop();

    if (subscriptionsReady) {
      logger.info('Client loaded successfully');
    }

    return (<AppContainer {...this.props} baseControls={stateControls} />);
  }

  render() {
    const { updateLoadingState, updateErrorState } = this;
    const { locale } = this.props;
    const stateControls = { updateLoadingState, updateErrorState };

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
  'slides', 'captions', 'breakouts', 'voiceUsers', 'whiteboard-multi-user', 'screenshare',
  'group-chat', 'presentation-pods',
];

const BaseContainer = withRouter(withTracker(({ params, router }) => {
  if (params.errorCode) return params;

  const { locale } = Settings.application;
  const { credentials, loggedIn } = Auth;
  const { meetingId, requesterUserId } = credentials;

  if (!loggedIn) {
    return {
      locale,
      subscriptionsReady: false,
    };
  }

  const subscriptionErrorHandler = {
    onError: (error) => {
      logger.error(error);
      return router.push('/logout');
    },
  };

  const subscriptionsHandlers = SUBSCRIPTIONS_NAME.map(name =>
    Meteor.subscribe(name, credentials, subscriptionErrorHandler));

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
    locale,
    subscriptionsReady,
    annotationsHandler,
    groupChatMessageHandler,
  };
})(Base));

export default BaseContainer;
