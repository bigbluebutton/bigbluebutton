import BaseAudioBridge from './base';
import Auth from '/imports/ui/services/auth';
import { fetchWebRTCMappedStunTurnServers } from '/imports/utils/fetchStunTurnServers';
import playAndRetry from '/imports/utils/mediaElementPlayRetry';
import logger from '/imports/startup/client/logger';

const SFU_URL = Meteor.settings.public.kurento.wsUrl;
const MEDIA = Meteor.settings.public.media;
const MEDIA_TAG = MEDIA.mediaTag.replace(/#/g, '');
const GLOBAL_AUDIO_PREFIX = 'GLOBAL_AUDIO_';
const RECONNECT_TIMEOUT_MS = 15000;

export default class KurentoAudioBridge extends BaseAudioBridge {
  constructor(userData) {
    super();
    const {
      userId,
      username,
      voiceBridge,
      meetingId,
      sessionToken,
    } = userData;

    this.user = {
      userId,
      name: username,
      sessionToken,
    };

    this.media = {
      inputDevice: {},
    };


    this.internalMeetingID = meetingId;
    this.voiceBridge = voiceBridge;
    this.reconnectOngoing = false;
    this.hasSuccessfullyStarted = false;
  }

  static normalizeError(error = {}) {
    const errorMessage = error.name || error.message || error.reason || 'Unknown error';
    const errorCode = error.code || undefined;
    let errorReason = error.reason || error.id || 'Undefined reason';

    // HOPEFULLY TEMPORARY
    // The errors are often just strings so replace the errorReason if that's the case
    if (typeof error === 'string') {
      errorReason = error;
    }
    // END OF HOPEFULLY TEMPORARY

    return { errorMessage, errorCode, errorReason };
  }


  joinAudio({ isListenOnly, inputStream }, callback) {
    return new Promise(async (resolve, reject) => {
      this.callback = callback;
      let iceServers = [];

      try {
        iceServers = await fetchWebRTCMappedStunTurnServers(this.user.sessionToken);
      } catch (error) {
        logger.error({ logCode: 'sfuaudiobridge_stunturn_fetch_failed' },
          'SFU audio bridge failed to fetch STUN/TURN info, using default servers');
      } finally {
        logger.debug({ logCode: 'sfuaudiobridge_stunturn_fetch_sucess', extraInfo: { iceServers } },
          'SFU audio bridge got STUN/TURN servers');
        const options = {
          wsUrl: Auth.authenticateURL(SFU_URL),
          userName: this.user.name,
          caleeName: `${GLOBAL_AUDIO_PREFIX}${this.voiceBridge}`,
          iceServers,
          logger,
          inputStream,
        };

        const audioTag = document.getElementById(MEDIA_TAG);

        const playElement = () => {
          const mediaTagPlayed = () => {
            logger.info({
              logCode: 'listenonly_media_play_success',
            }, 'Listen only media played successfully');
            resolve(this.callback({ status: this.baseCallStates.started }));
          };
          if (audioTag.paused) {
            // Tag isn't playing yet. Play it.
            audioTag.play()
              .then(mediaTagPlayed)
              .catch((error) => {
                // NotAllowedError equals autoplay issues, fire autoplay handling event.
                // This will be handled in audio-manager.
                if (error.name === 'NotAllowedError') {
                  logger.error({
                    logCode: 'listenonly_error_autoplay',
                    extraInfo: { errorName: error.name },
                  }, 'Listen only media play failed due to autoplay error');
                  const tagFailedEvent = new CustomEvent('audioPlayFailed', { detail: { mediaElement: audioTag } });
                  window.dispatchEvent(tagFailedEvent);
                  resolve(this.callback({
                    status: this.baseCallStates.autoplayBlocked,
                  }));
                } else {
                  // Tag failed for reasons other than autoplay. Log the error and
                  // try playing again a few times until it works or fails for good
                  const played = playAndRetry(audioTag);
                  if (!played) {
                    logger.error({
                      logCode: 'listenonly_error_media_play_failed',
                      extraInfo: { errorName: error.name },
                    }, `Listen only media play failed due to ${error.name}`);
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

        const onSuccess = () => {
          const { webRtcPeer } = window.kurentoManager.kurentoAudio;

          this.hasSuccessfullyStarted = true;
          if (webRtcPeer) {
            const stream = webRtcPeer.getRemoteStream();
            audioTag.pause();
            audioTag.srcObject = stream;
            audioTag.muted = false;
            playElement();
          } else {
            this.callback({
              status: this.baseCallStates.failed,
              error: this.baseErrorCodes.CONNECTION_ERROR,
              bridgeError: 'No WebRTC Peer',
            });
          }

          if (this.reconnectOngoing) {
            this.reconnectOngoing = false;
            clearTimeout(this.reconnectTimeout);
          }
        };

        const onFail = (error) => {
          const { errorMessage, errorCode, errorReason } = KurentoAudioBridge.normalizeError(error);

          // Listen only connected successfully already and dropped mid-call.
          // Try to reconnect ONCE (binded to reconnectOngoing flag)
          if (this.hasSuccessfullyStarted && !this.reconnectOngoing) {
            logger.error({
              logCode: 'listenonly_error_try_to_reconnect',
              extraInfo: { errorMessage, errorCode, errorReason },
            }, `Listen only failed for an ongoing session, try to reconnect. - reason: ${errorReason}`);
            window.kurentoExitAudio();
            this.callback({ status: this.baseCallStates.reconnecting });
            this.reconnectOngoing = true;
            // Set up a reconnectionTimeout in case the server is unresponsive
            // for some reason. If it gets triggered, end the session and stop
            // trying to reconnect
            this.reconnectTimeout = setTimeout(() => {
              this.callback({
                status: this.baseCallStates.failed,
                error: this.baseErrorCodes.CONNECTION_ERROR,
                bridgeError: 'Reconnect Timeout',
              });
              this.reconnectOngoing = false;
              this.hasSuccessfullyStarted = false;
              window.kurentoExitAudio();
            }, RECONNECT_TIMEOUT_MS);
            window.kurentoJoinAudio(
              MEDIA_TAG,
              this.voiceBridge,
              this.user.userId,
              this.internalMeetingID,
              onFail,
              onSuccess,
              options,
            );
          } else {
            // Already tried reconnecting once OR the user handn't succesfully
            // connected firsthand. Just finish the session and reject with error
            if (!this.reconnectOngoing) {
              logger.error({
                logCode: 'listenonly_error_failed_to_connect',
                extraInfo: { errorMessage, errorCode, errorReason },
              }, `Listen only failed when trying to start due to ${errorReason}`);
            } else {
              logger.error({
                logCode: 'listenonly_error_reconnect_failed',
                extraInfo: { errorMessage, errorCode, errorReason },
              }, `Listen only failed when trying to reconnect due to ${errorReason}`);
            }

            this.reconnectOngoing = false;
            this.hasSuccessfullyStarted = false;
            window.kurentoExitAudio();

            this.callback({
              status: this.baseCallStates.failed,
              error: this.baseErrorCodes.CONNECTION_ERROR,
              bridgeError: errorReason,
            });

            reject(errorReason);
          }
        };

        if (!isListenOnly) {
          return reject(new Error('Invalid bridge option'));
        }

        window.kurentoJoinAudio(
          MEDIA_TAG,
          this.voiceBridge,
          this.user.userId,
          this.internalMeetingID,
          onFail,
          onSuccess,
          options,
        );
      }
    });
  }

  async changeOutputDevice(value) {
    const audioContext = document.querySelector(`#${MEDIA_TAG}`);
    if (audioContext.setSinkId) {
      try {
        await audioContext.setSinkId(value);
        this.media.outputDeviceId = value;
      } catch (error) {
        logger.error({ logCode: 'sfuaudiobridge_changeoutputdevice_error', extraInfo: { error } },
          'SFU audio bridge failed to fetch STUN/TURN info, using default');
        throw new Error(this.baseErrorCodes.MEDIA_ERROR);
      }
    }

    return this.media.outputDeviceId || value;
  }

  getPeerConnection() {
    const { webRtcPeer } = window.kurentoManager.kurentoAudio;
    if (webRtcPeer) {
      return webRtcPeer.peerConnection;
    }
    return null;
  }

  exitAudio() {
    return new Promise((resolve) => {
      this.hasSuccessfullyStarted = false;
      window.kurentoExitAudio();
      return resolve(this.callback({ status: this.baseCallStates.ended }));
    });
  }
}
