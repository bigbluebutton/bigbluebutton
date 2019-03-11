import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import browser from 'browser-detect';
import SettingsDropdown from './component';
import { toggleFullScreen } from './service';

const SettingsDropdownContainer = props => (
  <SettingsDropdown {...props} />
);

export default withTracker((props) => {
  const isFullScreen = Session.get('isFullScreen');
  const handleToggleFullscreen = toggleFullScreen;
  const result = browser();
  const isAndroid = (result && result.os) ? result.os.includes('Android') : false;
  return {
    amIModerator: props.amIModerator,
    handleToggleFullscreen,
    isAndroid,
    isFullScreen,
  };
})(SettingsDropdownContainer);
