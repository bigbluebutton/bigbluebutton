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
import AppService from '/imports/ui/components/app/service';
import AnnotationsTextService from '/imports/ui/components/whiteboard/annotations/text/service';


const CHAT_CONFIG = Meteor.settings.public.chat;
const PUBLIC_GROUP_CHAT_ID = CHAT_CONFIG.public_group_id;
const PUBLIC_CHAT_TYPE = CHAT_CONFIG.type_public;

const propTypes = {
  subscriptionsReady: PropTypes.bool.isRequired,
  locale: PropTypes.string,
  approved: PropTypes.bool,
  meetingIsEnded: PropTypes.bool,
  meetingExist: PropTypes.bool,
};

const defaultProps = {
  locale: undefined,
  approved: undefined,
  meetingIsEnded: false,
  meetingExist: false,
};

const fullscreenChangedEvents = [
  'fullscreenchange',
  'webkitfullscreenchange',
  'mozfullscreenchange',
  'MSFullscreenChange',
];

class Base extends Component {
  static handleFullscreenChange() {
    if (document.fullscreenElement
      || document.webkitFullscreenElement
      || document.mozFullScreenElement
      || document.msFullscreenElement) {
      Session.set('isFullscreen', true);
    } else {
      Session.set('isFullscreen', false);
    }
  }

  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      meetingExisted: false,
      isBreakout: false,
    };

    this.updateLoadingState = this.updateLoadingState.bind(this);
  }

  componentDidMount() {
    fullscreenChangedEvents.forEach((event) => {
      document.addEventListener(event, Base.handleFullscreenChange);
    });
    Session.set('isFullscreen', false);
  }

  componentDidUpdate(prevProps, prevState) {
    const {
      approved,
      meetingExist,
      animations,
      meteorIsConnected,
      subscriptionsReady,
    } = this.props;
    const {
      loading,
      meetingExisted,
    } = this.state;

    if (!prevProps.subscriptionsReady && subscriptionsReady) {
      logger.info({ logCode: 'startup_client_subscriptions_ready' }, 'Subscriptions are ready');
    }

    if (prevProps.meetingExist && !meetingExist && !meetingExisted) {
      this.setMeetingExisted(true);
    }

    // In case the meteor restart avoid error log
    if (meteorIsConnected && (prevState.meetingExisted !== meetingExisted) && meetingExisted) {
      this.setMeetingExisted(false);
    }

    // In case the meeting delayed to load
    if (!meetingExist) return;

    if (approved && loading) this.updateLoadingState(false);

    if (animations && animations !== prevProps.animations) {
      document.documentElement.style.setProperty('--enableAnimation', 1);
    } else if (!animations && animations !== prevProps.animations) {
      document.documentElement.style.setProperty('--enableAnimation', 0);
    }
  }

  componentWillUnmount() {
    fullscreenChangedEvents.forEach((event) => {
      document.removeEventListener(event, Base.handleFullscreenChange);
    });
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
    const { loading, isBreakout } = this.state;
    const codeError = Session.get('codeError');
    const {
      ejected,
      subscriptionsReady,
      meetingIsEnded,
    } = this.props;
    const isMeetingBreakout = AppService.meetingIsBreakout();

    if (ejected && ejected.ejectedReason) {
      const { ejectedReason } = ejected;
      AudioManager.exitAudio();
      return (<MeetingEnded code={ejectedReason} />);
    }

    if (isMeetingBreakout && !isBreakout) this.setState({ isBreakout: true });

    if (meetingIsEnded && !isBreakout) {
      AudioManager.exitAudio();
      return (<MeetingEnded code={codeError} />);
    }

    if (codeError && !meetingIsEnded) {
      logger.error({ logCode: 'startup_client_usercouldnotlogin_error' }, `User could not log in HTML5, hit ${codeError}`);
      return (<ErrorScreen code={codeError} />);
    }

    if ((loading || !subscriptionsReady) && !meetingIsEnded) {
      return (<LoadingScreen>{loading}</LoadingScreen>);
    }
    // this.props.annotationsHandler.stop();
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
  'group-chat', 'presentation-pods', 'users-settings', 'guestUser',
];

const BaseContainer = withTracker(() => {
  const { locale, animations } = Settings.application;
  const { credentials, loggedIn } = Auth;
  const { meetingId, requesterUserId } = credentials;
  let breakoutRoomSubscriptionHandler;
  let meetingModeratorSubscriptionHandler;

  const meeting = Meetings.findOne({ meetingId });
  if (meeting) {
    const { meetingEnded } = meeting;
    if (meetingEnded) Session.set('codeError', '410');
  }

  let userSubscriptionHandler;

  const subscriptionErrorHandler = {
    onError: (error) => {
      logger.error({ logCode: 'startup_client_subscription_error' }, error);
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
    // override meteor subscription to verify if is moderator
    userSubscriptionHandler = Meteor.subscribe('users', credentials, mappedUser.isModerator, subscriptionErrorHandler);
    breakoutRoomSubscriptionHandler = Meteor.subscribe('breakouts', credentials, mappedUser.isModerator, subscriptionErrorHandler);
    breakoutRoomSubscriptionHandler = Meteor.subscribe('meetings', credentials, mappedUser.isModerator, subscriptionErrorHandler);
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

  return {
    approved: Users.findOne({ userId: Auth.userID, approved: true, guest: true }),
    ejected: Users.findOne({ userId: Auth.userID, ejected: true }),
    locale,
    subscriptionsReady,
    annotationsHandler,
    groupChatMessageHandler,
    userSubscriptionHandler,
    breakoutRoomSubscriptionHandler,
    meetingModeratorSubscriptionHandler,
    animations,
    User,
    meteorIsConnected: Meteor.status().connected,
    meetingExist: !!Meetings.find({ meetingId }).count(),
    meetingIsEnded: !!meeting && meeting.meetingEnded,
  };
})(Base);

export default BaseContainer;
