import Meetings from '/imports/api/meetings';
import Auth from '/imports/ui/services/auth';
import Users from '/imports/api/users';

import { makeCall } from '/imports/ui/services/api';

const ROLE_MODERATOR = Meteor.settings.public.user.role_moderator;

const isUrlValid = url => (typeof (url) === 'string' && url.startsWith('wss:'));

const startWatching = (remoteDesktopUrl, remoteDesktopPassword, remoteDesktopOperators) => {
  makeCall('startWatchingRemoteDesktop', { remoteDesktopUrl, remoteDesktopPassword, remoteDesktopOperators });
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

function getRemoteDesktopCanOperate() {
  const meetingId = Auth.meetingID;
  const userId = Auth.userID;
  const meeting = Meetings.findOne({ meetingId }, { fields: { remoteDesktopOperators: 1 } });

  if (!meeting) {
    return false;
  } if (meeting.remoteDesktopOperators === 'all') {
    return true;
  } if (meeting.remoteDesktopOperators === 'moderators') {
    /* return true is current user is a moderator */
    const user = Users.findOne({ meetingId, userId },
			       { fields: { role: 1 } }).role === ROLE_MODERATOR;
    return !!user;
  } if (meeting.remoteDesktopOperators === 'presenter') {
    /* return true is current user is the presenter */
    const user = Users.findOne({ meetingId, userId, presenter: true }, { presenter: 1 });
    return !!user;
  }
  /* fall-through case: remoteDesktopOperators is a string with the userId of the only operator */
  return (meeting.remoteDesktopOperators === userId);
}

export {
  getRemoteDesktopUrl,
  getRemoteDesktopPassword,
  getRemoteDesktopCanOperate,
  isUrlValid,
  startWatching,
  stopWatching,
};
