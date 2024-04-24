const COOKIE_CONFIG = window.meetingClientSettings.public.pads.cookie;
const PATH = COOKIE_CONFIG.path;
const SAME_SITE = COOKIE_CONFIG.sameSite;
const SECURE = COOKIE_CONFIG.secure;


const setCookie = (sessions) => {
  const sessionIds = sessions.map(session => Object.values(session)).join(',');
  document.cookie = `sessionID=${sessionIds}; path=${PATH}; SameSite=${SAME_SITE}; ${SECURE ? 'Secure' : ''}`;
};

export default {
  setCookie,
};
