import React, { Component } from 'react';
import Auth from '/imports/ui/services/auth';
import AppContainer from '/imports/ui/components/app/container';
import { getSettingsSingletonInstance } from '/imports/ui/services/settings';
import Session from '/imports/ui/services/storage/in-memory';
import deviceInfo from '/imports/utils/deviceInfo';
import getFromUserSettings from '/imports/ui/services/users-settings';
import { layoutSelectInput, layoutDispatch } from '../../ui/components/layout/context';
import { useVideoStreams } from '/imports/ui/components/video-provider/hooks';
import DebugWindow from '/imports/ui/components/debug-window/component';
import { ACTIONS, PANELS } from '../../ui/components/layout/enums';
import { useIsChatEnabled } from '/imports/ui/services/features';
import useUserChangedLocalSettings from '/imports/ui/services/settings/hooks/useUserChangedLocalSettings';
import useSettings from '/imports/ui/services/settings/hooks/useSettings';
import { SETTINGS } from '/imports/ui/services/settings/enums';
import { useStorageKey } from '/imports/ui/services/storage/hooks';

const HTML = document.getElementsByTagName('html')[0];

let checkedUserSettings = false;

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
      Session.setItem('isFullscreen', true);
    } else {
      layoutContextDispatch({
        type: ACTIONS.SET_FULLSCREEN_ELEMENT,
        value: {
          element: '',
          group: '',
        },
      });
      Session.setItem('isFullscreen', false);
    }
  }

  componentDidMount() {
    const { animations, usersVideo, layoutContextDispatch } = this.props;
    const CAPTIONS_ALWAYS_VISIBLE = window.meetingClientSettings.public.app.audioCaptions.alwaysVisible;

    layoutContextDispatch({
      type: ACTIONS.SET_NUM_CAMERAS,
      value: usersVideo.length,
    });

    if (animations) HTML.classList.add('animationsEnabled');
    if (!animations) HTML.classList.add('animationsDisabled');

    fullscreenChangedEvents.forEach((event) => {
      document.addEventListener(event, this.handleFullscreenChange);
    });
    Session.setItem('isFullscreen', false);
    Session.setItem('audioCaptions', CAPTIONS_ALWAYS_VISIBLE);
  }

  componentDidUpdate(prevProps) {
    const {
      animations,
      layoutContextDispatch,
      sidebarContentPanel,
      usersVideo,
      setLocalSettings,
      isChatEnabled,
    } = this.props;

    if (usersVideo !== prevProps.usersVideo) {
      layoutContextDispatch({
        type: ACTIONS.SET_NUM_CAMERAS,
        value: usersVideo.length,
      });
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

    if (Session.equals('layoutReady', true) && (sidebarContentPanel === PANELS.NONE)) {
      if (!checkedUserSettings) {
        const showAnimationsDefault = getFromUserSettings(
          'bbb_show_animations_default',
          window.meetingClientSettings.public.app.defaultSettings.application.animations
        );

        const Settings = getSettingsSingletonInstance();
        Settings.application.animations = showAnimationsDefault;
        Settings.save(setLocalSettings);

        if (getFromUserSettings('bbb_show_participants_on_login', window.meetingClientSettings.public.layout.showParticipantsOnLogin) && !deviceInfo.isPhone) {
          if (isChatEnabled && getFromUserSettings('bbb_show_public_chat_on_login', !window.meetingClientSettings.public.chat.startClosed)) {
            const PUBLIC_CHAT_ID = window.meetingClientSettings.public.chat.public_group_id;

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

        checkedUserSettings = true;
      }
    }
  }

  componentWillUnmount() {
    fullscreenChangedEvents.forEach((event) => {
      document.removeEventListener(event, this.handleFullscreenChange);
    });
  }

  render() {
    return (
      <>
        <DebugWindow />
        <AppContainer {...this.props} />
      </>
    );
  }
}

const BaseContainer = (props) => {
  const codeError = useStorageKey('codeError');
  const isGridLayout = useStorageKey('isGridEnabled');
  const sidebarContent = layoutSelectInput((i) => i.sidebarContent);
  const { sidebarContentPanel } = sidebarContent;
  const layoutContextDispatch = layoutDispatch();
  const setLocalSettings = useUserChangedLocalSettings();

  const applicationSettings = useSettings(SETTINGS.APPLICATION);
  const paginationEnabled = applicationSettings?.paginationEnabled;
  const animations = applicationSettings?.animations;

  const { viewParticipantsWebcams, viewScreenshare } = useSettings(SETTINGS.DATA_SAVING);
  const { streams: usersVideo } = useVideoStreams(
    isGridLayout,
    paginationEnabled,
    viewParticipantsWebcams,
  );
  const loggedIn = Auth.useLoggedIn();
  const isChatEnabled = useIsChatEnabled();

  return (
    <Base
      {...{
        sidebarContentPanel,
        layoutContextDispatch,
        setLocalSettings,
        usersVideo,
        animations,
        viewScreenshare,
        codeError,
        loggedIn,
        isChatEnabled,
        ...props,
      }}
    />
  );
};

export default BaseContainer;
