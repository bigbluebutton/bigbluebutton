import ConnectionStatus from '/imports/api/connection-status';
import Users from '/imports/api/users';
import Auth from '/imports/ui/services/auth';
import { makeCall } from '/imports/ui/services/api';

const STATS = Meteor.settings.public.stats;
const ROLE_MODERATOR = Meteor.settings.public.user.role_moderator;

const addConnectionStatus = (level) => {
  if (level !== '') makeCall('addConnectionStatus', level);
};

const sortLevel = (a, b) => {
  const indexOfA = STATS.level.indexOf(a.level);
  const indexOfB = STATS.level.indexOf(b.level);

  if (indexOfA < indexOfB) return 1;
  if (indexOfA === indexOfB) return 0;
  if (indexOfA > indexOfB) return -1;
};

const getConnectionStatus = () => {
  const connectionStatus = ConnectionStatus.find(
    { meetingId: Auth.meetingID },
  ).fetch().map(status => {
    const {
      userId,
      level,
      timestamp,
    } = status;

    return {
      userId,
      level,
      timestamp,
    };
  });

  return Users.find(
    { meetingId: Auth.meetingID },
    { fields:
      {
        userId: 1,
        name: 1,
        role: 1,
      },
    },
  ).fetch().reduce((result, user) => {
    const {
      userId,
      role,
      name,
    } = user;

    const status = connectionStatus.find(status => status.userId === userId);

    if (status) {
      result.push({
        name,
        you: Auth.userID === userId,
        moderator: role === ROLE_MODERATOR,
        level: status.level,
        timestamp: status.timestamp,
      });
    }

    return result;
  }, []).sort(sortLevel);
};

const isEnabled = () => STATS.enabled;

export default {
  addConnectionStatus,
  getConnectionStatus,
  isEnabled,
};
