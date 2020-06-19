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
import { makeCall } from '/imports/ui/services/api';
import AudioErrors from './error-codes';

const MEDIA = Meteor.settings.public.media;
const MEDIA_TAG = MEDIA.mediaTag;
const ECHO_TEST_NUMBER = MEDIA.echoTestNumber;
const MAX_LISTEN_ONLY_RETRIES = 1;
const LISTEN_ONLY_CALL_TIMEOUT_MS = 15000;

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
      value: 'default',
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
      wasMuted: false,
    });

    this.useKurento = Meteor.settings.public.kurento.enableListenOnly;
    this.failedMediaElements = [];
    this.handlePlayElementFailed = this.handlePlayElementFailed.bind(this);
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

  askDevicesPermissions() {
    // Check to see if the stream has already been retrieved becasue then we don't need to
    // request. This is a fix for an issue with the input device selector.
    if (this.inputStream) {
      return Promise.resolve();
    }

    // Only change the isWaitingPermissions for the case where the user didnt allowed it yet
    const permTimeout = setTimeout(() => {
      if (!this.devicesInitialized) { this.isWaitingPermissions = true; }
    }, 100);

    this.isWaitingPermissions = false;
    this.devicesInitialized = false;

    return Promise.all([
      this.setDefaultInputDevice(),
      this.setDefaultOutputDevice(),
    ]).then(() => {
      this.devicesInitialized = true;
      this.isWaitingPermissions = false;
    }).catch((err) => {
      clearTimeout(permTimeout);
      this.isConnecting = false;
      this.isWaitingPermissions = false;
      throw err;
    });
  }

  joinMicrophone() {
    this.isListenOnly = false;
    this.isEchoTest = false;

    return this.askDevicesPermissions()
      .then(this.onAudioJoining.bind(this))
      .then(() => {
        const callOptions = {
          isListenOnly: false,
          extension: null,
          inputStream: this.inputStream,
        };
        return this.bridge.joinAudio(callOptions, this.callStateCallback.bind(this));
      });
  }

  joinEchoTest() {
    this.isListenOnly = false;
    this.isEchoTest = true;

    return this.askDevicesPermissions()
      .then(this.onAudioJoining.bind(this))
      .then(() => {
        const callOptions = {
          isListenOnly: false,
          extension: ECHO_TEST_NUMBER,
          inputStream: this.inputStream,
        };
        logger.info({ logCode: 'audiomanager_join_echotest', extraInfo: { logType: 'user_action' } }, 'User requested to join audio conference with mic');
        return this.bridge.joinAudio(callOptions, this.callStateCallback.bind(this));
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
        window.kurentoExitAudio();
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
      }, `Listen only error - ${err} - bridge: ${bridgeInUse}`);
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

  onAudioJoin() {
    this.isConnecting = false;
    this.isConnected = true;

    if (this.wasMuted) {
      makeCall('toggleVoice', true);
      this.wasMuted = false;
    }
    // listen to the VoiceUsers changes and update the flag
    if (!this.muteHandle) {
      const query = VoiceUsers.find({ intId: Auth.userID }, { fields: { muted: 1, talking: 1 } });
      this.muteHandle = query.observeChanges({
        changed: (id, fields) => {
          if (fields.muted !== undefined && fields.muted !== this.isMuted) {
            this.isMuted = true;
            const muteState = this.isMuted ? 'selfMuted' : 'selfUnmuted';
            window.parent.postMessage({ response: muteState }, '*');
          }

          if (fields.talking !== undefined && fields.talking !== this.isTalking) {
            this.isTalking = fields.talking;
          }

          if (this.isMuted) {
            this.isTalking = false;
          }
        },
      });
    }

    if (!this.isEchoTest) {
      window.parent.postMessage({ response: 'joinedAudio' }, '*');
      this.notify(this.intl.formatMessage(this.messages.info.JOINED_AUDIO));
      logger.info({ logCode: 'audio_joined' }, 'Audio Joined');
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
          },
        }, `Audio error - errorCode=${error}, cause=${bridgeError}`);
        if (silenceNotifications !== true) {
          this.notify(errorMsg, true);
          this.exitAudio();
          this.onAudioExit();
        }
      } else if (status === RECONNECTING) {
        //  I catch it here, because any place after reconnecting will clear this state
        if (this.isMuted) this.wasMuted = true;
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
    if (this.listenOnlyAudioContext) {
      this.listenOnlyAudioContext.close();
    }

    const { AudioContext, webkitAudioContext } = window;

    this.listenOnlyAudioContext = AudioContext
      ? new AudioContext()
      : new webkitAudioContext();

    const dest = this.listenOnlyAudioContext.createMediaStreamDestination();

    const audio = document.querySelector(MEDIA_TAG);

    // Play bogus silent audio to try to circumvent autoplay policy on Safari
    audio.src = 'resources/sounds/silence.mp3';

    audio.play().catch((e) => {
      logger.warn({
        logCode: 'audiomanager_error_test_audio',
        extraInfo: { error: e },
      }, 'Error on playing test audio');
    });

    return dest.stream;
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
    const handleChangeInputDeviceSuccess = (inputDevice) => {
      this.inputDevice = inputDevice;
      return Promise.resolve(inputDevice);
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

    if (!deviceId) {
      return this.bridge.setDefaultInputDevice()
        .then(handleChangeInputDeviceSuccess)
        .catch(handleChangeInputDeviceError);
    }

    return this.bridge.changeInputDevice(deviceId)
      .then(handleChangeInputDeviceSuccess)
      .catch(handleChangeInputDeviceError);
  }

  async changeOutputDevice(deviceId) {
    this.outputDeviceId = await this.bridge.changeOutputDevice(deviceId);
  }

  set inputDevice(value) {
    this._inputDevice.value = value;
    this._inputDevice.tracker.changed();
  }

  get inputStream() {
    this._inputDevice.tracker.depend();
    return this._inputDevice.value.stream;
  }

  get inputDeviceId() {
    this._inputDevice.tracker.depend();
    return this._inputDevice.value.id;
  }

  set userData(value) {
    this._userData = value;
  }

  get userData() {
    return this._userData;
  }

  playHangUpSound() {
    this.alert = new Audio(`${Meteor.settings.public.app.cdn + Meteor.settings.public.app.basename}/resources/sounds/LeftCall.mp3`);
    this.alert.play();
  }

  notify(message, error = false, icon = 'unmute') {
    const audioIcon = this.isListenOnly ? 'listen' : icon;

    notify(
      message,
      error ? 'error' : 'info',
      audioIcon,
    );
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
}

const audioManager = new AudioManager();
export default audioManager;
