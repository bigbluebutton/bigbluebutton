import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import _ from 'lodash';
import Settings from './component';
import {
    getSettingsFor,
    updateSettings,
    getClosedCaptionLocales,
    getUserRoles,
  } from './service';

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
