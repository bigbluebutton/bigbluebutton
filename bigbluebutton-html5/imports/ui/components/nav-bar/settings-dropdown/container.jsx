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

    this.handleMinimize = this.handleMinimize.bind(this);
    this.handleMaximize = this.handleMaximize.bind(this);
  }

  componentDidMount() {
    window.addEventListener("bbb.maximizeScreen", this.handleMaximize);
    window.addEventListener("bbb.minimizeScreen", this.handleMinimize);
  }

  componentWillUnmount() {
    window.removeEventListener("bbb.maximizeScreen", this.handleMaximize);
    window.removeEventListener("bbb.minimizeScreen", this.handleMinimize);
  }

  handleMaximize() {
    this.setState({isFullScreen: true});
  }

  handleMinimize() {
    this.setState({isFullScreen: false});
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
