import React, { Component } from 'react';
import SettingsDropdown from './component';
import {toggleFullScreen} from './service';

export default class SettingsDropdownContainer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isFullScreen: false,
    };

    this.handleFullscreenChange = this.handleFullscreenChange.bind(this);
  }

  componentDidMount() {
    const fullscreenChangedEvents = [
      'fullscreenchange',
      'webkitfullscreenchange',
      'mozfullscreenchange',
      'MSFullscreenChange',
    ];

    fullscreenChangedEvents.forEach(event =>
      document.addEventListener(event, this.handleFullscreenChange));
  }

  componentWillUnmount() {
    const fullscreenChangedEvents = [
      'fullscreenchange',
      'webkitfullscreenchange',
      'mozfullscreenchange',
      'MSFullscreenChange',
    ];

    fullscreenChangedEvents.forEach(event =>
      document.removeEventListener(event, this.fullScreenToggleCallback));
  }

  handleFullscreenChange() {
    if (!this.state.isFullScreen) {
      this.setState({ isFullScreen: true });
    } else {
      this.setState({ isFullScreen: false });
    }
  }

  render() {
    const handleToggleFullscreen = toggleFullScreen;
    const isFullScreen = this.state.isFullScreen;

    return (
      <SettingsDropdown
        handleToggleFullscreen={handleToggleFullscreen}
        isFullScreen={isFullScreen}
      />
    );
  }
}
