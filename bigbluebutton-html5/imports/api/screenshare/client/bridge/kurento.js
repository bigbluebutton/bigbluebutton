import Auth from '/imports/ui/services/auth';
import BridgeService from './service';
import { fetchWebRTCMappedStunTurnServers, getMappedFallbackStun } from '/imports/utils/fetchStunTurnServers';
import playAndRetry from '/imports/utils/mediaElementPlayRetry';
import logger from '/imports/startup/client/logger';

const SFU_CONFIG = Meteor.settings.public.kurento;
const SFU_URL = SFU_CONFIG.wsUrl;
const CHROME_DEFAULT_EXTENSION_KEY = SFU_CONFIG.chromeDefaultExtensionKey;
const CHROME_CUSTOM_EXTENSION_KEY = SFU_CONFIG.chromeExtensionKey;
const CHROME_SCREENSHARE_SOURCES = SFU_CONFIG.screenshare.chromeScreenshareSources;
const FIREFOX_SCREENSHARE_SOURCE = SFU_CONFIG.screenshare.firefoxScreenshareSource;
const SCREENSHARE_VIDEO_TAG = 'screenshareVideo';

const CHROME_EXTENSION_KEY = CHROME_CUSTOM_EXTENSION_KEY === 'KEY' ? CHROME_DEFAULT_EXTENSION_KEY : CHROME_CUSTOM_EXTENSION_KEY;

const getUserId = () => Auth.userID;

const getMeetingId = () => Auth.meetingID;

const getUsername = () => Auth.fullname;

const getSessionToken = () => Auth.sessionToken;

export default class KurentoScreenshareBridge {
  static normalizeError(error = {}) {
    const errorMessage = error.name || error.message || error.reason || 'Unknown error';
    const errorCode = error.code || undefined;
    const errorReason = error.reason || error.id || 'Undefined reason';

    return { errorMessage, errorCode, errorReason };
  }

  static handlePresenterFailure(error, started = false) {
    const normalizedError = KurentoScreenshareBridge.normalizeError(error);
    if (!started) {
      logger.error({
        logCode: 'screenshare_presenter_error_failed_to_connect',
        extraInfo: { ...normalizedError },
      }, `Screenshare presenter failed when trying to start due to ${normalizedError.errorMessage}`);
    } else {
      logger.error({
        logCode: 'screenshare_presenter_error_failed_after_success',
        extraInfo: { ...normalizedError },
      }, `Screenshare presenter failed during working session due to ${normalizedError.errorMessage}`);
    }
    return normalizedError;
  }

  static handleViewerFailure(error, started = false) {
    const normalizedError = KurentoScreenshareBridge.normalizeError(error);
    if (!started) {
      logger.error({
        logCode: 'screenshare_viewer_error_failed_to_connect',
        extraInfo: { ...normalizedError },
      }, `Screenshare viewer failed when trying to start due to ${normalizedError.errorMessage}`);
    } else {
      logger.error({
        logCode: 'screenshare_viewer_error_failed_after_success',
        extraInfo: { ...normalizedError },
      }, `Screenshare viewer failed during working session due to ${normalizedError.errorMessage}`);
    }
    return normalizedError;
  }

  static playElement(screenshareMediaElement) {
    const mediaTagPlayed = () => {
      logger.info({
        logCode: 'screenshare_media_play_success',
      }, 'Screenshare media played successfully');
    };

    if (screenshareMediaElement.paused) {
      // Tag isn't playing yet. Play it.
      screenshareMediaElement.play()
        .then(mediaTagPlayed)
        .catch((error) => {
          // NotAllowedError equals autoplay issues, fire autoplay handling event.
          // This will be handled in the screenshare react component.
          if (error.name === 'NotAllowedError') {
            logger.error({
              logCode: 'screenshare_error_autoplay',
              extraInfo: { errorName: error.name },
            }, 'Screenshare play failed due to autoplay error');
            const tagFailedEvent = new CustomEvent('screensharePlayFailed',
              { detail: { mediaElement: screenshareMediaElement } });
            window.dispatchEvent(tagFailedEvent);
          } else {
            // Tag failed for reasons other than autoplay. Log the error and
            // try playing again a few times until it works or fails for good
            const played = playAndRetry(screenshareMediaElement);
            if (!played) {
              logger.error({
                logCode: 'screenshare_error_media_play_failed',
                extraInfo: { errorName: error.name },
              }, `Screenshare media play failed due to ${error.name}`);
            } else {
              mediaTagPlayed();
            }
          }
        });
    } else {
      // Media tag is already playing, so log a success. This is really a
      // logging fallback for a case that shouldn't happen. But if it does
      // (ie someone re-enables the autoPlay prop in the element), then it
      // means the stream is playing properly and it'll be logged.
      mediaTagPlayed();
    }
  };

  static screenshareElementLoadAndPlay(stream, element, muted) {
    element.muted = muted;
    element.pause();
    element.srcObject = stream;
    KurentoScreenshareBridge.playElement(element);
  }

  kurentoViewLocalPreview() {
    const screenshareMediaElement = document.getElementById(SCREENSHARE_VIDEO_TAG);
    const { webRtcPeer } = window.kurentoManager.kurentoScreenshare;

    if (webRtcPeer) {
      const stream = webRtcPeer.getLocalStream();
      KurentoScreenshareBridge.screenshareElementLoadAndPlay(stream, screenshareMediaElement, true);
    }
  }

  async kurentoViewScreen() {
    const screenshareMediaElement = document.getElementById(SCREENSHARE_VIDEO_TAG);
    let iceServers = [];
    let started = false;

    try {
      iceServers = await fetchWebRTCMappedStunTurnServers(getSessionToken());
    } catch (error) {
      logger.error({
        logCode: 'screenshare_viewer_fetchstunturninfo_error',
        extraInfo: { error }
      }, 'Screenshare bridge failed to fetch STUN/TURN info, using default');
      iceServers = getMappedFallbackStun();
    } finally {
      const options = {
        wsUrl: Auth.authenticateURL(SFU_URL),
        iceServers,
        logger,
        userName: getUsername(),
      };

      const onFail = (error) => {
        KurentoScreenshareBridge.handleViewerFailure(error, started);
      };

      // Callback for the kurento-extension.js script. It's called when the whole
      // negotiation with SFU is successful. This will load the stream into the
      // screenshare media element and play it manually.
      const onSuccess = () => {
        started = true;
        const { webRtcPeer } = window.kurentoManager.kurentoVideo;
        if (webRtcPeer) {
          const stream = webRtcPeer.getRemoteStream();
          KurentoScreenshareBridge.screenshareElementLoadAndPlay(
            stream,
            screenshareMediaElement,
            true,
          );
        }
      };

      window.kurentoWatchVideo(
        SCREENSHARE_VIDEO_TAG,
        BridgeService.getConferenceBridge(),
        getUserId(),
        getMeetingId(),
        onFail,
        onSuccess,
        options,
      );
    }
  }

  kurentoExitVideo() {
    window.kurentoExitVideo();
  }

  async kurentoShareScreen(onFail, stream) {
    let iceServers = [];
    try {
      iceServers = await fetchWebRTCMappedStunTurnServers(getSessionToken());
    } catch (error) {
      logger.error({ logCode: 'screenshare_presenter_fetchstunturninfo_error' },

        'Screenshare bridge failed to fetch STUN/TURN info, using default');
      iceServers = getMappedFallbackStun();
    } finally {
      const options = {
        wsUrl: Auth.authenticateURL(SFU_URL),
        chromeExtension: CHROME_EXTENSION_KEY,
        chromeScreenshareSources: CHROME_SCREENSHARE_SOURCES,
        firefoxScreenshareSource: FIREFOX_SCREENSHARE_SOURCE,
        iceServers,
        logger,
        userName: getUsername(),
      };

      let started = false;

      const failureCallback = (error) => {
        const normalizedError = KurentoScreenshareBridge.handlePresenterFailure(error, started);
        onFail(normalizedError);
      };

      const successCallback = () => {
        started = true;
        logger.info({
          logCode: 'screenshare_presenter_start_success',
        }, 'Screenshare presenter started succesfully');
      };

      options.stream = stream || undefined;

      window.kurentoShareScreen(
        SCREENSHARE_VIDEO_TAG,
        BridgeService.getConferenceBridge(),
        getUserId(),
        getMeetingId(),
        failureCallback,
        successCallback,
        options,
      );
    }
  }

  kurentoExitScreenShare() {
    window.kurentoExitScreenShare();
  }
}
