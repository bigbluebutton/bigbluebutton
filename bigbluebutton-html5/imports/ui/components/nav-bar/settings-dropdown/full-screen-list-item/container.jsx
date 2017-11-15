import React, { Component } from 'react';
import FullScreenListItem from './component';
import { toggleFullScreen } from '../service';

export default class FullScreenListItemContainer extends Component {
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
    if (document.fullscreenElement
      || document.webkitFullscreenElement
      || document.mozFullScreenElement
      || document.msFullscreenElement) {
      this.setState({ isFullScreen: true });
    } else {
      this.setState({ isFullScreen: false });
    }
  }

  render() {
    const handleToggleFullscreen = toggleFullScreen;
    const isFullScreen = this.state.isFullScreen;

    return (
      <FullScreenListItem
        handleToggleFullscreen={handleToggleFullscreen}
        isFullScreen={isFullScreen}
      />
    );
  }
}
