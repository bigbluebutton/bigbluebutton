import React, { Component } from 'react';
import SettingsDropdown from './component';
import { toggleFullScreen } from './service';

export default class SettingsDropdownContainer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isFullScreen: false,
      clicked: false,
    };

    this.handleFullscreenChange = this.handleFullscreenChange.bind(this);
    this.toggleClicked = this.toggleClicked.bind(this);
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
    this.toggleClicked();
  }

  toggleClicked() {
    if(!this.clicked){
      this.setState({ clicked: true });
    }else{
      this.setState({ clicked: false });
    }
  }

  render() {
    const handleToggleFullscreen = toggleFullScreen;
    const isFullScreen = this.state.isFullScreen;
    const clicked = this.state.clicked;

    return (
      <SettingsDropdown
        handleToggleFullscreen={handleToggleFullscreen}
        isFullScreen={isFullScreen}
        clicked={clicked}
      />
    );
  }
}
