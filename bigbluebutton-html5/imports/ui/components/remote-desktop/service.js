import Meetings from '/imports/api/meetings';
import Auth from '/imports/ui/services/auth';

import { makeCall } from '/imports/ui/services/api';

const isUrlValid = (url) => {
  return (typeof(url) == 'string' && url.startsWith('wss:'));
}

const startWatching = (remoteDesktopUrl) => {
  makeCall('startWatchingRemoteDesktop', { remoteDesktopUrl });
};

const stopWatching = () => {
  makeCall('stopWatchingRemoteDesktop');
};

const getRemoteDesktopUrl = () => {
  const meetingId = Auth.meetingID;
  const meeting = Meetings.findOne({ meetingId }, { fields: { remoteDesktopUrl: 1 } });

  return meeting && meeting.remoteDesktopUrl;
};

export {
  getRemoteDesktopUrl,
  isUrlValid,
  startWatching,
  stopWatching,
};
