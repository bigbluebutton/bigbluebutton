import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import _ from 'underscore';
import Settings from './component.jsx';
import {
    getSettingsFor,
    updateSettings,
    getClosedCaptionLocales,
    getUserRoles,
  } from './service.js';

class SettingsContainer extends Component {
  render() {
    return (
      <Settings {...this.props}/>
    );
  }
}

export default createContainer(() => {
  return {
    audio: getSettingsFor('audio'),
    video: getSettingsFor('video'),
    application: getSettingsFor('application'),
    cc: getSettingsFor('cc'),
    participants: getSettingsFor('participants'),
    updateSettings,
    locales: getClosedCaptionLocales(),
    isModerator: getUserRoles() === 'MODERATOR',
  };
}, SettingsContainer);
