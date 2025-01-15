import { Tracker } from 'meteor/tracker';

import Auth from '/imports/ui/services/auth';
import VoiceUsers from '/imports/api/voice-users';
import SIPBridge from '/imports/api/audio/client/bridge/sip';
import SFUAudioBridge from '/imports/api/audio/client/bridge/sfu-audio-bridge';
import logger from '/imports/startup/client/logger';
import { notify } from '/imports/ui/services/notification';
import playAndRetry from '/imports/utils/mediaElementPlayRetry';
import iosWebviewAudioPolyfills from '/imports/utils/ios-webview-audio-polyfills';
import {
  monitorAudioConnection,
  getRTCStatsLogMetadata,
} from '/imports/utils/stats';
import AudioErrors from './error-codes';
import { Meteor } from 'meteor/meteor';
import browserInfo from '/imports/utils/browserInfo';
import getFromMeetingSettings from '/imports/ui/services/meeting-settings';
import getFromUserSettings from '/imports/ui/services/users-settings';
import {
  DEFAULT_INPUT_DEVICE_ID,
  reloadAudioElement,
  getCurrentAudioSinkId,
  getStoredAudioInputDeviceId,
  storeAudioInputDeviceId,
  getStoredAudioOutputDeviceId,
  storeAudioOutputDeviceId,
} from '/imports/api/audio/client/bridge/service';
import MediaStreamUtils from '/imports/utils/media-stream-utils';

const STATS = Meteor.settings.public.stats;
const MEDIA = Meteor.settings.public.media;
const MEDIA_TAG = MEDIA.mediaTag;
const ECHO_TEST_NUMBER = MEDIA.echoTestNumber;
const EXPERIMENTAL_USE_KMS_TRICKLE_ICE_FOR_MICROPHONE =
  Meteor.settings.public.app.experimentalUseKmsTrickleIceForMicrophone;

const DEFAULT_AUDIO_BRIDGES_PATH = '/imports/api/audio/client/';
const CALL_STATES = {
  STARTED: 'started',
  ENDED: 'ended',
  FAILED: 'failed',
  RECONNECTING: 'reconnecting',
  AUTOPLAY_BLOCKED: 'autoplayBlocked',
};

const BREAKOUT_AUDIO_TRANSFER_STATES = {
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
  RETURNING: 'returning',
};

class AudioManager {
  constructor() {
    this._inputDevice = {
      value: DEFAULT_INPUT_DEVICE_ID,
      tracker: new Tracker.Dependency(),
    };

    this._breakoutAudioTransferStatus = {
      status: BREAKOUT_AUDIO_TRANSFER_STATES.DISCONNECTED,
      breakoutMeetingId: null,
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
      muteHandle: null,
      autoplayBlocked: false,
      isReconnecting: false,
    });

    this.failedMediaElements = [];
    this.handlePlayElementFailed = this.handlePlayElementFailed.bind(this);
    this.monitor = this.monitor.bind(this);

    this._inputStream = null;
    this._inputStreamTracker = new Tracker.Dependency();
    this._inputDeviceId = {
      value: getStoredAudioInputDeviceId() || DEFAULT_INPUT_DEVICE_ID,
      tracker: new Tracker.Dependency(),
    };
    this._outputDeviceId = {
      value: getCurrentAudioSinkId(),
      tracker: new Tracker.Dependency(),
    };

    this.BREAKOUT_AUDIO_TRANSFER_STATES = BREAKOUT_AUDIO_TRANSFER_STATES;
    this._applyCachedOutputDeviceId();
  }

  _applyCachedOutputDeviceId() {
    const cachedId = getStoredAudioOutputDeviceId();

    if (typeof cachedId === 'string') {
      this.changeOutputDevice(cachedId, false).then(() => {
        this.outputDeviceId = cachedId;
      }).catch((error) => {
        logger.warn({
          logCode: 'audiomanager_output_device_storage_failed',
          extraInfo: {
            deviceId: cachedId,
            errorMessage: error.message,
          },
        }, `Failed to apply output audio device from storage: ${error.message}`);
      });
    }
  }

  set inputDeviceId(value) {
    if (this._inputDeviceId.value !== value) {
      this._inputDeviceId.value = value;
      this._inputDeviceId.tracker.changed();
    }

    if (this.fullAudioBridge) {
      this.fullAudioBridge.inputDeviceId = this._inputDeviceId.value;
    }
  }

  get inputDeviceId() {
    this._inputDeviceId.tracker.depend();
    return this._inputDeviceId.value;
  }

  set outputDeviceId(value) {
    if (this._outputDeviceId.value !== value) {
      this._outputDeviceId.value = value;
      this._outputDeviceId.tracker.changed();
    }

    if (this.fullAudioBridge) {
      this.fullAudioBridge.outputDeviceId = this._outputDeviceId.value;
    }

    if (this.listenOnlyBridge) {
      this.listenOnlyBridge.outputDeviceId = this._outputDeviceId.value;
    }
  }

  get outputDeviceId() {
    this._outputDeviceId.tracker.depend();
    return this._outputDeviceId.value;
  }

  async init(userData, audioEventHandler) {
    this.loadBridges(userData);
    this.userData = userData;
    this.initialized = true;
    this.audioEventHandler = audioEventHandler;
    await this.loadBridges(userData);
  }

  /**
   * Load audio bridges modules to be used the manager.
   *
   * Bridges can be configured in settings.yml file.
   * @param {Object} userData The Object representing user data to be passed to
   *                      the bridge.
   */
  async loadBridges(userData) {
    let FullAudioBridge = SIPBridge;
    let ListenOnlyBridge = SFUAudioBridge;

    if (MEDIA.audio) {
      const { bridges, defaultFullAudioBridge, defaultListenOnlyBridge } = MEDIA.audio;

      const _fullAudioBridge = getFromUserSettings(
        'bbb_fullaudio_bridge',
        getFromMeetingSettings('fullaudio-bridge', defaultFullAudioBridge),
      );

      this.bridges = {};

      await Promise.all(
        Object.values(bridges).map(async (bridge) => {
          // eslint-disable-next-line import/no-dynamic-require, global-require
          this.bridges[bridge.name] = (
            (await import(DEFAULT_AUDIO_BRIDGES_PATH + bridge.path)) || {}
          ).default;
        })
      );

      if (_fullAudioBridge && this.bridges[_fullAudioBridge]) {
        FullAudioBridge = this.bridges[_fullAudioBridge];
      }

      if (defaultListenOnlyBridge && this.bridges[defaultListenOnlyBridge]) {
        ListenOnlyBridge = this.bridges[defaultListenOnlyBridge];
      }
    }

    this.fullAudioBridge = new FullAudioBridge(userData);
    this.listenOnlyBridge = new ListenOnlyBridge(userData);
    // Initialize device IDs in configured bridges
    this.fullAudioBridge.inputDeviceId = this.inputDeviceId;
    this.fullAudioBridge.outputDeviceId = this.outputDeviceId;
    this.listenOnlyBridge.outputDeviceId = this.outputDeviceId;
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

  async trickleIce() {
    const { isFirefox, isIe, isSafari } = browserInfo;

    if (!this.listenOnlyBridge
      || typeof this.listenOnlyBridge.trickleIce !== 'function'
      || isFirefox
      || isIe
      || isSafari) {
      return [];
    }

    if (this.validIceCandidates && this.validIceCandidates.length) {
      logger.info(
        { logCode: 'audiomanager_trickle_ice_reuse_candidate' },
        'Reusing trickle ICE information before activating microphone',
      );
      return this.validIceCandidates;
    }

    logger.info(
      { logCode: 'audiomanager_trickle_ice_get_local_candidate' },
      'Performing trickle ICE before activating microphone',
    );

    try {
      this.validIceCandidates = await this.listenOnlyBridge.trickleIce();
      return this.validIceCandidates;
    } catch (error) {
      logger.error({
        logCode: 'audiomanager_trickle_ice_failed',
        extraInfo: {
          errorName: error.name,
          errorMessage: error.message,
        },
      }, `Trickle ICE before activating microphone failed: ${error.message}`);
      return [];
    }
  }

  joinMicrophone() {
    this.audioJoinStartTime = new Date();
    this.logAudioJoinTime = false;
    this.isListenOnly = false;
    this.isEchoTest = false;

    return this.onAudioJoining
      .bind(this)()
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
    this.audioJoinStartTime = new Date();
    this.logAudioJoinTime = false;
    this.isListenOnly = false;
    this.isEchoTest = true;

    return this.onAudioJoining
      .bind(this)()
      .then(async () => {
        let validIceCandidates = [];
        if (EXPERIMENTAL_USE_KMS_TRICKLE_ICE_FOR_MICROPHONE) {
          validIceCandidates = await this.trickleIce();
        }

        const callOptions = {
          isListenOnly: false,
          extension: ECHO_TEST_NUMBER,
          inputStream: this.inputStream,
          validIceCandidates,
        };
        logger.info(
          {
            logCode: 'audiomanager_join_echotest',
            extraInfo: { logType: 'user_action' },
          },
          'User requested to join audio conference with mic'
        );
        return this.joinAudio(callOptions, this.callStateCallback.bind(this));
      });
  }

  joinAudio(callOptions, callStateCallback) {
    return this.bridge
      .joinAudio(callOptions, callStateCallback.bind(this))
      .catch((error) => {
        const { name, message } = error;
        const errorPayload = {
          type: 'MEDIA_ERROR',
          errMessage: message || 'MEDIA_ERROR',
          errCode: AudioErrors.MIC_ERROR.UNKNOWN,
        };

        switch (name) {
          case 'NotAllowedError':
            errorPayload.errCode = AudioErrors.MIC_ERROR.NO_PERMISSION;
            logger.error(
              {
                logCode: 'audiomanager_error_getting_device',
                extraInfo: {
                  errorName: error.name,
                  errorMessage: error.message,
                },
              },
              `Error getting microphone - {${error.name}: ${error.message}}`
            );
            break;
          case 'NotFoundError':
            errorPayload.errCode = AudioErrors.MIC_ERROR.DEVICE_NOT_FOUND;
            logger.error(
              {
                logCode: 'audiomanager_error_device_not_found',
                extraInfo: {
                  errorName: error.name,
                  errorMessage: error.message,
                },
              },
              `Error getting microphone - {${error.name}: ${error.message}}`
            );
            break;
          default:
            logger.error({
              logCode: 'audiomanager_error_unknown',
              extraInfo: {
                errorName: error.name,
                errorMessage: error.message,
              },
            }, `Error enabling audio - {${name}: ${message}}`);
            break;
        }

        this.isConnecting = false;
        this.isWaitingPermissions = false;

        throw errorPayload;
      });
  }

  async joinListenOnly() {
    this.audioJoinStartTime = new Date();
    this.logAudioJoinTime = false;
    this.isListenOnly = true;
    this.isEchoTest = false;

    // Call polyfills for webrtc client if navigator is "iOS Webview"
    const userAgent = window.navigator.userAgent.toLocaleLowerCase();
    if (
      (userAgent.indexOf('iphone') > -1 || userAgent.indexOf('ipad') > -1) &&
      userAgent.indexOf('safari') === -1
    ) {
      iosWebviewAudioPolyfills();
    }

    logger.info({
      logCode: 'audiomanager_join_listenonly',
      extraInfo: { logType: 'user_action' },
    }, 'user requested to connect to audio conference as listen only');

    window.addEventListener('audioPlayFailed', this.handlePlayElementFailed);

    return this.onAudioJoining.bind(this)()
      .then(() => {
        const callOptions = {
          isListenOnly: true,
          extension: null,
        };
        return this.joinAudio(callOptions, this.callStateCallback.bind(this));
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

    this.isHangingUp = true;

    return this.bridge.exitAudio();
  }

  forceExitAudio() {
    this.notifyAudioExit();
    this.isConnected = false;
    this.isConnecting = false;
    this.isHangingUp = false;

    if (this.inputStream) {
      this.inputStream.getTracks().forEach((track) => track.stop());
      this.inputStream = null;
    }

    window.removeEventListener('audioPlayFailed', this.handlePlayElementFailed);

    return this.bridge.exitAudio();
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
      const query = VoiceUsers.find(
        { intId: Auth.userID },
        { fields: { muted: 1, talking: 1 } }
      );
      this.muteHandle = query.observeChanges({
        added: (id, fields) => this.onVoiceUserChanges(fields),
        changed: (id, fields) => this.onVoiceUserChanges(fields),
      });
    }
    const secondsToActivateAudio =
      (new Date() - this.audioJoinStartTime) / 1000;

    if (!this.logAudioJoinTime) {
      this.logAudioJoinTime = true;
      logger.info(
        {
          logCode: 'audio_mic_join_time',
          extraInfo: {
            secondsToActivateAudio,
          },
        },
        `Time needed to connect audio (seconds): ${secondsToActivateAudio}`
      );
    }

    try {
      this.inputStream = this.bridge ? this.bridge.inputStream : null;
      // Enforce correct output device on audio join
      this.changeOutputDevice(this.outputDeviceId, true);
      storeAudioOutputDeviceId(this.outputDeviceId);
      // Extract the deviceId again from the stream to guarantee consistency
      // between stream DID vs chosen DID. That's necessary in scenarios where,
      // eg, there's no default/pre-set deviceId ('') and the browser's
      // default device has been altered by the user (browser default != system's
      // default).
      if (this.inputStream) {
        const extractedDeviceId = MediaStreamUtils.extractDeviceIdFromStream(this.inputStream, 'audio');
        if (extractedDeviceId && extractedDeviceId !== this.inputDeviceId) {
          this.changeInputDevice(extractedDeviceId);
        }
      }
      // Audio joined successfully - add device IDs to session storage so they
      // can be re-used on refreshes/other sessions
      storeAudioInputDeviceId(this.inputDeviceId);
    } catch (error) {
      logger.warn({
        logCode: 'audiomanager_device_enforce_failed',
        extraInfo: {
          errorName: error.name,
          errorMessage: error.message,
          inputDeviceId: this.inputDeviceId,
          outputDeviceId: this.outputDeviceId,
        },
      }, `Failed to enforce input/output devices: ${error.message}`);
    }

    if (!this.isEchoTest) {
      this.notify(this.intl.formatMessage(this.messages.info.JOINED_AUDIO));
      this.getStats().then((stats) => {
        logger.info({
          logCode: 'audio_joined',
          extraInfo: {
            secondsToActivateAudio,
            inputDeviceId: this.inputDeviceId,
            outputDeviceId: this.outputDeviceId,
            isListenOnly: this.isListenOnly,
            stats: getRTCStatsLogMetadata(stats),
            clientSessionNumber: this.bridge.clientSessionNumber,
          },
        }, 'Audio Joined');
      });
      if (STATS.enabled) this.monitor();
      this.audioEventHandler({
        name: 'started',
        isListenOnly: this.isListenOnly,
      });
    }
    Session.set('audioModalIsOpen', false);
  }

  onTransferStart() {
    this.isEchoTest = false;
    this.isConnecting = true;
  }

  // Must be called before the call is actually torn down (this.isConnected = true)
  notifyAudioExit() {
    try {
      if (!this.error && (this.isConnected && !this.isEchoTest)) {
        this.notify(
          this.intl.formatMessage(this.messages.info.LEFT_AUDIO),
          false,
          'no_audio',
        );
      }
    } catch {}
  }

  onAudioExit() {
    this.notifyAudioExit();
    this.isConnected = false;
    this.isConnecting = false;
    this.isHangingUp = false;
    this.autoplayBlocked = false;
    this.failedMediaElements = [];

    if (this.inputStream) {
      this.inputStream.getTracks().forEach((track) => track.stop());
      this.inputStream = null;
    }

    if (!this.isEchoTest) {
      this.playHangUpSound();
    }

    window.removeEventListener('audioPlayFailed', this.handlePlayElementFailed);
  }

  callStateCallback(response) {
    return new Promise((resolve) => {
      const { STARTED, ENDED, FAILED, RECONNECTING, AUTOPLAY_BLOCKED } = CALL_STATES;
      const {
        status,
        error,
        bridgeError,
        silenceNotifications,
        bridge,
        stats = {},
      } = response;

      if (status === STARTED) {
        this.isReconnecting = false;
        this.onAudioJoin();
        resolve(STARTED);
      } else if (status === ENDED) {
        this.isReconnecting = false;
        this.setBreakoutAudioTransferStatus({
          breakoutMeetingId: '',
          status: BREAKOUT_AUDIO_TRANSFER_STATES.DISCONNECTED,
        });
        this.onAudioExit();
        logger.info({
          logCode: 'audio_ended',
          extraInfo: {
            inputDeviceId: this.inputDeviceId,
            outputDeviceId: this.outputDeviceId,
            isListenOnly: this.isListenOnly,
          },
        }, 'Audio ended without issue');
      } else if (status === FAILED) {
        this.isReconnecting = false;
        this.setBreakoutAudioTransferStatus({
          breakoutMeetingId: '',
          status: BREAKOUT_AUDIO_TRANSFER_STATES.DISCONNECTED,
        });
        const errorKey =
          this.messages.error[error] || this.messages.error.GENERIC_ERROR;
        const errorMsg = this.intl.formatMessage(errorKey, { 0: bridgeError });
        this.error = !!error;
        logger.error(
          {
            logCode: 'audio_failure',
            extraInfo: {
              errorCode: error,
              cause: bridgeError,
              bridge,
              inputDeviceId: this.inputDeviceId,
              outputDeviceId: this.outputDeviceId,
              isListenOnly: this.isListenOnly,
              stats,
            },
          },
          `Audio error - errorCode=${error}, cause=${bridgeError}`
        );
        if (silenceNotifications !== true) {
          this.notify(errorMsg, true);
          this.exitAudio();
          this.onAudioExit();
        }
      } else if (status === RECONNECTING) {
        this.isReconnecting = true;
        this.setBreakoutAudioTransferStatus({
          breakoutMeetingId: '',
          status: BREAKOUT_AUDIO_TRANSFER_STATES.DISCONNECTED,
        });
        logger.info({
          logCode: 'audio_reconnecting',
          extraInfo: {
            bridge,
            inputDeviceId: this.inputDeviceId,
            outputDeviceId: this.outputDeviceId,
            isListenOnly: this.isListenOnly,
            stats,
          },
        }, 'Attempting to reconnect audio');
        this.notify(
          this.intl.formatMessage(this.messages.info.RECONNECTING_AUDIO),
          true
        );
        this.playHangUpSound();
      } else if (status === AUTOPLAY_BLOCKED) {
        this.setBreakoutAudioTransferStatus({
          breakoutMeetingId: '',
          status: BREAKOUT_AUDIO_TRANSFER_STATES.DISCONNECTED,
        });
        this.isReconnecting = false;
        this.autoplayBlocked = true;
        this.onAudioJoin();
        resolve(AUTOPLAY_BLOCKED);
      }
    });
  }

  isUsingAudio() {
    return (
      this.isConnected ||
      this.isConnecting ||
      this.isHangingUp ||
      this.isEchoTest
    );
  }

  changeInputDevice(deviceId) {
    if (typeof deviceId !== 'string') throw new TypeError('Invalid inputDeviceId');

    if (deviceId === this.inputDeviceId) return this.inputDeviceId;

    const currentDeviceId = this.inputDeviceId ?? 'none';
    this.inputDeviceId = deviceId;
    logger.debug({
      logCode: 'audiomanager_input_device_change',
      extraInfo: {
        deviceId: currentDeviceId,
        newDeviceId: deviceId,
      },
    }, `Microphone input device changed: from ${currentDeviceId} to ${deviceId}`);

    return this.inputDeviceId;
  }

  liveChangeInputDevice(deviceId) {
    const currentDeviceId = this.inputDeviceId ?? 'none';
    // we force stream to be null, so MutedAlert will deallocate it and
    // a new one will be created for the new stream
    this.inputStream = null;
    return this.bridge.liveChangeInputDevice(deviceId).then((stream) => {
      this.inputStream = stream;
      const extractedDeviceId = MediaStreamUtils.extractDeviceIdFromStream(this.inputStream, 'audio');
      if (extractedDeviceId && extractedDeviceId !== this.inputDeviceId) {
        this.changeInputDevice(extractedDeviceId);
      }
      // Live input device change - add device ID to session storage so it
      // can be re-used on refreshes/other sessions
      storeAudioInputDeviceId(extractedDeviceId);
      this.setSenderTrackEnabled(!this.isMuted);
    }).catch((error) => {
      logger.error({
        logCode: 'audiomanager_input_live_device_change_failure',
        extraInfo: {
          errorName: error.name,
          errorMessage: error.message,
          deviceId: currentDeviceId,
          newDeviceId: deviceId,
        },
      }, `Input device live change failed - {${error.name}: ${error.message}}`);

      throw error;
    });
  }

  async changeOutputDevice(deviceId, isLive) {
    const targetDeviceId = deviceId;
    const currentDeviceId = this.outputDeviceId ?? getCurrentAudioSinkId();
    const audioElement = document.querySelector(MEDIA_TAG);
    const sinkIdSupported = audioElement && typeof audioElement.setSinkId === 'function';

    if (typeof deviceId === 'string' && sinkIdSupported && currentDeviceId !== targetDeviceId) {
      try {
        if (!isLive) audioElement.srcObject = null;

        await audioElement.setSinkId(deviceId);
        reloadAudioElement(audioElement);
        logger.debug({
          logCode: 'audiomanager_output_device_change',
          extraInfo: {
            deviceId: currentDeviceId,
            newDeviceId: deviceId,
          },
        }, `Audio output device changed: from ${currentDeviceId || 'default'} to ${deviceId || 'default'}`);
        this.outputDeviceId = deviceId;

        // Live output device change - add device ID to session storage so it
        // can be re-used on refreshes/other sessions
        if (isLive) storeAudioOutputDeviceId(deviceId);

        return this.outputDeviceId;
      } catch (error) {
        logger.error({
          logCode: 'audiomanager_output_device_change_failure',
          extraInfo: {
            errorName: error.name,
            errorMessage: error.message,
            deviceId: currentDeviceId,
            newDeviceId: targetDeviceId,
          },
        }, `Error changing output device - {${error.name}: ${error.message}}`);

        // Rollback/enforce current sinkId (if possible)
        if (sinkIdSupported) {
          this.outputDeviceId = getCurrentAudioSinkId();
        } else {
          this.outputDeviceId = currentDeviceId;
        }

        throw error;
      }
    }

    return this.outputDeviceId;
  }

  get inputStream() {
    this._inputStreamTracker.depend();
    return this._inputStream;
  }

  get bridge() {
    return this.isListenOnly ? this.listenOnlyBridge : this.fullAudioBridge;
  }

  set inputStream(stream) {
    // We store reactive information about input stream
    // because mutedalert component needs to track when it changes
    // and then update hark with the new value for inputStream
    if (this._inputStream !== stream) {
      this._inputStreamTracker.changed();
    }

    this._inputStream = stream;
  }

  /**
   * Sets the current status for breakout audio transfer
   * @param {Object} newStatus                  The status Object to be set for
   *                                            audio transfer.
   * @param {string} newStatus.breakoutMeetingId The meeting id of the current
   *                                            breakout audio transfer.
   * @param {string} newStatus.status           The status of the current audio
   *                                            transfer. Valid values are
   *                                            'connected', 'disconnected' and
   *                                            'returning'.
   */
  setBreakoutAudioTransferStatus(newStatus) {
    const currentStatus = this._breakoutAudioTransferStatus;
    const { breakoutMeetingId, status } = newStatus;

    if (typeof breakoutMeetingId === 'string') {
      currentStatus.breakoutMeetingId = breakoutMeetingId;
    } else {
      currentStatus.breakoutMeetingId = null;
    }

    if (typeof status === 'string') {
      currentStatus.status = status;

      if (this.bridge && !this.isListenOnly) {
        if (status !== BREAKOUT_AUDIO_TRANSFER_STATES.CONNECTED) {
          this.bridge.ignoreCallState = false;
        } else {
          this.bridge.ignoreCallState = true;
        }
      }
    }
  }

  getBreakoutAudioTransferStatus() {
    return this._breakoutAudioTransferStatus;
  }

  set userData(value) {
    this._userData = value;
  }

  get userData() {
    return this._userData;
  }

  playHangUpSound() {
    this.playAlertSound(
      `${
        Meteor.settings.public.app.cdn +
        Meteor.settings.public.app.basename +
        Meteor.settings.public.app.instanceId
      }` + '/resources/sounds/LeftCall.mp3'
    );
  }

  notify(message, error = false, icon = 'unmute') {
    const audioIcon = this.isListenOnly ? 'listen' : icon;

    notify(message, error ? 'error' : 'info', audioIcon);
  }

  monitor() {
    const peer = this.bridge.getPeerConnection();
    monitorAudioConnection(peer);
  }

  handleAllowAutoplay() {
    window.removeEventListener('audioPlayFailed', this.handlePlayElementFailed);

    logger.info(
      {
        logCode: 'audiomanager_autoplay_allowed',
      },
      'Listen only autoplay allowed by the user'
    );

    while (this.failedMediaElements.length) {
      const mediaElement = this.failedMediaElements.shift();
      if (mediaElement) {
        playAndRetry(mediaElement).then((played) => {
          if (!played) {
            logger.error(
              {
                logCode: 'audiomanager_autoplay_handling_failed',
              },
              'Listen only autoplay handling failed to play media'
            );
          } else {
            // logCode is listenonly_* to make it consistent with the other tag play log
            logger.info(
              {
                logCode: 'listenonly_media_play_success',
              },
              'Listen only media played successfully'
            );
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
      logger.info(
        {
          logCode: 'audiomanager_autoplay_prompt',
        },
        'Prompting user for action to play listen only media'
      );
      this.autoplayBlocked = true;
    }
  }

  setSenderTrackEnabled(shouldEnable) {
    // If the bridge is set to listen only mode, nothing to do here. This method
    // is solely for muting outbound tracks.
    if (this.isListenOnly) return;

    // Bridge -> SIP.js bridge, the only full audio capable one right now
    const peer = this.bridge.getPeerConnection();

    if (!peer) {
      return;
    }

    peer.getSenders().forEach((sender) => {
      const { track } = sender;
      if (track && track.kind === 'audio') {
        track.enabled = shouldEnable;
      }
    });
  }

  mute() {
    this.setSenderTrackEnabled(false);
  }

  unmute() {
    this.setSenderTrackEnabled(true);
  }

  playAlertSound(url) {
    if (!url || !this.bridge) {
      return Promise.resolve();
    }

    const audioAlert = new Audio(url);

    audioAlert.addEventListener('ended', () => {
      audioAlert.src = null;
    });

    const { outputDeviceId } = this.bridge;

    if (outputDeviceId && typeof audioAlert.setSinkId === 'function') {
      return audioAlert.setSinkId(outputDeviceId).then(() => audioAlert.play());
    }

    return audioAlert.play();
  }

  async updateAudioConstraints(constraints) {
    await this.bridge.updateAudioConstraints(constraints);
  }

  /**
   * Get stats about active audio peer.
   * We filter the status based on FILTER_AUDIO_STATS constant.
   * We also append to the returned object the information about peer's
   * transport. This transport information is retrieved by
   * getTransportStatsFromPeer().
   *
   * @returns An Object containing the status about the active audio peer.
   *
   * For more information see:
   * https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/getStats
   * and
   * https://developer.mozilla.org/en-US/docs/Web/API/RTCStatsReport
   */
  async getStats(stats) {
    if (!this.bridge) return null;

    try {
      const processedStats = await this.bridge.getStats(stats);

      return processedStats;
    } catch (error) {
      logger.debug({
        logCode: 'audiomanager_get_stats_failed',
        extraInfo: {
          errorName: error.name,
          errorMessage: error.message,
        },
      }, `Failed to get audio stats: ${error.message}`);
      return null;
    }
  }
}

const audioManager = new AudioManager();
export default audioManager;
