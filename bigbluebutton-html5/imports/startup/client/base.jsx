import React, { Component } from 'react';
import AppContainer from '/imports/ui/components/app/container';
import Session from '/imports/ui/services/storage/in-memory';
import DebugWindow from '/imports/ui/components/debug-window/component';
import { ACTIONS } from '/imports/ui/components/layout/enums';
import useSettings from '/imports/ui/services/settings/hooks/useSettings';
import { SETTINGS } from '/imports/ui/services/settings/enums';
import { layoutDispatch } from '/imports/ui/components/layout/context';
import logger from '/imports/startup/client/logger';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const typography = {
  fontFamily: 'Source Sans Pro, Arial, sans-serif',
};

const muiBrand = {
  primary: { main: '#1976d2' },
  secondary: { main: '#9c27b0' },
};

const themes = {
  light: createTheme({ typography, palette: { ...muiBrand } }),
  dark: createTheme({
    typography,
    palette: {
      ...muiBrand,
      mode: 'dark',
      background: {
        default: '#181A23',
        paper: '#2D2F38',
      },
    },
  }),
};

const HTML = document.getElementsByTagName('html')[0];

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

  componentDidMount() {
    const { animations } = this.props;
    const APP_CONFIG = window.meetingClientSettings.public.app;
    const CAPTIONS_ALWAYS_VISIBLE = APP_CONFIG.audioCaptions.alwaysVisible;

    if (animations) HTML.classList.add('animationsEnabled');
    if (!animations) HTML.classList.add('animationsDisabled');

    fullscreenChangedEvents.forEach((event) => {
      document.addEventListener(event, this.handleFullscreenChange);
    });
    Session.setItem('isFullscreen', false);
    Session.setItem('audioCaptions', CAPTIONS_ALWAYS_VISIBLE);

    const isLegacyBundle = HTML.classList.contains('legacy');
    if (isLegacyBundle) {
      logger.warn({ logCode: 'legacy_browser_bundle_loaded' }, 'Client loaded using legacy bundle');
    }
  }

  componentDidUpdate(prevProps) {
    const { animations } = this.props;

    const enabled = HTML.classList.contains('animationsEnabled');
    const disabled = HTML.classList.contains('animationsDisabled');

    if (animations && animations !== prevProps.animations) {
      if (disabled) HTML.classList.remove('animationsDisabled');
      HTML.classList.add('animationsEnabled');
    } else if (!animations && animations !== prevProps.animations) {
      if (enabled) HTML.classList.remove('animationsEnabled');
      HTML.classList.add('animationsDisabled');
    }
  }

  componentWillUnmount() {
    fullscreenChangedEvents.forEach((event) => {
      document.removeEventListener(event, this.handleFullscreenChange);
    });
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

  render() {
    const { darkTheme } = this.props;

    return (
      <>
        <DebugWindow />
        <ThemeProvider theme={darkTheme ? themes.dark : themes.light}>
          <AppContainer {...this.props} />
        </ThemeProvider>
      </>
    );
  }
}

const BaseContainer = (props) => {
  const { animations, darkTheme } = useSettings(SETTINGS.APPLICATION);
  const layoutContextDispatch = layoutDispatch();

  return (
    <Base
      {...{
        animations,
        darkTheme,
        layoutContextDispatch,
        ...props,
      }}
    />
  );
};

export default BaseContainer;
