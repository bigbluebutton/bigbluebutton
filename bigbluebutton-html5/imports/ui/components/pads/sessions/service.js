import { PadsSessions } from '/imports/api/pads';

const COOKIE_CONFIG = Meteor.settings.public.pads.cookie;
const PATH = COOKIE_CONFIG.path;
const SAME_SITE = COOKIE_CONFIG.sameSite;
const SECURE = COOKIE_CONFIG.secure;

const getSessions = () => {
  const padsSessions = PadsSessions.findOne({});

  if (padsSessions) {
    return padsSessions.sessions;
  }

  return [];
};

const hasSession = (externalId) => {
  const padsSessions = PadsSessions.findOne({});

  if (padsSessions && padsSessions.sessions) {
    return padsSessions.sessions.some(session => session[externalId]);
  }

  return false;
};

const setCookie = (sessions) => {
  const sessionIds = sessions.map(session => Object.values(session)).join(',');
  document.cookie = `sessionID=${sessionIds}; path=${PATH}; SameSite=${SAME_SITE}; ${SECURE ? 'Secure' : ''}`;
};

export default {
  getSessions,
  hasSession,
  setCookie,
};
