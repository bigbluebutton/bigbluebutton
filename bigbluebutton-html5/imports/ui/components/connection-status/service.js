import ConnectionStatus from '/imports/api/connection-status';
import Users from '/imports/api/users';
import Auth from '/imports/ui/services/auth';
import { makeCall } from '/imports/ui/services/api';

const STATS = Meteor.settings.public.stats;
const ROLE_MODERATOR = Meteor.settings.public.user.role_moderator;

let audioStats = '';
const audioStatsDep = new Tracker.Dependency();

let statsTimeout = null;

const getHelp = () => STATS.help;

const getLevel = () => STATS.level;

const getAudioStats = () => {
  audioStatsDep.depend();
  return audioStats;
};

const setAudioStats = (level = '') => {
  if (audioStats !== level) {
    audioStats = level;
    audioStatsDep.changed();
    addConnectionStatus(level);
  }
};

const handleAudioStatsEvent = (event) => {
  const { detail } = event;
  if (detail) {
    const { loss, jitter } = detail;
    let active = false;
    // From higher to lower
    for (let i = STATS.level.length - 1; i >= 0; i--) {
      if (loss > STATS.loss[i] || jitter > STATS.jitter[i]) {
        active = true;
        setAudioStats(STATS.level[i]);
        break;
      }
    }
    if (active) {
      if (statsTimeout !== null) clearTimeout(statsTimeout);
      statsTimeout = setTimeout(() => {
        setAudioStats();
      }, STATS.length * STATS.interval);
    }
  }
};

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
        color: 1,
        connectionStatus: 1,
      },
    },
  ).fetch().reduce((result, user) => {
    const {
      userId,
      name,
      role,
      color,
      connectionStatus: userStatus,
    } = user;

    const status = connectionStatus.find(status => status.userId === userId);

    if (status) {
      result.push({
        name,
        offline: userStatus === 'offline',
        you: Auth.userID === userId,
        moderator: role === ROLE_MODERATOR,
        color,
        level: status.level,
        timestamp: status.timestamp,
      });
    }

    return result;
  }, []).sort(sortLevel);
};

const isEnabled = () => STATS.enabled;

if (STATS.enabled) {
  window.addEventListener('audiostats', handleAudioStatsEvent);
}

export default {
  addConnectionStatus,
  getConnectionStatus,
  getAudioStats,
  getHelp,
  getLevel,
  isEnabled,
};
