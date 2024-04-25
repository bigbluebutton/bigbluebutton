import { throttle } from 'radash';
import Settings from '/imports/ui/services/settings';
import {
  screenshareHasEnded,
  isScreenBroadcasting,
} from '/imports/ui/components/screenshare/service';

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

const pinPad = (externalId, pinned, stopWatching) => {
  if (pinned) {
    // Stop external video sharing if it's running.
    if (typeof stopWatching === 'function') stopWatching();

    // Stop screen sharing if it's running.
    if (isScreenBroadcasting()) screenshareHasEnded();
  }
};

const throttledPinPad = throttle({ interval: 1000 }, pinPad);

export default {
  getParams,
  pinPad: throttledPinPad,
};
