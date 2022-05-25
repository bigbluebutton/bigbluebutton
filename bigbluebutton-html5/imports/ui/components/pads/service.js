import _ from 'lodash';
import Pads, { PadsSessions, PadsUpdates } from '/imports/api/pads';
import { makeCall } from '/imports/ui/services/api';
import Auth from '/imports/ui/services/auth';
import Settings from '/imports/ui/services/settings';

const PADS_CONFIG = Meteor.settings.public.pads;
const THROTTLE_TIMEOUT = 2000;

const getLang = () => {
  const { locale } = Settings.application;
  return locale ? locale.toLowerCase() : '';
};

const getParams = () => {
  const config = {};
  config.lang = getLang();
  config.rtl = document.documentElement.getAttribute('dir') === 'rtl';

  const params = Object.keys(config)
    .map((key) => `${key}=${encodeURIComponent(config[key])}`)
    .join('&');
  return params;
};

const getPadId = (externalId) => makeCall('getPadId', externalId);

const createGroup = (externalId, model, name) => makeCall('createGroup', externalId, model, name);

const hasPad = (externalId) => {
  const pad = Pads.findOne(
    {
      meetingId: Auth.meetingID,
      externalId,
    },
  );

  return pad !== undefined;
};

const createSession = (externalId) => makeCall('createSession', externalId);

const throttledCreateSession = _.throttle(createSession, THROTTLE_TIMEOUT, {
  leading: true,
  trailing: false,
});

const buildPadURL = (padId) => {
  if (padId) {
    const padsSessions = PadsSessions.findOne({});
    if (padsSessions && padsSessions.sessions) {
      const params = getParams();
      const sessionIds = padsSessions.sessions.map(session => Object.values(session)).join(',');
      const url = Auth.authenticateURL(`${PADS_CONFIG.url}/auth_session?padName=${padId}&sessionID=${sessionIds}&${params}`);
      return url;
    }
  }

  return null;
};

const getRev = (externalId) => {
  const updates = PadsUpdates.findOne(
    {
      meetingId: Auth.meetingID,
      externalId,
    }, { fields: { rev: 1 } },
  );

  return updates ? updates.rev : 0;
};

const getPadTail = (externalId) => {
  const updates = PadsUpdates.findOne(
    {
      meetingId: Auth.meetingID,
      externalId,
    }, { fields: { tail: 1 } },
  );

  if (updates && updates.tail) return updates.tail;

  return '';
};

const getPadContent = (externalId) => {
  const updates = PadsUpdates.findOne(
    {
      meetingId: Auth.meetingID,
      externalId,
    }, { fields: { content: 1 } },
  );

  if (updates && updates.content) return updates.content;

  return '';
};

export default {
  getPadId,
  createGroup,
  hasPad,
  createSession: (externalId) => throttledCreateSession(externalId),
  buildPadURL,
  getRev,
  getPadTail,
  getPadContent,
};
