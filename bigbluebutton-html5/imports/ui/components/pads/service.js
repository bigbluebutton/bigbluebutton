import { throttle } from 'radash';
import { makeCall } from '/imports/ui/services/api';
import Settings from '/imports/ui/services/settings';
import {
  screenshareHasEnded,
  isScreenBroadcasting,
} from '/imports/ui/components/screenshare/service';

const PADS_CONFIG = window.meetingClientSettings.public.pads;
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

const createSession = (externalId) => makeCall('createSession', externalId);

const throttledCreateSession = throttle({ interval: THROTTLE_TIMEOUT }, createSession);

const pinPad = (externalId, pinned, stopWatching) => {
  if (pinned) {
    // Stop external video sharing if it's running.
    if (typeof stopWatching === 'function') stopWatching();

    // Stop screen sharing if it's running.
    if (isScreenBroadcasting()) screenshareHasEnded();
  }

  makeCall('pinPad', externalId, pinned);
};

const throttledPinPad = throttle({ interval: 1000 }, pinPad);

export default {
  getPadId,
  createGroup,
  createSession: (externalId) => throttledCreateSession(externalId),
  getParams,
  pinPad: throttledPinPad,
};
