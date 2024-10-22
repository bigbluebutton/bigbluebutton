import Auth from '/imports/ui/services/auth';
import SIPBridge from '/imports/api/audio/client/bridge/sip';
import SFUAudioBridge from '/imports/api/audio/client/bridge/sfu-audio-bridge';
import logger from '/imports/startup/client/logger';
import { notify } from '/imports/ui/services/notification';
import playAndRetry from '/imports/utils/mediaElementPlayRetry';
import { monitorAudioConnection } from '/imports/utils/stats';
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
  getAudioConstraints,
  doGUM,
} from '/imports/api/audio/client/bridge/service';
import MediaStreamUtils from '/imports/utils/media-stream-utils';
import { makeVar } from '@apollo/client';
import AudioErrors from '/imports/ui/services/audio-manager/error-codes';
import Session from '/imports/ui/services/storage/in-memory';
import GrahqlSubscriptionStore, { stringToHash } from '/imports/ui/core/singletons/subscriptionStore';
import VOICE_ACTIVITY from '../../core/graphql/queries/whoIsTalking';

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

/**
 * Audio status to be filtered in getStats()
 */
const FILTER_AUDIO_STATS = [
  'outbound-rtp',
  'inbound-rtp',
  'candidate-pair',
  'local-candidate',
  'transport',
];

class AudioManager {
  constructor() {
    this._breakoutAudioTransferStatus = {
      status: BREAKOUT_AUDIO_TRANSFER_STATES.DISCONNECTED,
      breakoutMeetingId: null,
    };

    this.defineProperties({
      isMuted: makeVar(true),
      isConnected: makeVar(false),
      isConnecting: makeVar(false),
      isHangingUp: makeVar(false),
      isListenOnly: makeVar(false),
      isEchoTest: makeVar(false),
      isTalking: makeVar(false),
      isWaitingPermissions: makeVar(false),
      error: makeVar(null),
      autoplayBlocked: makeVar(false),
      isReconnecting: makeVar(false),
      bypassGUM: makeVar(false),
      permissionStatus: makeVar(null),
      transparentListenOnlySupported: makeVar(false),
    });

    this.failedMediaElements = [];
    this.handlePlayElementFailed = this.handlePlayElementFailed.bind(this);
    this.monitor = this.monitor.bind(this);
    this.isUsingAudio = this.isUsingAudio.bind(this);

    this._inputStream = makeVar(null);
    this._inputDeviceId = {
      value: makeVar(null),
    };
    this._outputDeviceId = {
      value: makeVar(null),
    };

    this.BREAKOUT_AUDIO_TRANSFER_STATES = BREAKOUT_AUDIO_TRANSFER_STATES;
    this._voiceActivityObserver = null;

    window.addEventListener('StopAudioTracks', () => this.forceExitAudio());
  }

  _trackPermissionStatus() {
    const handleTrackingError = (error) => {
      logger.warn({
        logCode: 'audiomanager_permission_tracking_failed',
        extraInfo: {
          errorName: error.name,
          errorMessage: error.message,
        },
      }, `Failed to track microphone permission status: ${error.message}`);
    };

    if (navigator?.permissions?.query) {
      navigator.permissions.query({ name: 'microphone' })
        .then((status) => {
          // eslint-disable-next-line no-param-reassign
          status.onchange = () => {
            logger.debug({
              logCode: 'audiomanager_permission_status_changed',
              extraInfo: {
                newStatus: status.state,
              },
            }, `Microphone permission status changed: ${status.state}`);
            this.permissionStatus = status.state;
          };
          this.permissionStatus = status.state;
        }).catch(handleTrackingError);
    } else {
      handleTrackingError(new Error('navigator.permissions.query is not available'));
    }
  }

  _applyCachedOutputDeviceId() {
    const cachedId = getStoredAudioOutputDeviceId();

    if (typeof cachedId === 'string') {
      this.changeOutputDevice(cachedId, false)
        .then(() => {
          this.outputDeviceId = cachedId;
        })
        .catch((error) => {
          logger.warn(
            {
              logCode: 'audiomanager_output_device_storage_failed',
              extraInfo: {
                deviceId: cachedId,
                errorMessage: error.message,
              },
            },
            `Failed to apply output audio device from storage: ${error.message}`
          );
        });
    }
  }

  set inputDeviceId(value) {
    if (this._inputDeviceId.value() !== value) {
      this._inputDeviceId.value(value);
    }

    if (this.fullAudioBridge) {
      this.fullAudioBridge.inputDeviceId = this._inputDeviceId.value();
    }
  }

  // inputDeviceId is a string that represents a MediaDeviceInfo.deviceId OR a static
  // 'listen-only' string that represents our "virtual" listen-only device.
  // i.e.: the user has a bidirectional audio channel, but did not specify any
  // input device to it.
  get inputDeviceId() {
    return this._inputDeviceId.value();
  }

  set outputDeviceId(value) {
    if (this._outputDeviceId.value() !== value) {
      this._outputDeviceId.value(value);
    }

    if (this.fullAudioBridge) {
      this.fullAudioBridge.outputDeviceId = this._outputDeviceId.value();
    }

    if (this.listenOnlyBridge) {
      this.listenOnlyBridge.outputDeviceId = this._outputDeviceId.value();
    }
  }

  get outputDeviceId() {
    return this._outputDeviceId.value();
  }

  shouldBypassGUM() {
    return this.supportsTransparentListenOnly() && this.inputDeviceId === 'listen-only';
  }

  supportsTransparentListenOnly() {
    return this.listenOnlyBridge?.supportsTransparentListenOnly()
      && this.fullAudioBridge?.supportsTransparentListenOnly();
  }

  observeVoiceActivity() {
    // Observe voice activity changes to update any relevant *local* states
    // (see onVoiceUserChanges)
    if (!this._voiceActivityObserver) {
      const subHash = stringToHash(JSON.stringify({
        subscription: VOICE_ACTIVITY,
      }));
      this._voiceActivityObserver = GrahqlSubscriptionStore.makeSubscription(VOICE_ACTIVITY);
      window.addEventListener('graphqlSubscription', (e) => {
        const { subscriptionHash, response } = e.detail;
        if (subscriptionHash === subHash) {
          if (response) {
            const { data } = response;
            const voiceUser = data.user_voice_activity_stream.find((v) => v.userId === Auth.userID);
            this.onVoiceUserChanges(voiceUser);
          }
        }
      });
    }
  }

  init(userData, audioEventHandler) {
    this.userData = userData;
    this.inputDeviceId = getStoredAudioInputDeviceId() || DEFAULT_INPUT_DEVICE_ID;
    this.outputDeviceId = getCurrentAudioSinkId();
    this._applyCachedOutputDeviceId();
    this._trackPermissionStatus();
    this.loadBridges(userData);
    this.transparentListenOnlySupported = this.supportsTransparentListenOnly();
    this.audioEventHandler = audioEventHandler;
    this.initialized = true;
  }

  /**
   * Load audio bridges modules to be used the manager.
   *
   * Bridges can be configured in settings.yml file.
   * @param {Object} userData The Object representing user data to be passed to
   *                      the bridge.
   */
  loadBridges(userData) {
    let FullAudioBridge = SIPBridge;
    let ListenOnlyBridge = SFUAudioBridge;

    const MEDIA = window.meetingClientSettings.public.media;

    if (MEDIA.audio) {
      const { defaultFullAudioBridge, defaultListenOnlyBridge } = MEDIA.audio;

      const _fullAudioBridge = getFromUserSettings(
        'bbb_fullaudio_bridge',
        getFromMeetingSettings('fullaudio-bridge', defaultFullAudioBridge),
      );

      this.bridges = {
        [_fullAudioBridge]: SIPBridge,
        [defaultListenOnlyBridge]: SFUAudioBridge,
      };

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
      };

      Object.defineProperty(this, key, {
        set: (value) => {
          this[privateKey].value(value);
        },
        get: () => this[privateKey].value(),
        [`getReferece${key}`]: () => this[privateKey],
      });
    });
  }

  async trickleIce() {
    const { isFirefox, isIe, isSafari } = browserInfo;

    if (
      !this.listenOnlyBridge ||
      typeof this.listenOnlyBridge.trickleIce !== 'function' ||
      isFirefox ||
      isIe ||
      isSafari
    ) {
      return [];
    }

    if (this.validIceCandidates && this.validIceCandidates.length) {
      logger.info(
        { logCode: 'audiomanager_trickle_ice_reuse_candidate' },
        'Reusing trickle ICE information before activating microphone'
      );
      return this.validIceCandidates;
    }

    logger.info(
      { logCode: 'audiomanager_trickle_ice_get_local_candidate' },
      'Performing trickle ICE before activating microphone'
    );

    try {
      this.validIceCandidates = await this.listenOnlyBridge.trickleIce();
      return this.validIceCandidates;
    } catch (error) {
      logger.error(
        {
          logCode: 'audiomanager_trickle_ice_failed',
          extraInfo: {
            errorName: error.name,
            errorMessage: error.message,
          },
        },
        `Trickle ICE before activating microphone failed: ${error.message}`
      );
      return [];
    }
  }

  joinMicrophone() {
    this.isListenOnly = false;
    this.isEchoTest = false;

    return this.onAudioJoining
      .bind(this)()
      .then(() => {
        const callOptions = {
          isListenOnly: false,
          extension: null,
          inputStream: this.inputStream,
          bypassGUM: this.shouldBypassGUM(),
        };
        return this.joinAudio(callOptions, this.callStateCallback.bind(this));
      });
  }

  joinEchoTest() {
    this.isListenOnly = false;
    this.isEchoTest = true;

    const MEDIA = window.meetingClientSettings.public.media;
    const ECHO_TEST_NUMBER = MEDIA.echoTestNumber;
    const EXPERIMENTAL_USE_KMS_TRICKLE_ICE_FOR_MICROPHONE =
    window.meetingClientSettings.public.app.experimentalUseKmsTrickleIceForMicrophone;

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
          bypassGUM: this.shouldBypassGUM(),
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

  async joinAudio(callOptions, callStateCallback) {
    try {
      // If there's no input stream, we need to get one via getUserMedia
      if (callOptions?.inputStream == null
        && !this.shouldBypassGUM()
        && !callOptions.isListenOnly) {
        const constraints = getAudioConstraints({ deviceId: this?.bridge?.inputDeviceId });
        this.inputStream = await doGUM({ audio: constraints });
        // eslint-disable-next-line no-param-reassign
        callOptions.inputStream = this.inputStream;
      }

      // Start tracking audio join time here to avoid counting time spent on
      // getUserMedia prompts. We're primarily focused on negotiation times here.
      // We're only concerned with gUM timeouts - and it'll throw an error which
      // is logged accordingly whenever it times out.
      this.audioJoinStartTime = new Date();
      this.logAudioJoinTime = false;

      await this.bridge.joinAudio(callOptions, callStateCallback.bind(this));
    } catch (error) {
      // Reset audio join time tracking if an error occurs
      this.audioJoinStartTime = null;
      this.logAudioJoinTime = false;
      const { name, message } = error;
      const errorPayload = {
        type: 'MEDIA_ERROR',
        errMessage: message || 'MEDIA_ERROR',
        errCode: AudioErrors.MIC_ERROR.UNKNOWN,
      };

      switch (name) {
        case 'NotAllowedError':
          errorPayload.errCode = AudioErrors.MIC_ERROR.NO_PERMISSION;
          logger.error({
            logCode: 'audiomanager_error_getting_device',
            extraInfo: {
              errorName: error.name,
              errorMessage: error.message,
            },
          }, `Error getting microphone - {${error.name}: ${error.message}}`);
          break;
        case 'NotFoundError':
          errorPayload.errCode = AudioErrors.MIC_ERROR.DEVICE_NOT_FOUND;
          // Reset the input device ID so the user can select a new one
          this.changeInputDevice(null);
          logger.error({
            logCode: 'audiomanager_error_device_not_found',
            extraInfo: {
              errorName: error.name,
              errorMessage: error.message,
            },
          }, `Error getting microphone - {${error.name}: ${error.message}}`);
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

      throw errorPayload;
    }
  }

  async joinListenOnly() {
    this.isListenOnly = true;
    this.isEchoTest = false;

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
    this.isMuted = true;
    this.error = false;
    this.observeVoiceActivity();
    // Ensure the local mute state (this.isMuted) is aligned with the initial
    // placeholder value before joining audio.
    // Currently, the server sets the placeholder mute state to *true*, and this
    // is only communicated via observeVoiceActivity's subscription if the initial
    // state differs from the placeholder or when the state changes.
    // Refer to user_voice_activity DB schema for details.
    // tl;dr: without enforcing the initial mute state here, the client won't be
    // locally muted if the audio channel starts muted (e.g., dialplan-level
    // muteOnStart).
    this.setSenderTrackEnabled(!this.isMuted);

    return Promise.resolve();
  }

  exitAudio() {
    if (!this.isConnected) return Promise.resolve();

    this.isHangingUp = true;

    return this.bridge.exitAudio();
  }

  forceExitAudio() {
    this.onAudioExit();

    return this.bridge && this.bridge.exitAudio();
  }

  transferCall() {
    this.onTransferStart();
    return this.bridge.transferCall(this.onAudioJoin.bind(this));
  }

  onVoiceUserChanges(fields = {}) {
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
    this.isConnected = true;
    this.isConnecting = false;

    const STATS = window.meetingClientSettings.public.stats;
    // If we don't have a start time, something went wrong with the tracking code
    // Log it as 0 seconds to keep things consistent, but 0 should be treated
    // as an invalid value and be ignored in any log analysis.
    const secondsToActivateAudio = this.audioJoinStartTime > 0
      ? (new Date() - this.audioJoinStartTime) / 1000
      : 0;

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
        const extractedDeviceId = MediaStreamUtils.extractDeviceIdFromStream(
          this.inputStream,
          'audio',
        );
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
      logger.info({
        logCode: 'audio_joined',
        extraInfo: {
          secondsToActivateAudio,
          inputDeviceId: this.inputDeviceId,
          outputDeviceId: this.outputDeviceId,
          isListenOnly: this.isListenOnly,
        },
      }, 'Audio Joined');
      if (STATS.enabled) this.monitor();
      this.audioEventHandler({
        name: 'started',
        isListenOnly: this.isListenOnly,
      });
    }
    Session.setItem('audioModalIsOpen', false);
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

      const { status, error, bridgeError, silenceNotifications, bridge } = response;

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
        logger.info({ logCode: 'audio_ended' }, 'Audio ended without issue');
        this.onAudioExit();
      } else if (status === FAILED) {
        this.isReconnecting = false;
        this.setBreakoutAudioTransferStatus({
          breakoutMeetingId: '',
          status: BREAKOUT_AUDIO_TRANSFER_STATES.DISCONNECTED,
        });
        const errorKey = this.messages.error[error] || this.messages.error.GENERIC_ERROR;
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
        logger.info({ logCode: 'audio_reconnecting' }, 'Attempting to reconnect audio');
        this.notify(this.intl.formatMessage(this.messages.info.RECONNECTING_AUDIO), true);
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
    return Boolean(this.isConnected || this.isConnecting || this.isHangingUp);
  }

  changeInputDevice(deviceId) {
    if (deviceId === this.inputDeviceId) return this.inputDeviceId;

    const currentDeviceId = this.inputDeviceId ?? 'none';
    this.inputDeviceId = deviceId;
    logger.debug({
      logCode: 'audiomanager_input_device_change',
      extraInfo: {
        deviceId: currentDeviceId,
        newDeviceId: deviceId || 'none',
      },
    }, `Microphone input device changed: from ${currentDeviceId} to ${deviceId || 'none'}`);

    return this.inputDeviceId;
  }

  liveChangeInputDevice(deviceId) {
    const currentDeviceId = this.inputDeviceId ?? 'none';
    // we force stream to be null, so MutedAlert will deallocate it and
    // a new one will be created for the new stream
    this.inputStream = null;
    return this.bridge
      .liveChangeInputDevice(deviceId)
      .then((stream) => {
        this.inputStream = stream;
        const extractedDeviceId = MediaStreamUtils.extractDeviceIdFromStream(
          this.inputStream,
          'audio'
        );
        if (extractedDeviceId && extractedDeviceId !== this.inputDeviceId) {
          this.changeInputDevice(extractedDeviceId);
        }
        // Live input device change - add device ID to session storage so it
        // can be re-used on refreshes/other sessions
        storeAudioInputDeviceId(extractedDeviceId);
        this.setSenderTrackEnabled(!this.isMuted);
      })
      .catch((error) => {
        logger.error(
          {
            logCode: 'audiomanager_input_live_device_change_failure',
            extraInfo: {
              errorName: error.name,
              errorMessage: error.message,
              deviceId: currentDeviceId,
              newDeviceId: deviceId,
            },
          },
          `Input device live change failed - {${error.name}: ${error.message}}`
        );

        throw error;
      });
  }

  async changeOutputDevice(deviceId, isLive) {
    const targetDeviceId = deviceId;
    const currentDeviceId = this.outputDeviceId ?? getCurrentAudioSinkId();

    const MEDIA = window.meetingClientSettings.public.media;
    const MEDIA_TAG = MEDIA.mediaTag;
    const audioElement = document.querySelector(MEDIA_TAG);
    const sinkIdSupported = audioElement && typeof audioElement.setSinkId === 'function';

    if (typeof deviceId === 'string' && sinkIdSupported && currentDeviceId !== targetDeviceId) {
      try {
        if (!isLive) audioElement.srcObject = null;

        await audioElement.setSinkId(deviceId);
        reloadAudioElement(audioElement);
        logger.debug(
          {
            logCode: 'audiomanager_output_device_change',
            extraInfo: {
              deviceId: currentDeviceId,
              newDeviceId: deviceId,
            },
          },
          `Audio output device changed: from ${currentDeviceId || 'default'} to ${
            deviceId || 'default'
          }`
        );
        this.outputDeviceId = deviceId;

        // Live output device change - add device ID to session storage so it
        // can be re-used on refreshes/other sessions
        if (isLive) storeAudioOutputDeviceId(deviceId);

        return this.outputDeviceId;
      } catch (error) {
        logger.error(
          {
            logCode: 'audiomanager_output_device_change_failure',
            extraInfo: {
              errorName: error.name,
              errorMessage: error.message,
              deviceId: currentDeviceId,
              newDeviceId: targetDeviceId,
            },
          },
          `Error changing output device - {${error.name}: ${error.message}}`
        );

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
    return this._inputStream();
  }

  get bridge() {
    return this.isListenOnly ? this.listenOnlyBridge : this.fullAudioBridge;
  }

  set inputStream(stream) {
    // We store reactive information about input stream
    // because mutedalert component needs to track when it changes
    // and then update hark with the new value for inputStream

    this._inputStream(stream);
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
        window.meetingClientSettings.public.app.cdn +
        window.meetingClientSettings.public.app.basename
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
   * Get the info about candidate-pair that is being used by the current peer.
   * For firefox, or any other browser that doesn't support iceTransport
   * property of RTCDtlsTransport, we retrieve the selected local candidate
   * by looking into stats returned from getStats() api. For other browsers,
   * we should use getSelectedCandidatePairFromPeer instead, because it has
   * relatedAddress and relatedPort information about local candidate.
   *
   * @param {Object} stats object returned by getStats() api
   * @returns An Object of type RTCIceCandidatePairStats containing information
   *          about the candidate-pair being used by the peer.
   *
   * For firefox, we can use the 'selected' flag to find the candidate pair
   * being used, while in chrome we can retrieved the selected pair
   * by looking for the corresponding transport of the active peer.
   * For more information see:
   * https://www.w3.org/TR/webrtc-stats/#dom-rtcicecandidatepairstats
   * and
   * https://developer.mozilla.org/en-US/docs/Web/API/RTCIceCandidatePairStats/selected#value
   */
  static getSelectedCandidatePairFromStats(stats) {
    if (!stats || typeof stats !== 'object') return null;

    const transport = Object.values(stats).find((stat) => stat.type === 'transport') || {};

    return Object.values(stats).find(
      (stat) =>
        stat.type === 'candidate-pair' &&
        stat.nominated &&
        (stat.selected || stat.id === transport.selectedCandidatePairId)
    );
  }

  /**
   * Get the info about candidate-pair that is being used by the current peer.
   * This function's return value (RTCIceCandidatePair object ) is different
   * from getSelectedCandidatePairFromStats (RTCIceCandidatePairStats object).
   * The information returned here contains the relatedAddress and relatedPort
   * fields (only for candidates that are derived from another candidate, for
   * host candidates, these fields are null). These field can be helpful for
   * debugging network issues. For all the browsers that support iceTransport
   * field of RTCDtlsTransport, we use this function as default to retrieve
   * information about current selected-pair. For other browsers we retrieve it
   * from getSelectedCandidatePairFromStats
   *
   * @returns {Object} An RTCIceCandidatePair represented the selected
   *                   candidate-pair of the active peer.
   *
   * For more info see:
   * https://www.w3.org/TR/webrtc/#dom-rtcicecandidatepair
   * and
   * https://developer.mozilla.org/en-US/docs/Web/API/RTCIceCandidatePair
   * and
   * https://developer.mozilla.org/en-US/docs/Web/API/RTCDtlsTransport
   */
  getSelectedCandidatePairFromPeer() {
    if (!this.bridge) return null;

    const peer = this.bridge.getPeerConnection();

    if (!peer) return null;

    let selectedPair = null;

    const receivers = peer.getReceivers();
    if (
      receivers &&
      receivers[0] &&
      receivers[0].transport &&
      receivers[0].transport.iceTransport &&
      typeof receivers[0].transport.iceTransport.getSelectedCandidatePair === 'function'
    ) {
      selectedPair = receivers[0].transport.iceTransport.getSelectedCandidatePair();
    }

    return selectedPair;
  }

  /**
   * Gets the selected local-candidate information. For browsers that support
   * iceTransport property (see getSelectedCandidatePairFromPeer) we get this
   * info from peer, otherwise we retrieve this information from getStats() api
   *
   * @param {Object} [stats] The status object returned from getStats() api
   * @returns {Object} An Object containing the information about the
   *                   local-candidate. For browsers that support iceTransport
   *                   property, the object's type is RCIceCandidate. A
   *                   RTCIceCandidateStats is returned, otherwise.
   *
   * For more info see:
   * https://www.w3.org/TR/webrtc/#dom-rtcicecandidate
   * and
   * https://www.w3.org/TR/webrtc-stats/#dom-rtcicecandidatestats
   *
   */
  getSelectedLocalCandidate(stats) {
    let selectedPair = this.getSelectedCandidatePairFromPeer();

    if (selectedPair) return selectedPair.local;

    if (!stats) return null;

    selectedPair = AudioManager.getSelectedCandidatePairFromStats(stats);

    if (selectedPair) return stats[selectedPair.localCandidateId];

    return null;
  }

  /**
   * Gets the information about private/public ip address from peer
   * stats. The information retrieved from selected pair from the current
   * RTCIceTransport and returned in a new Object with format:
   * {
   *   address: String,
   *   relatedAddress: String,
   *   port: Number,
   *   relatedPort: Number,
   *   candidateType: String,
   *   selectedLocalCandidate: Object,
   * }
   *
   * If users isn't behind NAT, relatedAddress and relatedPort may be null.
   *
   * @returns An Object containing the information about private/public IP
   *          addresses and ports.
   *
   * For more information see:
   * https://www.w3.org/TR/webrtc-stats/#dom-rtcicecandidatepairstats
   * and
   * https://www.w3.org/TR/webrtc-stats/#dom-rtcicecandidatestats
   * and
   * https://www.w3.org/TR/webrtc/#rtcicecandidatetype-enum
   */
  async getInternalExternalIpAddresses(stats) {
    let transports = {};

    if (stats) {
      const selectedLocalCandidate = this.getSelectedLocalCandidate(stats);

      if (!selectedLocalCandidate) return transports;

      const candidateType = selectedLocalCandidate.candidateType || selectedLocalCandidate.type;

      transports = {
        isUsingTurn: candidateType === 'relay',
        address: selectedLocalCandidate.address,
        relatedAddress: selectedLocalCandidate.relatedAddress,
        port: selectedLocalCandidate.port,
        relatedPort: selectedLocalCandidate.relatedPort,
        candidateType,
        selectedLocalCandidate,
      };
    }

    return transports;
  }

  /**
   * Get stats about active audio peer.
   * We filter the status based on FILTER_AUDIO_STATS constant.
   * We also append to the returned object the information about peer's
   * transport. This transport information is retrieved by
   * getInternalExternalIpAddressesFromPeer().
   *
   * @returns An Object containing the status about the active audio peer.
   *
   * For more information see:
   * https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/getStats
   * and
   * https://developer.mozilla.org/en-US/docs/Web/API/RTCStatsReport
   */
  async getStats() {
    if (!this.bridge) return null;

    const peer = this.bridge.getPeerConnection();

    if (!peer) return null;

    const peerStats = await peer.getStats();

    const audioStats = {};

    peerStats.forEach((stat) => {
      if (FILTER_AUDIO_STATS.includes(stat.type)) {
        audioStats[stat.id] = stat;
      }
    });

    const transportStats = await this.getInternalExternalIpAddresses(audioStats);

    return { transportStats, ...audioStats };
  }
}

const audioManager = new AudioManager();
export default audioManager;
