import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import _ from 'lodash';
import Settings from './component';
import SettingsService from '/imports/ui/services/settings';

import {
    getClosedCaptionLocales,
    getUserRoles,
    updateSettings,
    getAvailableLocales,
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
    audio: SettingsService.audio,
    video: SettingsService.video,
    application: SettingsService.application,
    cc: SettingsService.cc,
    participants: SettingsService.participants,
    updateSettings,
    locales: getClosedCaptionLocales(),
    availableLocales: getAvailableLocales(),
    isModerator: getUserRoles() === 'MODERATOR',
  };
}, SettingsContainer);
