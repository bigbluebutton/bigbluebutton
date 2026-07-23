import browserInfo from '/imports/utils/browserInfo';
import deviceInfo from '/imports/utils/deviceInfo';

/*
 * Whether TURN/relay usage should be forced for the LiveKit room. Mirrors the
 * SFU bridge logic but reads from public.media.livekit so it can be tuned
 * independently.
 *
 * The Firefox trigger is a testing measure to debug specific connectivity issues
 * (unrelated to ICE lite) between Pion/LK and Firefox.
 */
const shouldForceRelay = (hasTurnServer: boolean): boolean => {
  const { isFirefox } = browserInfo;
  const { isIos } = deviceInfo;
  const livekitSettings = window.meetingClientSettings.public.media.livekit;
  const FORCE_RELAY = livekitSettings?.forceRelay ?? false;
  const FORCE_RELAY_ON_FF = livekitSettings?.forceRelayOnFirefox ?? false;

  // FORCE_RELAY is a hard policy ("force all media via TURN") and is intentionally
  // not mandated by hasTurnServer: if TURN is unreachable, ICE failure is the
  // desired outcome rather than a silent downgrade.
  // The Firefox auto-trigger, in contrast, is a workaround that only makes sense
  // when TURN is actually present.
  return FORCE_RELAY || ((isFirefox && !isIos) && FORCE_RELAY_ON_FF && hasTurnServer);
};

export default shouldForceRelay;
