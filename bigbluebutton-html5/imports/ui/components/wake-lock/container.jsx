import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import WakeLock from './component';
import Service from './service';
import Settings from '/imports/ui/services/settings';

const WakeLockContainer = (props) => {
  if (!Service.isSupported()) return null;
  return (<WakeLock {...props} />);
};

export default withTracker(() => {
  const wakeLockSettings = Settings.application.wakeLockEnabled;
  return {
    request: Service.request,
    release: Service.release,
    wakeLockSettings,
  };
})(WakeLockContainer);
