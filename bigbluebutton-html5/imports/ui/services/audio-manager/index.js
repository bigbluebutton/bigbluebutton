import { Tracker } from 'meteor/tracker';
import KurentoBridge from '/imports/api/audio/client/bridge/kurento';

import Auth from '/imports/ui/services/auth';
import VoiceUsers from '/imports/api/voice-users';
import SIPBridge from '/imports/api/audio/client/bridge/sip';
import logger from '/imports/startup/client/logger';
import { notify } from '/imports/ui/services/notification';
import playAndRetry from '/imports/utils/mediaElementPlayRetry';
import iosWebviewAudioPolyfills from '/imports/utils/ios-webview-audio-polyfills';
import { tryGenerateIceCandidates } from '/imports/utils/safari-webrtc';
import { monitorAudioConnection } from '/imports/utils/stats';
import AudioErrors from './error-codes';

const ENABLE_NETWORK_MONITORING = Meteor.settings.public.networkMonitoring.enableNetworkMonitoring;

const MEDIA = Meteor.settings.public.media;
const MEDIA_TAG = MEDIA.mediaTag;
const ECHO_TEST_NUMBER = MEDIA.echoTestNumber;
const MAX_LISTEN_ONLY_RETRIES = 1;
const LISTEN_ONLY_CALL_TIMEOUT_MS = MEDIA.listenOnlyCallTimeout || 25000;
const DEFAULT_INPUT_DEVICE_ID = 'default';
const DEFAULT_OUTPUT_DEVICE_ID = 'default';

const CALL_STATES = {
  STARTED: 'started',
  ENDED: 'ended',
  FAILED: 'failed',
  RECONNECTING: 'reconnecting',
  AUTOPLAY_BLOCKED: 'autoplayBlocked',
};

class AudioManager {
  constructor() {
    this._inputDevice = {
      value: DEFAULT_INPUT_DEVICE_ID,
      tracker: new Tracker.Dependency(),
    };

    this.defineProperties({
      isMuted: false,
      isConnected: false,
      isConnecting: false,
      isHangingUp: false,
      isListenOnly: false,
      isEchoTest: false,
      isTalking: false,
      isWaitingPermissions: false,
      error: null,
      outputDeviceId: null,
      muteHandle: null,
      autoplayBlocked: false,
    });

    this.useKurento = Meteor.settings.public.kurento.enableListenOnly;
    this.failedMediaElements = [];
    this.handlePlayElementFailed = this.handlePlayElementFailed.bind(this);
    this.monitor = this.monitor.bind(this);
  }

  init(userData) {
    this.bridge = new SIPBridge(userData); // no alternative as of 2019-03-08
    if (this.useKurento) {
      this.listenOnlyBridge = new KurentoBridge(userData);
    }
    this.userData = userData;
    this.initialized = true;
  }

  setAudioMessages(messages, intl) {
    this.messages = messages;
    this.intl = intl;
  }

  defineProperties(obj) {
    Object.keys(obj).forEach((key) => {
      const privateKey = `_${key}`;
      this[privateKey] = {
        value: obj[key],
        tracker: new Tracker.Dependency(),
      };

      Object.defineProperty(this, key, {
        set: (value) => {
          this[privateKey].value = value;
          this[privateKey].tracker.changed();
        },
        get: () => {
          this[privateKey].tracker.depend();
          return this[privateKey].value;
        },
      });
    });
  }

  joinMicrophone() {
    this.isListenOnly = false;
    this.isEchoTest = false;

    return this.onAudioJoining.bind(this)()
      .then(() => {
        const callOptions = {
          isListenOnly: false,
          extension: null,
          inputStream: this.inputStream,
        };
        return this.joinAudio(callOptions, this.callStateCallback.bind(this));
      });
  }

  joinEchoTest() {
    this.isListenOnly = false;
    this.isEchoTest = true;

    return this.onAudioJoining.bind(this)()
      .then(() => {
        const callOptions = {
          isListenOnly: false,
          extension: ECHO_TEST_NUMBER,
          inputStream: this.inputStream,
        };
        logger.info({ logCode: 'audiomanager_join_echotest', extraInfo: { logType: 'user_action' } }, 'User requested to join audio conference with mic');
        return this.joinAudio(callOptions, this.callStateCallback.bind(this));
      });
  }

  joinAudio(callOptions, callStateCallback) {
    return this.bridge.joinAudio(callOptions,
      callStateCallback.bind(this)).catch((error) => {
      const { name } = error;

      if (!name) {
        throw error;
      }

      switch (name) {
        case 'NotAllowedError':
          logger.error({
            logCode: 'audiomanager_error_getting_device',
            extraInfo: {
              errorName: error.name,
              errorMessage: error.message,
            },
          }, `Error getting microphone - {${error.name}: ${error.message}}`);
          break;
        case 'NotFoundError':
          logger.error({
            logCode: 'audiomanager_error_device_not_found',
            extraInfo: {
              errorName: error.name,
              errorMessage: error.message,
            },
          }, `Error getting microphone - {${error.name}: ${error.message}}`);
          break;

        default:
          break;
      }

      this.isConnecting = false;
      this.isWaitingPermissions = false;

      throw {
        type: 'MEDIA_ERROR',
      };
    });
  }

  async joinListenOnly(r = 0) {
    let retries = r;
    this.isListenOnly = true;
    this.isEchoTest = false;

    // The kurento bridge isn't a full audio bridge yet, so we have to differ it
    const bridge = this.useKurento ? this.listenOnlyBridge : this.bridge;

    const callOptions = {
      isListenOnly: true,
      extension: null,
      inputStream: this.createListenOnlyStream(),
    };

    // WebRTC restrictions may need a capture device permission to release
    // useful ICE candidates on recvonly/no-gUM peers
    try {
      await tryGenerateIceCandidates();
    } catch (error) {
      logger.error({
        logCode: 'listenonly_no_valid_candidate_gum_failure',
        extraInfo: {
          errorName: error.name,
          errorMessage: error.message,
        },
      }, `Forced gUM to release additional ICE candidates failed due to ${error.name}.`);
    }

    // Call polyfills for webrtc client if navigator is "iOS Webview"
    const userAgent = window.navigator.userAgent.toLocaleLowerCase();
    if ((userAgent.indexOf('iphone') > -1 || userAgent.indexOf('ipad') > -1)
       && userAgent.indexOf('safari') === -1) {
      iosWebviewAudioPolyfills();
    }

    // We need this until we upgrade to SIP 9x. See #4690
    const listenOnlyCallTimeoutErr = this.useKurento ? 'KURENTO_CALL_TIMEOUT' : 'SIP_CALL_TIMEOUT';

    const iceGatheringTimeout = new Promise((resolve, reject) => {
      setTimeout(reject, LISTEN_ONLY_CALL_TIMEOUT_MS, listenOnlyCallTimeoutErr);
    });

    const exitKurentoAudio = () => {
      if (this.useKurento) {
        bridge.exitAudio();
        const audio = document.querySelector(MEDIA_TAG);
        audio.muted = false;
      }
    };

    const handleListenOnlyError = (err) => {
      if (iceGatheringTimeout) {
        clearTimeout(iceGatheringTimeout);
      }

      const errorReason = (typeof err === 'string' ? err : undefined) || err.errorReason || err.errorMessage;
      const bridgeInUse = (this.useKurento ? 'Kurento' : 'SIP');

      logger.error({
        logCode: 'audiomanager_listenonly_error',
        extraInfo: {
          errorReason,
          audioBridge: bridgeInUse,
          retries,
        },
      }, `Listen only error - ${errorReason} - bridge: ${bridgeInUse}`);
    };

    logger.info({ logCode: 'audiomanager_join_listenonly', extraInfo: { logType: 'user_action' } }, 'user requested to connect to audio conference as listen only');

    window.addEventListener('audioPlayFailed', this.handlePlayElementFailed);

    return this.onAudioJoining()
      .then(() => Promise.race([
        bridge.joinAudio(callOptions, this.callStateCallback.bind(this)),
        iceGatheringTimeout,
      ]))
      .catch(async (err) => {
        handleListenOnlyError(err);

        if (retries < MAX_LISTEN_ONLY_RETRIES) {
          // Fallback to SIP.js listen only in case of failure
          if (this.useKurento) {
            exitKurentoAudio();

            this.useKurento = false;

            const errorReason = (typeof err === 'string' ? err : undefined) || err.errorReason || err.errorMessage;

            logger.info({
              logCode: 'audiomanager_listenonly_fallback',
              extraInfo: {
                logType: 'fallback',
                errorReason,
              },
            }, `Falling back to FreeSWITCH listenOnly - cause: ${errorReason}`);
          }

          retries += 1;
          this.joinListenOnly(retries);
        }

        return null;
      });
  }

  onAudioJoining() {
    this.isConnecting = true;
    this.isMuted = false;
    this.error = false;

    return Promise.resolve();
  }

  exitAudio() {
    if (!this.isConnected) return Promise.resolve();

    const bridge = (this.useKurento && this.isListenOnly) ? this.listenOnlyBridge : this.bridge;

    this.isHangingUp = true;

    return bridge.exitAudio();
  }

  transferCall() {
    this.onTransferStart();
    return this.bridge.transferCall(this.onAudioJoin.bind(this));
  }

  onVoiceUserChanges(fields) {
    if (fields.muted !== undefined && fields.muted !== this.isMuted) {
      let muteState;
      this.isMuted = fields.muted;

      if (this.isMuted) {
        muteState = 'selfMuted';
        this.mute();
      } else {
        muteState = 'selfUnmuted';
        this.unmute();
      }

      window.parent.postMessage({ response: muteState }, '*');
    }

    if (fields.talking !== undefined && fields.talking !== this.isTalking) {
      this.isTalking = fields.talking;
    }

    if (this.isMuted) {
      this.isTalking = false;
    }
  }

  onAudioJoin() {
    this.isConnecting = false;
    this.isConnected = true;

    // listen to the VoiceUsers changes and update the flag
    if (!this.muteHandle) {
      const query = VoiceUsers.find({ intId: Auth.userID }, { fields: { muted: 1, talking: 1 } });
      this.muteHandle = query.observeChanges({
        added: (id, fields) => this.onVoiceUserChanges(fields),
        changed: (id, fields) => this.onVoiceUserChanges(fields),
      });
    }

    if (!this.isEchoTest) {
      window.parent.postMessage({ response: 'joinedAudio' }, '*');
      this.notify(this.intl.formatMessage(this.messages.info.JOINED_AUDIO));
      logger.info({ logCode: 'audio_joined' }, 'Audio Joined');
      if (ENABLE_NETWORK_MONITORING) this.monitor();
    }
  }

  onTransferStart() {
    this.isEchoTest = false;
    this.isConnecting = true;
  }

  onAudioExit() {
    this.isConnected = false;
    this.isConnecting = false;
    this.isHangingUp = false;
    this.autoplayBlocked = false;
    this.failedMediaElements = [];

    if (this.inputStream) {
      window.defaultInputStream.forEach(track => track.stop());
      this.inputStream.getTracks().forEach(track => track.stop());
      this.inputDevice = { id: 'default' };
    }

    if (!this.error && !this.isEchoTest) {
      this.notify(this.intl.formatMessage(this.messages.info.LEFT_AUDIO), false, 'audio_off');
    }
    if (!this.isEchoTest) {
      this.playHangUpSound();
    }

    window.parent.postMessage({ response: 'notInAudio' }, '*');
    window.removeEventListener('audioPlayFailed', this.handlePlayElementFailed);
  }

  callStateCallback(response) {
    return new Promise((resolve) => {
      const {
        STARTED,
        ENDED,
        FAILED,
        RECONNECTING,
        AUTOPLAY_BLOCKED,
      } = CALL_STATES;

      const {
        status,
        error,
        bridgeError,
        silenceNotifications,
        bridge,
      } = response;

      if (status === STARTED) {
        this.onAudioJoin();
        resolve(STARTED);
      } else if (status === ENDED) {
        logger.info({ logCode: 'audio_ended' }, 'Audio ended without issue');
        this.onAudioExit();
      } else if (status === FAILED) {
        const errorKey = this.messages.error[error] || this.messages.error.GENERIC_ERROR;
        const errorMsg = this.intl.formatMessage(errorKey, { 0: bridgeError });
        this.error = !!error;
        logger.error({
          logCode: 'audio_failure',
          extraInfo: {
            errorCode: error,
            cause: bridgeError,
            bridge,
          },
        }, `Audio error - errorCode=${error}, cause=${bridgeError}`);
        if (silenceNotifications !== true) {
          this.notify(errorMsg, true);
          this.exitAudio();
          this.onAudioExit();
        }
      } else if (status === RECONNECTING) {
        logger.info({ logCode: 'audio_reconnecting' }, 'Attempting to reconnect audio');
        this.notify(this.intl.formatMessage(this.messages.info.RECONNECTING_AUDIO), true);
        this.playHangUpSound();
      } else if (status === AUTOPLAY_BLOCKED) {
        this.autoplayBlocked = true;
        this.onAudioJoin();
        resolve(AUTOPLAY_BLOCKED);
      }
    });
  }

  createListenOnlyStream() {
    const audio = document.querySelector(MEDIA_TAG);

    // Play bogus silent audio to try to circumvent autoplay policy on Safari
    if (!audio.src) {
      audio.src = 'resources/sounds/silence.mp3';
    }

    audio.play().catch((e) => {
      if (e.name === 'AbortError') {
        return;
      }

      logger.warn({
        logCode: 'audiomanager_error_test_audio',
        extraInfo: { error: e },
      }, 'Error on playing test audio');
    });

    return {};
  }

  isUsingAudio() {
    return this.isConnected || this.isConnecting
      || this.isHangingUp || this.isEchoTest;
  }

  setDefaultInputDevice() {
    return this.changeInputDevice();
  }

  setDefaultOutputDevice() {
    return this.changeOutputDevice('default');
  }

  changeInputDevice(deviceId) {
    if (!deviceId) {
      return Promise.resolve();
    }

    const handleChangeInputDeviceSuccess = (inputDeviceId) => {
      this.inputDevice.id = inputDeviceId;
      return Promise.resolve(inputDeviceId);
    };

    const handleChangeInputDeviceError = (error) => {
      logger.error({
        logCode: 'audiomanager_error_getting_device',
        extraInfo: {
          errorName: error.name,
          errorMessage: error.message,
        },
      }, `Error getting microphone - {${error.name}: ${error.message}}`);

      const { MIC_ERROR } = AudioErrors;
      const disabledSysSetting = error.message.includes('Permission denied by system');
      const isMac = navigator.platform.indexOf('Mac') !== -1;

      let code = MIC_ERROR.NO_PERMISSION;
      if (isMac && disabledSysSetting) code = MIC_ERROR.MAC_OS_BLOCK;

      return Promise.reject({
        type: 'MEDIA_ERROR',
        message: this.messages.error.MEDIA_ERROR,
        code,
      });
    };

    return this.bridge.changeInputDeviceId(deviceId)
      .then(handleChangeInputDeviceSuccess)
      .catch(handleChangeInputDeviceError);
  }

  async changeOutputDevice(deviceId) {
    this.outputDeviceId = await this
      .bridge
      .changeOutputDevice(deviceId || DEFAULT_OUTPUT_DEVICE_ID);
  }

  set inputDevice(value) {
    this._inputDevice.value = value;
    this._inputDevice.tracker.changed();
  }

  get inputStream() {
    this._inputDevice.tracker.depend();
    return this._inputDevice.value.stream;
  }

  get inputDevice() {
    return this._inputDevice;
  }

  get inputDeviceId() {
    return (this.bridge && this.bridge.inputDeviceId)
      ? this.bridge.inputDeviceId : DEFAULT_INPUT_DEVICE_ID;
  }

  set userData(value) {
    this._userData = value;
  }

  get userData() {
    return this._userData;
  }

  playHangUpSound() {
    this.playAlertSound(`${Meteor.settings.public.app.cdn
      + Meteor.settings.public.app.basename}`
      + '/resources/sounds/LeftCall.mp3');
  }

  notify(message, error = false, icon = 'unmute') {
    const audioIcon = this.isListenOnly ? 'listen' : icon;

    notify(
      message,
      error ? 'error' : 'info',
      audioIcon,
    );
  }

  monitor() {
    const bridge = (this.useKurento && this.isListenOnly) ? this.listenOnlyBridge : this.bridge;
    const peer = bridge.getPeerConnection();
    monitorAudioConnection(peer);
  }

  handleAllowAutoplay() {
    window.removeEventListener('audioPlayFailed', this.handlePlayElementFailed);

    logger.info({
      logCode: 'audiomanager_autoplay_allowed',
    }, 'Listen only autoplay allowed by the user');

    while (this.failedMediaElements.length) {
      const mediaElement = this.failedMediaElements.shift();
      if (mediaElement) {
        playAndRetry(mediaElement).then((played) => {
          if (!played) {
            logger.error({
              logCode: 'audiomanager_autoplay_handling_failed',
            }, 'Listen only autoplay handling failed to play media');
          } else {
            // logCode is listenonly_* to make it consistent with the other tag play log
            logger.info({
              logCode: 'listenonly_media_play_success',
            }, 'Listen only media played successfully');
          }
        });
      }
    }
    this.autoplayBlocked = false;
  }

  handlePlayElementFailed(e) {
    const { mediaElement } = e.detail;

    e.stopPropagation();
    this.failedMediaElements.push(mediaElement);
    if (!this.autoplayBlocked) {
      logger.info({
        logCode: 'audiomanager_autoplay_prompt',
      }, 'Prompting user for action to play listen only media');
      this.autoplayBlocked = true;
    }
  }

  setSenderTrackEnabled (shouldEnable) {
    // If the bridge is set to listen only mode, nothing to do here. This method
    // is solely for muting outbound tracks.
    if (this.isListenOnly) return;

    // Bridge -> SIP.js bridge, the only full audio capable one right now
    const peer = this.bridge.getPeerConnection();

    if (!peer) {
      return;
    }

    peer.getSenders().forEach(sender => {
      const { track } = sender;
      if (track && track.kind === 'audio') {
        track.enabled = shouldEnable;
      }
    });
  }

  mute () {
    this.setSenderTrackEnabled(false);
  }

  unmute () {
    this.setSenderTrackEnabled(true);
  }

  playAlertSound (url) {
    if (!url) {
      return Promise.resolve();
    }

    const audioAlert = new Audio(url);

    if (this.outputDeviceId && (typeof audioAlert.setSinkId === 'function')) {
      return audioAlert
        .setSinkId(this.outputDeviceId)
        .then(() => audioAlert.play());
    }

    return audioAlert.play();
  }
}

const audioManager = new AudioManager();
export default audioManager;
