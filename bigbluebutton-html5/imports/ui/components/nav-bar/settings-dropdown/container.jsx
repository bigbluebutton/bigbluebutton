import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import React, { Component, PropTypes } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import SettingsDropdown from './component';
import Service from './service';

export default class SettingsDropdownContainer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isFullScreen: false,
    }

    this.fullScreenToggleCallback = this.fullScreenToggleCallback.bind(this);
  }

  componentDidMount() {
    const fullscreenChangedEvents = ['fullscreenchange',
                                    'webkitfullscreenchange',
                                    'mozfullscreenchange',
                                    'MSFullscreenChange'];

    fullscreenChangedEvents.forEach(event =>
      document.addEventListener(event, this.fullScreenToggleCallback));
  }

  componentWillUnmount() {
    const fullscreenChangedEvents = ['fullscreenchange',
                                    'webkitfullscreenchange',
                                    'mozfullscreenchange',
                                    'MSFullscreenChange'];

    fullscreenChangedEvents.forEach(event =>
      document.removeEventListener(event, this.fullScreenToggleCallback));
  }

  fullScreenToggleCallback() {
    if (screen.height - 1 <= window.innerHeight) {
      // browser is probably in fullscreen
      this.setState({isFullScreen: true});
    }else{
      this.setState({isFullScreen: false});
    }
  }

  render() {

    const handleToggleFullscreen = Service.toggleFullScreen;
    const isFullScreen = this.state.isFullScreen;

    return(
      <SettingsDropdown
        handleToggleFullscreen={handleToggleFullscreen}
        isFullScreen={isFullScreen}
      />
    );
  }
}
