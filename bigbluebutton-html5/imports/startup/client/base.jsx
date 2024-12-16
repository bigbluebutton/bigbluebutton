import React, { Component } from 'react';
import AppContainer from '/imports/ui/components/app/container';
import Session from '/imports/ui/services/storage/in-memory';
import DebugWindow from '/imports/ui/components/debug-window/component';
import { ACTIONS } from '/imports/ui/components/layout/enums';
import useSettings from '/imports/ui/services/settings/hooks/useSettings';
import { SETTINGS } from '/imports/ui/services/settings/enums';
import { layoutDispatch } from '/imports/ui/components/layout/context';

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
    return (
      <>
        <DebugWindow />
        <AppContainer {...this.props} />
      </>
    );
  }
}

const BaseContainer = (props) => {
  const { animations } = useSettings(SETTINGS.APPLICATION);
  const layoutContextDispatch = layoutDispatch();

  return (
    <Base
      {...{
        animations,
        layoutContextDispatch,
        ...props,
      }}
    />
  );
};

export default BaseContainer;
