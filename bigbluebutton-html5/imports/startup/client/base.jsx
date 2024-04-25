import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';
import Auth from '/imports/ui/services/auth';
import AppContainer from '/imports/ui/components/app/container';
import LoadingScreen from '/imports/ui/components/common/loading-screen/component';
import Settings from '/imports/ui/services/settings';
import logger from '/imports/startup/client/logger';
import { Session } from 'meteor/session';
import { Meteor } from 'meteor/meteor';
import AppService from '/imports/ui/components/app/service';
import deviceInfo from '/imports/utils/deviceInfo';
import getFromUserSettings from '/imports/ui/services/users-settings';
import { layoutSelectInput, layoutDispatch } from '../../ui/components/layout/context';
import { useVideoStreams } from '/imports/ui/components/video-provider/video-provider-graphql/hooks';
import DebugWindow from '/imports/ui/components/debug-window/component';
import { ACTIONS, PANELS } from '../../ui/components/layout/enums';
import { isChatEnabled } from '/imports/ui/services/features';
import useUserChangedLocalSettings from '/imports/ui/services/settings/hooks/useUserChangedLocalSettings';

const CHAT_CONFIG = window.meetingClientSettings.public.chat;
const PUBLIC_CHAT_ID = CHAT_CONFIG.public_group_id;

const HTML = document.getElementsByTagName('html')[0];

let checkedUserSettings = false;

const propTypes = {
  subscriptionsReady: PropTypes.bool,
  approved: PropTypes.bool,
};

const defaultProps = {
  approved: false,
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
    Session.set('isFullscreen', false);
  }

  componentDidUpdate(prevProps) {
    const {
      animations,
      subscriptionsReady,
      layoutContextDispatch,
      sidebarContentPanel,
      usersVideo,
      setLocalSettings,
    } = this.props;

    if (usersVideo !== prevProps.usersVideo) {
      layoutContextDispatch({
        type: ACTIONS.SET_NUM_CAMERAS,
        value: usersVideo.length,
      });
    }

    if (!prevProps.subscriptionsReady && subscriptionsReady) {
      logger.info({ logCode: 'startup_client_subscriptions_ready' }, 'Subscriptions are ready');
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
          window.meetingClientSettings.public.app.defaultSettings.application.animations
        );

        Settings.application.animations = showAnimationsDefault;
        Settings.save(setLocalSettings);

        if (getFromUserSettings('bbb_show_participants_on_login', window.meetingClientSettings.public.layout.showParticipantsOnLogin) && !deviceInfo.isPhone) {
          if (isChatEnabled() && getFromUserSettings('bbb_show_public_chat_on_login', !window.meetingClientSettings.public.chat.startClosed)) {
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

  render() {
    const {
      subscriptionsReady,
    } = this.props;
    if (!subscriptionsReady) {
      return (<LoadingScreen />);
    }

    return (
      <>
        <DebugWindow />
        <AppContainer {...this.props} />
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
  const setLocalSettings = useUserChangedLocalSettings();
  const { streams: usersVideo } = useVideoStreams(
    props.isGridLayout,
    props.paginationEnabled,
    props.viewParticipantsWebcams,
  );

  return (
    <Base
      {...{
        sidebarContentPanel,
        layoutContextDispatch,
        setLocalSettings,
        usersVideo,
        ...props,
      }}
    />
  );
};

export default withTracker(() => {
  const clientSettings = JSON.parse(sessionStorage.getItem('clientStartupSettings') || '{}');
  const {
    animations,
  } = Settings.application;

  const {
    loggedIn,
  } = Auth;

  let userSubscriptionHandler;

  const codeError = Session.get('codeError');
  const isGridLayout = Session.get('isGridEnabled');
  return {
    userSubscriptionHandler,
    animations,
    isMeteorConnected: Meteor.status().connected,
    meetingIsBreakout: AppService.meetingIsBreakout(),
    subscriptionsReady: Session.get('subscriptionsReady'),
    loggedIn,
    codeError,
    paginationEnabled: Settings.application.paginationEnabled,
    viewParticipantsWebcams: Settings.dataSaving.viewParticipantsWebcams,
    isGridLayout,
  };
})(BaseContainer);
