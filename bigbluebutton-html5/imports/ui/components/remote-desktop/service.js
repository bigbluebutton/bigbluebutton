import Meetings from '/imports/api/meetings';
import Auth from '/imports/ui/services/auth';

import { makeCall } from '/imports/ui/services/api';

const isUrlValid = url => (typeof (url) === 'string' && url.startsWith('wss:'));

const startWatching = (remoteDesktopUrl, remoteDesktopPassword) => {
  makeCall('startWatchingRemoteDesktop', { remoteDesktopUrl, remoteDesktopPassword });
};

const stopWatching = () => {
  makeCall('stopWatchingRemoteDesktop');
};

const getRemoteDesktopUrl = () => {
  const meetingId = Auth.meetingID;
  const meeting = Meetings.findOne({ meetingId }, { fields: { remoteDesktopUrl: 1 } });

  return meeting && meeting.remoteDesktopUrl;
};

const getRemoteDesktopPassword = () => {
  const meetingId = Auth.meetingID;
  const meeting = Meetings.findOne({ meetingId }, { fields: { remoteDesktopPassword: 1 } });

  return meeting && meeting.remoteDesktopPassword;
};

export {
  getRemoteDesktopUrl,
  getRemoteDesktopPassword,
  isUrlValid,
  startWatching,
  stopWatching,
};
