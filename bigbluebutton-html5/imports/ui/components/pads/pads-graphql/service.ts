import { makeCall } from '/imports/ui/services/api';
import { PadsUpdates } from '/imports/api/pads';
import Auth from '/imports/ui/services/auth';
import Settings from '/imports/ui/services/settings';

const PADS_CONFIG = window.meetingClientSettings.public.pads;

const getLang = (): string => {
  // @ts-ignore While Meteor in the project
  const { locale } = Settings.application;
  return locale ? locale.toLowerCase() : '';
};

const getParams = () => {
  const config = {
    lang: getLang(),
    rtl: document.documentElement.getAttribute('dir') === 'rtl',
  };

  const params = Object.keys(config)
    .map((key) => `${key}=${encodeURIComponent(config[key as keyof typeof config])}`)
    .join('&');
  return params;
};

const createGroup = (externalId: string, model: string, name: string) => makeCall('createGroup', externalId, model, name);

const buildPadURL = (padId: string, sessionIds: Array<string>) => {
  const params = getParams();
  const sessionIdsStr = sessionIds.join(',');
  const url = Auth.authenticateURL(
    `${PADS_CONFIG.url}/auth_session?padName=${padId}&sessionID=${sessionIdsStr}&${params}`,
  );
  return url;
};

const getPadTail = (externalId: string) => {
  const updates = PadsUpdates.findOne(
    {
      meetingId: Auth.meetingID,
      externalId,
    }, { fields: { tail: 1 } },
  );

  if (updates && updates.tail) return updates.tail;

  return '';
};

export default {
  createGroup,
  buildPadURL,
  getPadTail,
  getParams,
};
