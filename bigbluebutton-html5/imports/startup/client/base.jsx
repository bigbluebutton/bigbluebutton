import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';
import Auth from '/imports/ui/services/auth';
import AppContainer from '/imports/ui/components/app/container';
import ErrorScreen from '/imports/ui/components/error-screen/component';
import MeetingEnded from '/imports/ui/components/meeting-ended/component';
import LoadingScreen from '/imports/ui/components/loading-screen/component';
import Settings from '/imports/ui/services/settings';
import logger from '/imports/startup/client/logger';
import Users from '/imports/api/users';
import { Session } from 'meteor/session';
import { FormattedMessage } from 'react-intl';
import { Meteor } from 'meteor/meteor';
import Meetings, { RecordMeetings } from '../../api/meetings';
import AppService from '/imports/ui/components/app/service';
import Breakouts from '/imports/api/breakouts';
import AudioService from '/imports/ui/components/audio/service';
import { notify } from '/imports/ui/services/notification';
import deviceInfo from '/imports/utils/deviceInfo';
import getFromUserSettings from '/imports/ui/services/users-settings';
import { LayoutContextFunc } from '../../ui/components/layout/context';
import VideoService from '/imports/ui/components/video-provider/service';
import DebugWindow from '/imports/ui/components/debug-window/component';
import { ACTIONS, PANELS } from '../../ui/components/layout/enums';

const CHAT_CONFIG = Meteor.settings.public.chat;
const CHAT_ENABLED = CHAT_CONFIG.enabled;
const PUBLIC_CHAT_ID = CHAT_CONFIG.public_id;

const BREAKOUT_END_NOTIFY_DELAY = 50;

const HTML = document.getElementsByTagName('html')[0];

let breakoutNotified = false;
let checkedUserSettings = false;

const propTypes = {
  subscriptionsReady: PropTypes.bool,
  approved: PropTypes.bool,
  meetingHasEnded: PropTypes.bool.isRequired,
  meetingExist: PropTypes.bool,
};

const defaultProps = {
  approved: false,
  meetingExist: false,
  subscriptionsReady: false,
};

const fullscreenChangedEvents = [
  'fullscreenchange',
  'webkitfullscreenchange',
  'mozfullscreenchange',
  'MSFullscreenChange',
];

class Base extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      meetingExisted: false,
    };
    this.updateLoadingState = this.updateLoadingState.bind(this);
    this.handleFullscreenChange = this.handleFullscreenChange.bind(this);
  }

  handleFullscreenChange() {
    const { layoutContextDispatch } = this.props;

    if (document.fullscreenElement
      || document.webkitFullscreenElement
      || document.mozFullScreenElement
      || document.msFullscreenElement) {
      Session.set('isFullscreen', true);
    } else {
      layoutContextDispatch({
        type: ACTIONS.SET_FULLSCREEN_ELEMENT,
        value: {
          element: '',
          group: '',
        },
      });
      Session.set('isFullscreen', false);
    }
  }

  componentDidMount() {
    const { animations, usersVideo, layoutContextDispatch } = this.props;

    layoutContextDispatch({
      type: ACTIONS.SET_NUM_CAMERAS,
      value: usersVideo.length,
    });

    const {
      userID: localUserId,
    } = Auth;

    if (animations) HTML.classList.add('animationsEnabled');
    if (!animations) HTML.classList.add('animationsDisabled');

    fullscreenChangedEvents.forEach((event) => {
      document.addEventListener(event, this.handleFullscreenChange);
    });
    Session.set('isFullscreen', false);

    // TODO move this find to container
    const users = Users.find({
      meetingId: Auth.meetingID,
      validated: true,
      userId: { $ne: localUserId },
    }, { fields: { name: 1, userId: 1 } });

    users.observe({
      added: (user) => {
        const subscriptionsReady = Session.get('subscriptionsReady');

        if (!subscriptionsReady) return;

        const {
          userJoinAudioAlerts,
          userJoinPushAlerts,
        } = Settings.application;

        if (!userJoinAudioAlerts && !userJoinPushAlerts) return;

        if (userJoinAudioAlerts) {
          AudioService.playAlertSound(`${Meteor.settings.public.app.cdn
            + Meteor.settings.public.app.basename
            + Meteor.settings.public.app.instanceId}`
            + '/resources/sounds/userJoin.mp3');
        }

        if (userJoinPushAlerts) {
          notify(
            <FormattedMessage
              id="app.notification.userJoinPushAlert"
              description="Notification for a user joins the meeting"
              values={{
                0: user.name,
              }}
            />,
            'info',
            'user',
          );
        }
      },
      removed: (user) => {
        const subscriptionsReady = Session.get('subscriptionsReady');

        if (!subscriptionsReady) return;

        const {
          userLeaveAudioAlerts,
          userLeavePushAlerts,
        } = Settings.application;

        if (!userLeaveAudioAlerts && !userLeavePushAlerts) return;

        if (userLeaveAudioAlerts) {
          AudioService.playAlertSound(`${Meteor.settings.public.app.cdn
            + Meteor.settings.public.app.basename
            + Meteor.settings.public.app.instanceId}`
            + '/resources/sounds/notify.mp3');
        }

        if (userLeavePushAlerts) {
          notify(
            <FormattedMessage
              id="app.notification.userLeavePushAlert"
              description="Notification for a user leaves the meeting"
              values={{
                0: user.name,
              }}
            />,
            'info',
            'user',
          );
        }
      },
    });
  }

  componentDidUpdate(prevProps, prevState) {
    const {
      approved,
      meetingExist,
      animations,
      ejected,
      isMeteorConnected,
      subscriptionsReady,
      layoutContextDispatch,
      layoutContextState,
      usersVideo,
    } = this.props;
    const {
      loading,
      meetingExisted,
    } = this.state;

    const { input } = layoutContextState;
    const { sidebarContent } = input;
    const { sidebarContentPanel } = sidebarContent;

    if (usersVideo !== prevProps.usersVideo) {
      layoutContextDispatch({
        type: ACTIONS.SET_NUM_CAMERAS,
        value: usersVideo.length,
      });
    }

    if (!prevProps.subscriptionsReady && subscriptionsReady) {
      logger.info({ logCode: 'startup_client_subscriptions_ready' }, 'Subscriptions are ready');
    }

    if (prevProps.meetingExist && !meetingExist && !meetingExisted) {
      this.setMeetingExisted(true);
    }

    // In case the meteor restart avoid error log
    if (isMeteorConnected && (prevState.meetingExisted !== meetingExisted) && meetingExisted) {
      this.setMeetingExisted(false);
    }

    // In case the meeting delayed to load
    if (!subscriptionsReady || !meetingExist) return;

    if (approved && loading) this.updateLoadingState(false);

    if (prevProps.ejected || ejected) {
      Session.set('codeError', '403');
      Session.set('isMeetingEnded', true);
    }

    // In case the meteor restart avoid error log
    if (isMeteorConnected && (prevState.meetingExisted !== meetingExisted)) {
      this.setMeetingExisted(false);
    }

    const enabled = HTML.classList.contains('animationsEnabled');
    const disabled = HTML.classList.contains('animationsDisabled');

    if (animations && animations !== prevProps.animations) {
      if (disabled) HTML.classList.remove('animationsDisabled');
      HTML.classList.add('animationsEnabled');
    } else if (!animations && animations !== prevProps.animations) {
      if (enabled) HTML.classList.remove('animationsEnabled');
      HTML.classList.add('animationsDisabled');
    }

    if (sidebarContentPanel === PANELS.NONE || Session.equals('subscriptionsReady', true)) {
      if (!checkedUserSettings) {
        if (getFromUserSettings('bbb_show_participants_on_login', Meteor.settings.public.layout.showParticipantsOnLogin) && !deviceInfo.isPhone) {
          if (CHAT_ENABLED && getFromUserSettings('bbb_show_public_chat_on_login', !Meteor.settings.public.chat.startClosed)) {
            layoutContextDispatch({
              type: ACTIONS.SET_SIDEBAR_NAVIGATION_IS_OPEN,
              value: true,
            });
            layoutContextDispatch({
              type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
              value: true,
            });
            layoutContextDispatch({
              type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
              value: PANELS.CHAT,
            });
            layoutContextDispatch({
              type: ACTIONS.SET_ID_CHAT_OPEN,
              value: PUBLIC_CHAT_ID,
            });
          } else {
            layoutContextDispatch({
              type: ACTIONS.SET_SIDEBAR_NAVIGATION_IS_OPEN,
              value: true,
            });
            layoutContextDispatch({
              type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
              value: false,
            });
          }
        } else {
          layoutContextDispatch({
            type: ACTIONS.SET_SIDEBAR_NAVIGATION_IS_OPEN,
            value: false,
          });
          layoutContextDispatch({
            type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
            value: false,
          });
        }

        if (Session.equals('subscriptionsReady', true)) {
          checkedUserSettings = true;
        }
      }
    }
  }

  componentWillUnmount() {
    fullscreenChangedEvents.forEach((event) => {
      document.removeEventListener(event, this.handleFullscreenChange);
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
    const {
      codeError,
      ejected,
      ejectedReason,
      meetingExist,
      meetingHasEnded,
      meetingEndedReason,
      meetingIsBreakout,
      subscriptionsReady,
      User,
    } = this.props;

    if ((loading || !subscriptionsReady) && !meetingHasEnded && meetingExist) {
      return (<LoadingScreen>{loading}</LoadingScreen>);
    }

    if (ejected) {
      return (<MeetingEnded code="403" ejectedReason={ejectedReason} />);
    }

    if ((meetingHasEnded || User?.loggedOut) && meetingIsBreakout) {
      window.close();
      return null;
    }

    if (((meetingHasEnded && !meetingIsBreakout)) || (codeError && User?.loggedOut)) {
      return (
        <MeetingEnded
          code={codeError}
          endedReason={meetingEndedReason}
          ejectedReason={ejectedReason}
        />
      );
    }

    if (codeError && !meetingHasEnded) {
      // 680 is set for the codeError when the user requests a logout
      if (codeError !== '680') {
        return (<ErrorScreen code={codeError} />);
      }
      return (<MeetingEnded code={codeError} />);
    }

    return (<AppContainer {...this.props} baseControls={stateControls} />);
  }

  render() {
    const {
      meetingExist,
    } = this.props;
    const { meetingExisted } = this.state;

    return (
      <>
        {meetingExist && Auth.loggedIn && <DebugWindow />}
        {
          (!meetingExisted && !meetingExist && Auth.loggedIn)
            ? <LoadingScreen />
            : this.renderByState()
        }
      </>
    );
  }
}

Base.propTypes = propTypes;
Base.defaultProps = defaultProps;

const BaseContainer = withTracker(() => {
  const {
    animations,
  } = Settings.application;

  const {
    credentials,
    loggedIn,
  } = Auth;

  const { meetingId } = credentials;
  let breakoutRoomSubscriptionHandler;
  let meetingModeratorSubscriptionHandler;

  const fields = {
    approved: 1,
    authed: 1,
    ejected: 1,
    ejectedReason: 1,
    color: 1,
    effectiveConnectionType: 1,
    extId: 1,
    guest: 1,
    intId: 1,
    locked: 1,
    loggedOut: 1,
    meetingId: 1,
    userId: 1,
    inactivityCheck: 1,
    responseDelay: 1,
  };
  const User = Users.findOne({ intId: credentials.requesterUserId }, { fields });
  const meeting = Meetings.findOne({ meetingId }, {
    fields: {
      meetingEnded: 1,
      meetingEndedReason: 1,
      meetingProp: 1,
    },
  });

  if (meeting && meeting.meetingEnded) {
    Session.set('codeError', '410');
  }

  const approved = User?.approved && User?.guest;
  const ejected = User?.ejected;
  const ejectedReason = User?.ejectedReason;
  const meetingEndedReason = meeting?.meetingEndedReason;

  let userSubscriptionHandler;

  Breakouts.find({}, { fields: { _id: 1 } }).observeChanges({
    added() {
      breakoutNotified = false;
    },
    removed() {
      // Need to check the number of breakouts left because if a user's role changes to viewer
      // then all but one room is removed. The data here isn't reactive so no need to filter
      // the fields
      const numBreakouts = Breakouts.find().count();
      if (!AudioService.isUsingAudio() && !breakoutNotified && numBreakouts === 0) {
        if (meeting && !meeting.meetingEnded && !meeting.meetingProp.isBreakout) {
          // There's a race condition when reloading a tab where the collection gets cleared
          // out and then refilled. The removal of the old data triggers the notification so
          // instead wait a bit and check to see that records weren't added right after.
          setTimeout(() => {
            if (breakoutNotified) {
              notify(
                <FormattedMessage
                  id="app.toast.breakoutRoomEnded"
                  description="message when the breakout room is ended"
                />,
                'info',
                'rooms',
              );
            }
          }, BREAKOUT_END_NOTIFY_DELAY);
        }
        breakoutNotified = true;
      }
    },
  });

  RecordMeetings.find({ meetingId }, { fields: { recording: 1 } }).observe({
    changed: (newDocument, oldDocument) => {
      if (newDocument) {
        if (!oldDocument.recording && newDocument.recording) {
          notify(
            <FormattedMessage
              id="app.notification.recordingStart"
              description="Notification for when the recording starts"
            />,
            'success',
            'record',
          );
        }

        if (oldDocument.recording && !newDocument.recording) {
          notify(
            <FormattedMessage
              id="app.notification.recordingPaused"
              description="Notification for when the recording stops"
            />,
            'error',
            'record',
          );
        }
      }
    },
  });

  const codeError = Session.get('codeError');
  const { streams: usersVideo } = VideoService.getVideoStreams();

  return {
    approved,
    ejected,
    ejectedReason,
    userSubscriptionHandler,
    breakoutRoomSubscriptionHandler,
    meetingModeratorSubscriptionHandler,
    animations,
    User,
    isMeteorConnected: Meteor.status().connected,
    meetingExist: !!meeting,
    meetingHasEnded: !!meeting && meeting.meetingEnded,
    meetingEndedReason,
    meetingIsBreakout: AppService.meetingIsBreakout(),
    subscriptionsReady: Session.get('subscriptionsReady'),
    loggedIn,
    codeError,
    usersVideo,
  };
})(LayoutContextFunc.withContext(Base));

export default BaseContainer;
