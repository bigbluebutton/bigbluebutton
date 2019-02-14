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
import Meetings from '../../api/meetings';


const CHAT_CONFIG = Meteor.settings.public.chat;
const PUBLIC_GROUP_CHAT_ID = CHAT_CONFIG.public_group_id;
const PUBLIC_CHAT_TYPE = CHAT_CONFIG.type_public;

const propTypes = {
  subscriptionsReady: PropTypes.bool.isRequired,
  locale: PropTypes.string,
  approved: PropTypes.bool,
  meetingEnded: PropTypes.bool,
  meetingExist: PropTypes.bool,
};

const defaultProps = {
  locale: undefined,
  approved: undefined,
  meetingEnded: false,
  meetingExist: false,
};

class Base extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      meetingExisted: false,
    };

    this.updateLoadingState = this.updateLoadingState.bind(this);
  }

  componentDidUpdate(prevProps, prevState) {
    const {
      ejected,
      approved,
      meetingExist,
      animations,
      meteorIsConnected,
    } = this.props;
    const { loading, meetingExisted } = this.state;

    if (!prevProps.meetingExist && meetingExist) {
      Session.set('isMeetingEnded', false);
    }

    if (prevProps.meetingExist && !meetingExist) {
      Session.set('isMeetingEnded', true);
      this.setMeetingExisted(true);
    }

    // In case the meeting delayed to load
    if (!meetingExist) return;

    if (approved && loading) this.updateLoadingState(false);

    if (prevProps.ejected || ejected) {
      Session.set('codeError', '403');
      Session.set('isMeetingEnded', true);
    }

    // In case the meteor restart avoid error log
    if (meteorIsConnected && (prevState.meetingExisted !== meetingExisted)) {
      this.setMeetingExisted(false);
    }

    if (animations && animations !== prevProps.animations) {
      document.documentElement.style.setProperty('--enableAnimation', 1);
    } else if (!animations && animations !== prevProps.animations) {
      document.documentElement.style.setProperty('--enableAnimation', 0);
    }
  }

  setMeetingExisted(meetingExisted) {
    this.setState({ meetingExisted });
  }

  updateLoadingState(loading = false) {
    this.setState({
      loading,
    });
  }

  renderByState() {
    const { updateLoadingState } = this;
    const stateControls = { updateLoadingState };

    const { loading, meetingExisted } = this.state;

    const codeError = Session.get('codeError');
    const {
      subscriptionsReady,
      meetingExist,
    } = this.props;

    if (meetingExisted && !meetingExist) {
      AudioManager.exitAudio();
      return (<MeetingEnded code={Session.get('codeError')} />);
    }

    if (codeError) {
      logger.error({ logCode: 'startup_client_usercouldnotlogin_error' }, `User could not log in HTML5, hit ${codeError}`);
      return (<ErrorScreen code={codeError} />);
    }

    if (loading || !subscriptionsReady) {
      return (<LoadingScreen>{loading}</LoadingScreen>);
    }
    // this.props.annotationsHandler.stop();

    if (subscriptionsReady) {
      logger.info({ logCode: 'startup_client_subscriptions_ready' }, 'Subscriptions are ready');
    }

    return (<AppContainer {...this.props} baseControls={stateControls} />);
  }

  render() {
    const { updateLoadingState } = this;
    const { locale, meetingExist } = this.props;
    const stateControls = { updateLoadingState };
    const { meetingExisted } = this.state;

    return (
      (!meetingExisted && !meetingExist && Auth.loggedIn)
        ? <LoadingScreen />
        : (
          <IntlStartup locale={locale} baseControls={stateControls}>
            {this.renderByState()}
          </IntlStartup>
        )
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
  const { locale, animations } = Settings.application;
  const { credentials, loggedIn } = Auth;
  const { meetingId, requesterUserId } = credentials;
  let breakoutRoomSubscriptionHandler;

  const subscriptionErrorHandler = {
    onError: (error) => {
      logger.error({ logCode: 'startup_client_subscription_error' }, error);
      Session.set('isMeetingEnded', true);
      Session.set('codeError', error.error);
    },
  };

  const subscriptionsHandlers = SUBSCRIPTIONS_NAME
    .map(name => Meteor.subscribe(name, credentials, subscriptionErrorHandler));

  const subscriptionsReady = subscriptionsHandlers.every(handler => handler.ready())
    && loggedIn;

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

  return {
    approved: Users.findOne({ userId: Auth.userID, approved: true, guest: true }),
    ejected: Users.findOne({ userId: Auth.userID, ejected: true }),
    meetingEnded: Session.get('isMeetingEnded'),
    locale,
    subscriptionsReady,
    annotationsHandler,
    groupChatMessageHandler,
    breakoutRoomSubscriptionHandler,
    animations,
    meetingExist: !!Meetings.findOne({ meetingId }),
    User,
    meteorIsConnected: Meteor.status().connected,
  };
})(Base);

export default BaseContainer;
