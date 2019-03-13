import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import browser from 'browser-detect';
import SettingsDropdown from './component';
import { toggleFullScreen } from './service';

const SettingsDropdownContainer = props => (
  <SettingsDropdown {...props} />
);

export default withTracker((props) => {
  const isFullscreen = Session.get('isFullscreen');
  const handleToggleFullscreen = toggleFullScreen;
  const BROWSER_RESULTS = browser();
  const isSafari = BROWSER_RESULTS.name === 'safari';
  const noIOSFullscreen = isSafari && BROWSER_RESULTS.versionNumber < 12;
  return {
    amIModerator: props.amIModerator,
    handleToggleFullscreen,
    isFullscreen,
    noIOSFullscreen,
  };
})(SettingsDropdownContainer);
