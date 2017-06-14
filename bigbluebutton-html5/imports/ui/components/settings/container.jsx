import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { createContainer } from 'meteor/react-meteor-data';
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
      <Settings {...this.props} />
    );
  }
}

export default createContainer(() => ({
  audio: SettingsService.audio,
  video: SettingsService.video,
  application: SettingsService.application,
  cc: SettingsService.cc,
  participants: SettingsService.participants,
  updateSettings,
  locales: getClosedCaptionLocales(),
  availableLocales: getAvailableLocales(),
  isModerator: getUserRoles() === 'MODERATOR',
}), SettingsContainer);
