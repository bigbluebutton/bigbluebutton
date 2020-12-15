import Meetings from '/imports/api/meetings';
import logger from '/imports/startup/client/logger';
import { fetchWebRTCMappedStunTurnServers, getMappedFallbackStun } from '/imports/utils/fetchStunTurnServers';
import loadAndPlayMediaStream from '/imports/ui/services/bbb-webrtc-sfu/load-play';

const {
  constraints: GDM_CONSTRAINTS,
  mediaTimeouts: MEDIA_TIMEOUTS,
} = Meteor.settings.public.kurento.screenshare;

const {
  baseTimeout: BASE_MEDIA_TIMEOUT,
  maxTimeout: MAX_MEDIA_TIMEOUT,
  maxConnectionAttempts: MAX_CONN_ATTEMPTS,
  timeoutIncreaseFactor: TIMEOUT_INCREASE_FACTOR,
} = MEDIA_TIMEOUTS;

const hasDisplayMedia = (typeof navigator.getDisplayMedia === 'function'
  || (navigator.mediaDevices && typeof navigator.mediaDevices.getDisplayMedia === 'function'));

const getConferenceBridge = () => Meetings.findOne().voiceProp.voiceConf;

const getScreenStream = async () => {
  const gDMCallback = (stream) => {
    // Some older Chromium variants choke on gDM when audio: true by NOT generating
    // a promise rejection AND not generating a valid input screen stream, need to
    // work around that manually for now - prlanzarin
    if (stream == null) {
      return Promise.reject({
        errorMessage: 'NotSupportedError',
        errorName: 'NotSupportedError',
        errorCode: 9,
      });
    }

    if (typeof stream.getVideoTracks === 'function'
      && typeof constraints.video === 'object') {
      stream.getVideoTracks().forEach(track => {
        if (typeof track.applyConstraints  === 'function') {
          track.applyConstraints(constraints.video).catch(error => {
            logger.warn({
              logCode: 'screenshare_videoconstraint_failed',
              extraInfo: { errorName: error.name, errorCode: error.code },
            },
              'Error applying screenshare video constraint');
          });
        }
      });
    }

    if (typeof stream.getAudioTracks === 'function'
      && typeof constraints.audio === 'object') {
      stream.getAudioTracks().forEach(track => {
        if (typeof track.applyConstraints  === 'function') {
          track.applyConstraints(constraints.audio).catch(error => {
            logger.warn({
              logCode: 'screenshare_audioconstraint_failed',
              extraInfo: { errorName: error.name, errorCode: error.code },
            }, 'Error applying screenshare audio constraint');
          });
        }
      });
    }

    return Promise.resolve(stream);
  }

  const constraints = hasDisplayMedia ? GDM_CONSTRAINTS : null;

  if (hasDisplayMedia) {
    // The double checks here is to detect whether gDM is in navigator or mediaDevices
    // because it can be on either of them depending on the browser+version
    if (typeof navigator.getDisplayMedia === 'function') {
      return navigator.getDisplayMedia(constraints)
        .then(gDMCallback)
        .catch(error => {
          logger.error({
            logCode: 'screenshare_getdisplaymedia_failed',
            extraInfo: { errorName: error.name, errorCode: error.code },
          }, 'getDisplayMedia call failed');
          return Promise.reject({ errorCode: error.code, errorMessage: error.name || error.message });
        });
    } else if (navigator.mediaDevices && typeof navigator.mediaDevices.getDisplayMedia === 'function') {
      return navigator.mediaDevices.getDisplayMedia(constraints)
        .then(gDMCallback)
        .catch(error => {
          logger.error({
            logCode: 'screenshare_getdisplaymedia_failed',
            extraInfo: { errorName: error.name, errorCode: error.code },
          }, 'getDisplayMedia call failed');
          return Promise.reject({ errorCode: error.code, errorMessage: error.name || error.message });
        });
    }
  } else {
    // getDisplayMedia isn't supported, error its way out
    return Promise.reject({
      errorMessage: 'NotSupportedError',
      errorName: 'NotSupportedError',
      errorCode: 9,
    });
  }
}

const getIceServers = (sessionToken) => {
  return fetchWebRTCMappedStunTurnServers(sessionToken).catch(error => {
    logger.error({
      logCode: 'screenshare_fetchstunturninfo_error',
      extraInfo: { error }
    }, 'Screenshare bridge failed to fetch STUN/TURN info');
    return getMappedFallbackStun();
  });
}

const getNextReconnectionInterval = (oldInterval) => {
  return Math.min(
    TIMEOUT_INCREASE_FACTOR * oldInterval,
    MAX_MEDIA_TIMEOUT,
  );
}

const streamHasAudioTrack = (stream) => {
  return stream
    && typeof stream.getAudioTracks === 'function'
    && stream.getAudioTracks().length >= 1;
}

const dispatchAutoplayHandlingEvent = (mediaElement) => {
  const tagFailedEvent = new CustomEvent('screensharePlayFailed',
    { detail: { mediaElement } });
  window.dispatchEvent(tagFailedEvent);
}

const screenshareLoadAndPlayMediaStream = (stream, mediaElement, muted) => {
  return loadAndPlayMediaStream(stream, mediaElement, muted).catch(error => {
    // NotAllowedError equals autoplay issues, fire autoplay handling event.
    // This will be handled in the screenshare react component.
    if (error.name === 'NotAllowedError') {
      logger.error({
        logCode: 'screenshare_error_autoplay',
        extraInfo: { errorName: error.name },
      }, 'Screen share media play failed: autoplay error');
      dispatchAutoplayHandlingEvent(mediaElement);
    } else {
      const normalizedError = {
        errorCode: 1104,
        errorMessage: error.message || 'SCREENSHARE_PLAY_FAILED',
      };
      throw normalizedError;
    }
  });
}

export default {
  hasDisplayMedia,
  getConferenceBridge,
  getScreenStream,
  getIceServers,
  getNextReconnectionInterval,
  streamHasAudioTrack,
  screenshareLoadAndPlayMediaStream,
  BASE_MEDIA_TIMEOUT,
  MAX_CONN_ATTEMPTS,
};
