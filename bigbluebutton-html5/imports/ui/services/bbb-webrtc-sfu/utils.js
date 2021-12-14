import browserInfo from '/imports/utils/browserInfo';
import deviceInfo from '/imports/utils/deviceInfo';

const FORCE_RELAY_ON_FF = Meteor.settings.public.kurento.forceRelayOnFirefox;
const FORCE_RELAY = Meteor.settings.public.media.forceRelay;

/*
 * Whether TURN/relay usage should be forced to work around Firefox's lack of
 * support for regular nomination when dealing with ICE-litee peers (e.g.:
 * mediasoup). See: https://bugzilla.mozilla.org/show_bug.cgi?id=1034964
 *
 * iOS endpoints are ignored from the trigger because _all_ iOS browsers
 * are either native WebKit or WKWebView based (so they shouldn't be affected)
 */
const shouldForceRelay = () => {
  const { isFirefox } = browserInfo;
  const { isIos } = deviceInfo;

  return FORCE_RELAY || ((isFirefox && !isIos) && FORCE_RELAY_ON_FF);
};

export {
  shouldForceRelay,
};
