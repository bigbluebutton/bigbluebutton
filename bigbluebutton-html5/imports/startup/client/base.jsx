import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';
import Auth from '/imports/ui/services/auth';
import AppContainer from '/imports/ui/components/app/container';
import ErrorScreen from '/imports/ui/components/error-screen/component';
import MeetingEnded from '/imports/ui/components/meeting-ended/component';
import LoadingScreen from '/imports/ui/components/common/loading-screen/component';
import Settings from '/imports/ui/services/settings';
import logger from '/imports/startup/client/logger';
import Users from '/imports/api/users';
import { Session } from 'meteor/session';
import { Meteor } from 'meteor/meteor';
import Meetings from '/imports/api/meetings';
import AppService from '/imports/ui/components/app/service';
import deviceInfo from '/imports/utils/deviceInfo';
import getFromUserSettings from '/imports/ui/services/users-settings';
import { layoutSelectInput, layoutDispatch } from '../../ui/components/layout/context';
import VideoService from '/imports/ui/components/video-provider/service';
import DebugWindow from '/imports/ui/components/debug-window/component';
import { ACTIONS, PANELS } from '../../ui/components/layout/enums';
import { isChatEnabled } from '/imports/ui/services/features';
import { makeCall } from '/imports/ui/services/api';
import BBBStorage from '/imports/ui/services/storage';

const CHAT_CONFIG = Meteor.settings.public.chat;
const PUBLIC_CHAT_ID = CHAT_CONFIG.public_id;
const USER_WAS_EJECTED = 'userWasEjected';
const CAPTIONS_ALWAYS_VISIBLE = Meteor.settings.public.app.audioCaptions.alwaysVisible;

const HTML = document.getElementsByTagName('html')[0];

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
      userRemoved: false,
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

    if (animations) HTML.classList.add('animationsEnabled');
    if (!animations) HTML.classList.add('animationsDisabled');

    fullscreenChangedEvents.forEach((event) => {
      document.addEventListener(event, this.handleFullscreenChange);
    });
    Session.set('audioCaptions', CAPTIONS_ALWAYS_VISIBLE);
    Session.set('isFullscreen', false);
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
      sidebarContentPanel,
      usersVideo,
      User,
    } = this.props;
    const {
      loading,
      meetingExisted,
    } = this.state;

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

    if (prevProps.User && !User) {
      this.setUserRemoved(true);
    }

    // In case the meteor restart avoid error log
    if (isMeteorConnected && (prevState.meetingExisted !== meetingExisted)) {
      this.setMeetingExisted(false);
    }

    if ((prevProps.isMeteorConnected !== isMeteorConnected) && !isMeteorConnected) {
      Session.set('globalIgnoreDeletes', true);
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

    if (Session.equals('layoutReady', true) && (sidebarContentPanel === PANELS.NONE || Session.equals('subscriptionsReady', true))) {
      if (!checkedUserSettings) {
        const showAnimationsDefault = getFromUserSettings(
          'bbb_show_animations_default',
          Meteor.settings.public.app.defaultSettings.application.animations
        );

        Settings.application.animations = showAnimationsDefault;
        Settings.save();

        if (getFromUserSettings('bbb_show_participants_on_login', Meteor.settings.public.layout.showParticipantsOnLogin) && !deviceInfo.isPhone) {
          if (isChatEnabled() && getFromUserSettings('bbb_show_public_chat_on_login', !Meteor.settings.public.chat.startClosed)) {
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

  setUserRemoved(userRemoved) {
    this.setState({ userRemoved });
  }

  updateLoadingState(loading = false) {
    this.setState({
      loading,
    });
  }

  static async setExitReason(reason) {
    return await makeCall('setExitReason', reason);
  }

  renderByState() {
    const { loading, userRemoved } = this.state;
    const {
      codeError,
      ejected,
      ejectedReason,
      meetingExist,
      meetingHasEnded,
      meetingEndedReason,
      meetingIsBreakout,
      subscriptionsReady,
      userWasEjected,
    } = this.props;

    if ((loading || !subscriptionsReady) && !meetingHasEnded && meetingExist) {
      return (<LoadingScreen>{loading}</LoadingScreen>);
    }
    
    if (( meetingHasEnded || ejected || userRemoved ) && meetingIsBreakout) {
      Base.setExitReason('breakoutEnded').finally(() => {
        Meteor.disconnect();
        window.close();
      });
      return null;
    }
    
    if (ejected || userWasEjected) {
      return (
        <MeetingEnded
          code="403"
          ejectedReason={ejectedReason}
          callback={() => Base.setExitReason('ejected')}
        />
      );
    }

    if ((meetingHasEnded && !meetingIsBreakout) || userWasEjected) {
      return (
        <MeetingEnded
          code={codeError}
          endedReason={meetingEndedReason}
          callback={() => Base.setExitReason('meetingEnded')}
        />
      );
    }

    if ((codeError && !meetingHasEnded) || userWasEjected) {
      // 680 is set for the codeError when the user requests a logout.
      if (codeError !== '680') {
        return (<ErrorScreen code={codeError} callback={() => Base.setExitReason('error')} />);
      }
      return (<MeetingEnded code={codeError} callback={() => Base.setExitReason('logout')} />);
    }

    return (<AppContainer {...this.props} />);
  }

  render() {
    const {
      meetingExist,
      codeError,
    } = this.props;
    const { meetingExisted } = this.state;

    return (
      <>
        {meetingExist && Auth.loggedIn && <DebugWindow />}
        {
          (!meetingExisted && !meetingExist && Auth.loggedIn && !codeError)
            ? <LoadingScreen />
            : this.renderByState()
        }
      </>
    );
  }
}

Base.propTypes = propTypes;
Base.defaultProps = defaultProps;

const BaseContainer = (props) => {
  const sidebarContent = layoutSelectInput((i) => i.sidebarContent);
  const { sidebarContentPanel } = sidebarContent;
  const layoutContextDispatch = layoutDispatch();

  return <Base {...{ sidebarContentPanel, layoutContextDispatch, ...props }} />;
};

export default withTracker(() => {
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
    currentConnectionId: 1,
    connectionIdUpdateTime: 1,
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
  const currentConnectionId = User?.currentConnectionId;
  const { connectionID, connectionAuthTime } = Auth;
  const connectionIdUpdateTime = User?.connectionIdUpdateTime;
  
  if (ejected) {
    // use the connectionID to block users, so we can detect if the user was
    // blocked by the current connection. This is the case when a a user is
    // ejected from a meeting but not permanently ejected. Permanent ejects are
    // managed by the server, not by the client.
    BBBStorage.setItem(USER_WAS_EJECTED, connectionID);
  }

  if (currentConnectionId && currentConnectionId !== connectionID && connectionIdUpdateTime > connectionAuthTime) {
    Session.set('codeError', '409');
    Session.set('errorMessageDescription', 'joined_another_window_reason')
  }

  let userSubscriptionHandler;

  const codeError = Session.get('codeError');
  const { streams: usersVideo } = VideoService.getVideoStreams();

  return {
    userWasEjected: (BBBStorage.getItem(USER_WAS_EJECTED) == connectionID),
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
})(BaseContainer);
