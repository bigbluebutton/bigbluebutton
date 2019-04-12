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

import Breakouts from '/imports/api/breakouts';
import AudioService from '/imports/ui/components/audio/service';
import { FormattedMessage } from 'react-intl';
import { notify } from '/imports/ui/services/notification';

const CHAT_CONFIG = Meteor.settings.public.chat;
const PUBLIC_GROUP_CHAT_ID = CHAT_CONFIG.public_group_id;
const PUBLIC_CHAT_TYPE = CHAT_CONFIG.type_public;
let breakoutNotified = false;

const propTypes = {
  subscriptionsReady: PropTypes.bool.isRequired,
  locale: PropTypes.string,
  approved: PropTypes.bool,
  meetingHasEnded: PropTypes.bool.isRequired,
  meetingExist: PropTypes.bool,
};

const defaultProps = {
  locale: undefined,
  approved: undefined,
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
    if (!subscriptionsReady || !meetingExist) return;

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
    const { loading } = this.state;
    const codeError = Session.get('codeError');
    const {
      ejected,
      subscriptionsReady,
      meetingExist,
      meetingHasEnded,
      meetingIsBreakout,
    } = this.props;

    if ((loading || !subscriptionsReady) && !meetingHasEnded && meetingExist) {
      return (<LoadingScreen>{loading}</LoadingScreen>);
    }

    if (ejected && ejected.ejectedReason) {
      const { ejectedReason } = ejected;
      AudioManager.exitAudio();
      return (<MeetingEnded code={ejectedReason} />);
    }

    if (meetingHasEnded && meetingIsBreakout) window.close();

    if (meetingHasEnded && !meetingIsBreakout) {
      AudioManager.exitAudio();
      return (<MeetingEnded code={codeError} />);
    }

    if (codeError && !meetingHasEnded) {
      logger.error({ logCode: 'startup_client_usercouldnotlogin_error' }, `User could not log in HTML5, hit ${codeError}`);
      return (<ErrorScreen code={codeError} />);
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
  'group-chat', 'presentation-pods', 'users-settings', 'guestUser', 'users-infos',
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
  let responseDelay;
  let inactivityCheck;

  if (User) {
    const {
      responseDelay: userResponseDelay,
      inactivityCheck: userInactivityCheck,
    } = User;
    responseDelay = userResponseDelay;
    inactivityCheck = userInactivityCheck;
    const mappedUser = mapUser(User);
    // override meteor subscription to verify if is moderator
    userSubscriptionHandler = Meteor.subscribe('users', credentials, mappedUser.isModerator, subscriptionErrorHandler);
    breakoutRoomSubscriptionHandler = Meteor.subscribe('breakouts', credentials, mappedUser.isModerator, subscriptionErrorHandler);
    meetingModeratorSubscriptionHandler = Meteor.subscribe('meetings', credentials, mappedUser.isModerator, subscriptionErrorHandler);

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

  Breakouts.find().observeChanges({
    added() {
      breakoutNotified = false;
    },
    removed() {
      if (!AudioService.isUsingAudio() && !breakoutNotified) {
        if (meeting && !meeting.meetingEnded) {
          notify(
            <FormattedMessage
              id="app.toast.breakoutRoomEnded"
              description="message when the breakout room is ended"
            />,
            'info',
            'rooms',
          );
        }
        breakoutNotified = true;
      }
    },
  });

  Meetings.find({ meetingId }).observe({
    changed: (newDocument, oldDocument) => {
      if (newDocument.recordProp) {
        if (!oldDocument.recordProp.recording && newDocument.recordProp.recording) {
          notify(
            <FormattedMessage
              id="app.notification.recordingStart"
              description="Notification for when the recording starts"
            />,
            'success',
            'record',
          );
        }

        if (oldDocument.recordProp.recording && !newDocument.recordProp.recording) {
          notify(
            <FormattedMessage
              id="app.notification.recordingStop"
              description="Notification for when the recording stops"
            />,
            'error',
            'record',
          );
        }
      }
    },
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
    responseDelay,
    inactivityCheck,
    User,
    meteorIsConnected: Meteor.status().connected,
    meetingExist: !!meeting,
    meetingHasEnded: !!meeting && meeting.meetingEnded,
    meetingIsBreakout: AppService.meetingIsBreakout(),
  };
})(Base);

export default BaseContainer;
