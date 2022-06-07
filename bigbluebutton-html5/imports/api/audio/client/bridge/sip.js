import BaseAudioBridge from './base';
import logger from '/imports/startup/client/logger';
import {
  fetchWebRTCMappedStunTurnServers,
  getMappedFallbackStun,
} from '/imports/utils/fetchStunTurnServers';
import {
  isUnifiedPlan,
  toUnifiedPlan,
  toPlanB,
  stripMDnsCandidates,
  filterValidIceCandidates,
  analyzeSdp,
  logSelectedCandidate,
} from '/imports/utils/sdpUtils';
import { Tracker } from 'meteor/tracker';
import VoiceCallStates from '/imports/api/voice-call-states';
import CallStateOptions from '/imports/api/voice-call-states/utils/callStates';
import Auth from '/imports/ui/services/auth';
import Settings from '/imports/ui/services/settings';
import Storage from '/imports/ui/services/storage/session';
import browserInfo from '/imports/utils/browserInfo';

const MEDIA = Meteor.settings.public.media;
const MEDIA_TAG = MEDIA.mediaTag;
const CALL_TRANSFER_TIMEOUT = MEDIA.callTransferTimeout;
const CALL_HANGUP_TIMEOUT = MEDIA.callHangupTimeout;
const CALL_HANGUP_MAX_RETRIES = MEDIA.callHangupMaximumRetries;
const SIPJS_HACK_VIA_WS = MEDIA.sipjsHackViaWs;
const IPV4_FALLBACK_DOMAIN = Meteor.settings.public.app.ipv4FallbackDomain;
const CALL_CONNECT_TIMEOUT = 20000;
const ICE_NEGOTIATION_TIMEOUT = 20000;
const AUDIO_SESSION_NUM_KEY = 'AudioSessionNumber';
const USER_AGENT_RECONNECTION_ATTEMPTS = MEDIA.audioReconnectionAttempts || 3;
const USER_AGENT_RECONNECTION_DELAY_MS = MEDIA.audioReconnectionDelay || 5000;
const USER_AGENT_CONNECTION_TIMEOUT_MS = MEDIA.audioConnectionTimeout || 5000;
const ICE_GATHERING_TIMEOUT = MEDIA.iceGatheringTimeout || 5000;
const BRIDGE_NAME = 'sip';
const WEBSOCKET_KEEP_ALIVE_INTERVAL = MEDIA.websocketKeepAliveInterval || 0;
const WEBSOCKET_KEEP_ALIVE_DEBOUNCE = MEDIA.websocketKeepAliveDebounce || 10;
const TRACE_SIP = MEDIA.traceSip || false;
const AUDIO_MICROPHONE_CONSTRAINTS = Meteor.settings.public.app.defaultSettings
  .application.microphoneConstraints;
const SDP_SEMANTICS = MEDIA.sdpSemantics;
const FORCE_RELAY = MEDIA.forceRelay;

const DEFAULT_INPUT_DEVICE_ID = 'default';
const DEFAULT_OUTPUT_DEVICE_ID = 'default';

const INPUT_DEVICE_ID_KEY = 'audioInputDeviceId';
const OUTPUT_DEVICE_ID_KEY = 'audioOutputDeviceId';

const getAudioSessionNumber = () => {
  let currItem = parseInt(sessionStorage.getItem(AUDIO_SESSION_NUM_KEY), 10);
  if (!currItem) {
    currItem = 0;
  }

  currItem += 1;
  sessionStorage.setItem(AUDIO_SESSION_NUM_KEY, currItem);
  return currItem;
};

const getCurrentAudioSessionNumber = () => {
  return sessionStorage.getItem(AUDIO_SESSION_NUM_KEY) || '0';
}

/**
  * Get error code from SIP.js websocket messages.
 */
const getErrorCode = (error) => {
  try {
    if (!error) return error;

    const match = error.message.match(/code: \d+/g);

    const _codeArray = match[0].split(':');

    return parseInt(_codeArray[1].trim(), 10);
  } catch (e) {
    return 0;
  }
};

class SIPSession {
  constructor(user, userData, protocol, hostname,
    baseCallStates, baseErrorCodes, reconnectAttempt) {
    this.user = user;
    this.userData = userData;
    this.protocol = protocol;
    this.hostname = hostname;
    this.baseCallStates = baseCallStates;
    this.baseErrorCodes = baseErrorCodes;
    this.reconnectAttempt = reconnectAttempt;
    this.currentSession = null;
    this.remoteStream = null;
    this._inputDeviceId = null;
    this._outputDeviceId = null;
    this._hangupFlag = false;
    this._reconnecting = false;
    this._currentSessionState = null;
    this._ignoreCallState = false;
  }

  get inputStream() {
    if (this.currentSession && this.currentSession.sessionDescriptionHandler) {
      return this.currentSession.sessionDescriptionHandler.localMediaStream;
    }
    return null;
  }

  getAudioConstraints() {
    const userSettingsConstraints = Settings.application.microphoneConstraints;
    const audioDeviceConstraints = userSettingsConstraints
      || AUDIO_MICROPHONE_CONSTRAINTS || {};

    const matchConstraints = this.filterSupportedConstraints(
      audioDeviceConstraints,
    );

    if (this.inputDeviceId) {
      matchConstraints.deviceId = { exact: this.inputDeviceId };
    }

    return matchConstraints;
  }

  /**
   * Set the input stream for the peer that represents the current session.
   * Internally, this will call the sender's replaceTrack function.
   * @param  {MediaStream}  stream The MediaStream object to be used as input
   *                               stream
   * @return {Promise}            A Promise that is resolved with the
   *                              MediaStream object that was set.
   */
  async setInputStream(stream) {
    try {
      if (!this.currentSession
        || !this.currentSession.sessionDescriptionHandler
      ) return null;

      await this.currentSession.sessionDescriptionHandler
        .setLocalMediaStream(stream);

      return stream;
    } catch (error) {
      logger.warn({
        logCode: 'sip_js_setinputstream_error',
        extraInfo: {
          errorCode: error.code,
          errorMessage: error.message,
          callerIdName: this.user.callerIdName,
        },
      }, 'Failed to set input stream (mic)');
      return null;
    }
  }

  /**
   * Change the input device with the given deviceId, without renegotiating
   * peer.
   * A new MediaStream object is created for the given deviceId. This object
   * is returned by the resolved promise.
   * @param  {String}  deviceId The id of the device to be set as input
   * @return {Promise}          A promise that is resolved with the MediaStream
   *                            object after changing the input device.
   */
  async liveChangeInputDevice(deviceId) {
    try {
      this.inputDeviceId = deviceId;

      const constraints = {
        audio: this.getAudioConstraints(),
      };

      this.inputStream.getAudioTracks().forEach((t) => t.stop());

      return await navigator.mediaDevices.getUserMedia(constraints)
        .then(this.setInputStream.bind(this));
    } catch (error) {
      logger.warn({
        logCode: 'sip_js_livechangeinputdevice_error',
        extraInfo: {
          errorCode: error.code,
          errorMessage: error.message,
          callerIdName: this.user.callerIdName,
        },
      }, 'Failed to change input device (mic)');
      return null;
    }
  }

  get inputDeviceId() {
    if (!this._inputDeviceId) {
      const stream = this.inputStream;

      if (stream) {
        const track = stream.getAudioTracks().find(
          (t) => t.getSettings().deviceId,
        );

        if (track && (typeof track.getSettings === 'function')) {
          const { deviceId } = track.getSettings();
          this._inputDeviceId = deviceId;
        }
      }
    }

    return this._inputDeviceId;
  }

  set inputDeviceId(deviceId) {
    this._inputDeviceId = deviceId;
  }

  get outputDeviceId() {
    if (!this._outputDeviceId) {
      const audioElement = document.querySelector(MEDIA_TAG);
      if (audioElement) {
        this._outputDeviceId = audioElement.sinkId;
      }
    }

    return this._outputDeviceId;
  }

  set outputDeviceId(deviceId) {
    this._outputDeviceId = deviceId;
  }

  /**
   * This _ignoreCallState flag is set to true when we want to ignore SIP's
   * call state retrieved directly from FreeSWITCH ESL, when doing some checks
   * (for example , when checking  if call stopped).
   * We need to ignore this , for example, when moderator is in
   * breakout audio transfer ("Join Audio" button in breakout panel): in this
   * case , we will monitor moderator's lifecycle in audio conference by
   * using the SIP state taken from SIP.js only (ignoring the ESL's call state).
   * @param {boolean} value true to ignore call state, false otherwise.
   */
  set ignoreCallState(value) {
    this._ignoreCallState = value;
  }

  get ignoreCallState() {
    return this._ignoreCallState;
  }

  joinAudio({
    isListenOnly,
    extension,
    inputDeviceId,
    outputDeviceId,
    validIceCandidates,
  }, managerCallback) {
    return new Promise((resolve, reject) => {
      const callExtension = extension ? `${extension}${this.userData.voiceBridge}` : this.userData.voiceBridge;

      this.ignoreCallState = false;

      const callback = (message) => {
        // There will sometimes we erroneous errors put out like timeouts and improper shutdowns,
        // but only the first error ever matters
        if (this.alreadyErrored) {
          logger.info({
            logCode: 'sip_js_absorbing_callback_message',
            extraInfo: { message },
          }, 'Absorbing a redundant callback message.');
          return;
        }

        if (message.status === this.baseCallStates.failed) {
          this.alreadyErrored = true;
        }

        managerCallback(message).then(resolve);
      };

      this.callback = callback;

      // If there's an extension passed it means that we're joining the echo test first
      this.inEchoTest = !!extension;

      this.validIceCandidates = validIceCandidates;

      return this.doCall({
        callExtension,
        isListenOnly,
        inputDeviceId,
        outputDeviceId,
      }).catch((reason) => {
        reject(reason);
      });
    });
  }

  async getIceServers(sessionToken) {
    try {
      const iceServers = await fetchWebRTCMappedStunTurnServers(sessionToken);
      return iceServers;
    } catch (error) {
      logger.error({
        logCode: 'sip_js_fetchstunturninfo_error',
        extraInfo: {
          errorCode: error.code,
          errorMessage: error.message,
          callerIdName: this.user.callerIdName,
        },
      }, 'Full audio bridge failed to fetch STUN/TURN info');
      return getMappedFallbackStun();
    }
  }

  doCall(options) {
    const {
      isListenOnly,
      inputDeviceId,
      outputDeviceId,
    } = options;

    this.inputDeviceId = inputDeviceId;
    this.outputDeviceId = outputDeviceId;

    const {
      userId,
      name,
      sessionToken,
    } = this.user;

    const callerIdName = [
      `${userId}_${getAudioSessionNumber()}`,
      'bbbID',
      isListenOnly ? `LISTENONLY-${name}` : name,
    ].join('-').replace(/"/g, "'");

    this.user.callerIdName = callerIdName;
    this.callOptions = options;

    return this.getIceServers(sessionToken)
      .then(this.createUserAgent.bind(this))
      .then(this.inviteUserAgent.bind(this));
  }

  transferCall(onTransferSuccess) {
    return new Promise((resolve, reject) => {
      this.inEchoTest = false;

      let trackerControl = null;

      const timeout = setTimeout(() => {
        trackerControl.stop();
        logger.warn({ logCode: 'sip_js_transfer_timed_out' },
          'Timeout on transferring from echo test to conference');
        this.callback({
          status: this.baseCallStates.failed,
          error: 1008,
          bridgeError: 'Timeout on call transfer',
          bridge: BRIDGE_NAME,
        });

        this.exitAudio();

        reject(this.baseErrorCodes.REQUEST_TIMEOUT);
      }, CALL_TRANSFER_TIMEOUT);

      // This is is the call transfer code ask @chadpilkey
      logger.debug({
        logCode: 'sip_js_rtp_payload_send_dtmf',
        extraInfo: {
          callerIdName: this.user.callerIdName,
        },
      }, 'Sending DTMF INFO to transfer user');
      this.sendDtmf(1);

      Tracker.autorun((c) => {
        trackerControl = c;
        const selector = { meetingId: Auth.meetingID, userId: Auth.userID };
        const query = VoiceCallStates.find(selector);

        query.observeChanges({
          changed: (id, fields) => {
            if (fields.callState === CallStateOptions.IN_CONFERENCE) {
              clearTimeout(timeout);
              onTransferSuccess();

              c.stop();
              resolve();
            }
          },
        });
      });
    });
  }

  /**
    *
    * sessionSupportRTPPayloadDtmf
    * tells if browser support RFC4733 DTMF.
    * Safari 13 doens't support it yet
    */
  sessionSupportRTPPayloadDtmf(session) {
    try {
      const sessionDescriptionHandler = session
        ? session.sessionDescriptionHandler
        : this.currentSession.sessionDescriptionHandler;

      const senders = sessionDescriptionHandler.peerConnection.getSenders();
      return !!(senders[0].dtmf);
    } catch (error) {
      return false;
    }
  }

  /**
    * sendDtmf - send DTMF Tones using INFO message
    *
    * same as SimpleUser's dtmf
    */
  sendDtmf(tone) {
    const dtmf = tone;
    const duration = 2000;
    const body = {
      contentDisposition: 'render',
      contentType: 'application/dtmf-relay',
      content: `Signal=${dtmf}\r\nDuration=${duration}`,
    };
    const requestOptions = { body };
    return this.currentSession.info({ requestOptions });
  }

  exitAudio() {
    return new Promise((resolve, reject) => {
      let hangupRetries = 0;
      this._hangupFlag = false;

      this.userRequestedHangup = true;

      const tryHangup = () => {
        if (this._hangupFlag) {
          resolve();
        }

        if ((this.currentSession
          && (this.currentSession.state === SIP.SessionState.Terminated))
          || (this.userAgent && (!this.userAgent.isConnected()))) {
          this._hangupFlag = true;
          return resolve();
        }

        if (this.currentSession
          && ((this.currentSession.state === SIP.SessionState.Establishing))) {
          this.currentSession.cancel().then(() => {
            this._hangupFlag = true;
            return resolve();
          });
        }

        if (this.currentSession
          && ((this.currentSession.state === SIP.SessionState.Established))) {
          this.currentSession.bye().then(() => {
            this._hangupFlag = true;
            return resolve();
          });
        }

        if (this.userAgent && this.userAgent.isConnected()) {
          this.userAgent.stop();
          window.removeEventListener('beforeunload', this.onBeforeUnload);
        }


        hangupRetries += 1;

        setTimeout(() => {
          if (hangupRetries > CALL_HANGUP_MAX_RETRIES) {
            this.callback({
              status: this.baseCallStates.failed,
              error: 1006,
              bridgeError: 'Timeout on call hangup',
              bridge: BRIDGE_NAME,
            });
            return reject(this.baseErrorCodes.REQUEST_TIMEOUT);
          }

          if (!this._hangupFlag) return tryHangup();
          return resolve();
        }, CALL_HANGUP_TIMEOUT);
      };

      return tryHangup();
    });
  }

  stopUserAgent() {
    if (this.userAgent && (typeof this.userAgent.stop === 'function')) {
      return this.userAgent.stop();
    }
    return Promise.resolve();
  }

  onBeforeUnload() {
    this.userRequestedHangup = true;
    return this.stopUserAgent();
  }

  createUserAgent(iceServers) {
    return new Promise((resolve, reject) => {
      if (this.userRequestedHangup === true) reject();

      const {
        hostname,
        protocol,
      } = this;

      const {
        callerIdName,
        sessionToken,
      } = this.user;

      logger.debug({ logCode: 'sip_js_creating_user_agent', extraInfo: { callerIdName } }, 'Creating the user agent');

      if (this.userAgent && this.userAgent.isConnected()) {
        if (this.userAgent.configuration.hostPortParams === this.hostname) {
          logger.debug({ logCode: 'sip_js_reusing_user_agent', extraInfo: { callerIdName } }, 'Reusing the user agent');
          resolve(this.userAgent);
          return;
        }
        logger.debug({ logCode: 'sip_js_different_host_name', extraInfo: { callerIdName } }, 'Different host name. need to kill');
      }

      const localSdpCallback = (sdp) => {
        // For now we just need to call the utils function to parse and log the different pieces.
        // In the future we're going to want to be tracking whether there were TURN candidates
        // and IPv4 candidates to make informed decisions about what to do on fallbacks/reconnects.
        analyzeSdp(sdp);
      };

      const remoteSdpCallback = (sdp) => {
        // We have have to find the candidate that FS sends back to us to determine if the client
        // is connecting with IPv4 or IPv6
        const sdpInfo = analyzeSdp(sdp, false);
        this.protocolIsIpv6 = sdpInfo.v6Info.found;
      };

      let userAgentConnected = false;
      const token = `sessionToken=${sessionToken}`;

      this.userAgent = new SIP.UserAgent({
        uri: SIP.UserAgent.makeURI(`sip:${encodeURIComponent(callerIdName)}@${hostname}`),
        transportOptions: {
          server: `${(protocol === 'https:' ? 'wss://' : 'ws://')}${hostname}/ws?${token}`,
          connectionTimeout: USER_AGENT_CONNECTION_TIMEOUT_MS,
          keepAliveInterval: WEBSOCKET_KEEP_ALIVE_INTERVAL,
          keepAliveDebounce: WEBSOCKET_KEEP_ALIVE_DEBOUNCE,
          traceSip: TRACE_SIP,
        },
        sessionDescriptionHandlerFactoryOptions: {
          peerConnectionConfiguration: {
            iceServers,
            sdpSemantics: SDP_SEMANTICS,
            iceTransportPolicy: FORCE_RELAY ? 'relay' : undefined,
          },
        },
        displayName: callerIdName,
        register: false,
        userAgentString: 'BigBlueButton',
        hackViaWs: SIPJS_HACK_VIA_WS,
      });

      const handleUserAgentConnection = () => {
        if (!userAgentConnected) {
          userAgentConnected = true;
          resolve(this.userAgent);
        }
      };

      const handleUserAgentDisconnection = () => {
        if (this.userAgent) {
          if (this.userRequestedHangup) {
            userAgentConnected = false;
            return;
          }

          let error;
          let bridgeError;

          if (!this._reconnecting) {
            logger.info({
              logCode: 'sip_js_session_ua_disconnected',
              extraInfo: {
                callerIdName: this.user.callerIdName,
              },
            }, 'User agent disconnected: trying to reconnect...'
            + ` (userHangup = ${!!this.userRequestedHangup})`);

            logger.info({
              logCode: 'sip_js_session_ua_reconnecting',
              extraInfo: {
                callerIdName: this.user.callerIdName,
              },
            }, 'User agent disconnected, reconnecting');

            this.reconnect().then(() => {
              logger.info({
                logCode: 'sip_js_session_ua_reconnected',
                extraInfo: {
                  callerIdName: this.user.callerIdName,
                },
              }, 'User agent succesfully reconnected');
            }).catch(() => {
              if (userAgentConnected) {
                error = 1001;
                bridgeError = 'Websocket disconnected';
              } else {
                error = 1002;
                bridgeError = 'Websocket failed to connect';
              }

              this.stopUserAgent();

              this.callback({
                status: this.baseCallStates.failed,
                error,
                bridgeError,
                bridge: BRIDGE_NAME,
              });
              reject(this.baseErrorCodes.CONNECTION_ERROR);
            });
          }
        }
      };

      this.userAgent.transport.onConnect = handleUserAgentConnection;
      this.userAgent.transport.onDisconnect = handleUserAgentDisconnection;

      const preturn = this.userAgent.start().then(() => {
        logger.info({
          logCode: 'sip_js_session_ua_connected',
          extraInfo: {
            callerIdName: this.user.callerIdName,
          },
        }, 'User agent succesfully connected');

        window.addEventListener('beforeunload', this.onBeforeUnload.bind(this));

        resolve();
      }).catch((error) => {
        logger.info({
          logCode: 'sip_js_session_ua_reconnecting',
          extraInfo: {
            callerIdName: this.user.callerIdName,
          },
        }, 'User agent failed to connect, reconnecting');

        const code = getErrorCode(error);

        // Websocket's 1006 is currently mapped to BBB's 1002
        if (code === 1006) {
          this.stopUserAgent();

          this.callback({
            status: this.baseCallStates.failed,
            error: 1002,
            bridgeError: 'Websocket failed to connect',
            bridge: BRIDGE_NAME,
          });
          return reject({
            type: this.baseErrorCodes.CONNECTION_ERROR,
          });
        }

        this.reconnect().then(() => {
          logger.info({
            logCode: 'sip_js_session_ua_reconnected',
            extraInfo: {
              callerIdName: this.user.callerIdName,
            },
          }, 'User agent succesfully reconnected');

          resolve();
        }).catch(() => {
          this.stopUserAgent();

          logger.info({
            logCode: 'sip_js_session_ua_disconnected',
            extraInfo: {
              callerIdName: this.user.callerIdName,
            },
          }, 'User agent failed to reconnect after'
          + ` ${USER_AGENT_RECONNECTION_ATTEMPTS} attemps`);

          this.callback({
            status: this.baseCallStates.failed,
            error: 1002,
            bridgeError: 'Websocket failed to connect',
            bridge: BRIDGE_NAME,
          });

          reject({
            type: this.baseErrorCodes.CONNECTION_ERROR,
          });
        });
      });

      return preturn;
    });
  }

  reconnect(attempts = 1) {
    return new Promise((resolve, reject) => {
      if (this._reconnecting) {
        return resolve();
      }

      if (attempts > USER_AGENT_RECONNECTION_ATTEMPTS) {
        return reject({
          type: this.baseErrorCodes.CONNECTION_ERROR,
        });
      }

      this._reconnecting = true;

      logger.info({
        logCode: 'sip_js_session_ua_reconnection_attempt',
        extraInfo: {
          callerIdName: this.user.callerIdName,
        },
      }, `User agent reconnection attempt ${attempts}`);

      this.userAgent.reconnect().then(() => {
        this._reconnecting = false;
        resolve();
      }).catch(() => {
        setTimeout(() => {
          this._reconnecting = false;
          this.reconnect(++attempts).then(() => {
            resolve();
          }).catch((error) => {
            reject(error);
          });
        }, USER_AGENT_RECONNECTION_DELAY_MS);
      });
    });
  }

  isValidIceCandidate(event) {
    return event.candidate
      && this.validIceCandidates
      && this.validIceCandidates.find((validCandidate) => (
        (validCandidate.address === event.candidate.address)
        || (validCandidate.relatedAddress === event.candidate.address))
        && (validCandidate.protocol === event.candidate.protocol));
  }

  onIceGatheringStateChange(event) {
    const iceGatheringState = event.target
      ? event.target.iceGatheringState
      : null;

    if ((iceGatheringState === 'gathering') && (!this._iceGatheringStartTime)) {
      this._iceGatheringStartTime = new Date();
    }

    if (iceGatheringState === 'complete') {
      const secondsToGatherIce = (new Date()
        - (this._iceGatheringStartTime || this._sessionStartTime)) / 1000;

      logger.info({
        logCode: 'sip_js_ice_gathering_time',
        extraInfo: {
          callerIdName: this.user.callerIdName,
          secondsToGatherIce,
        },
      }, `ICE gathering candidates took (s): ${secondsToGatherIce}`);
    }
  }

  onIceCandidate(sessionDescriptionHandler, event) {
    if (this.isValidIceCandidate(event)) {
      logger.info({
        logCode: 'sip_js_found_valid_candidate_from_trickle_ice',
        extraInfo: {
          callerIdName: this.user.callerIdName,
        },
      }, 'Found a valid candidate from trickle ICE, finishing gathering');

      if (sessionDescriptionHandler.iceGatheringCompleteResolve) {
        sessionDescriptionHandler.iceGatheringCompleteResolve();
      }
    }
  }

  initSessionDescriptionHandler(sessionDescriptionHandler) {
    /* eslint-disable no-param-reassign */
    sessionDescriptionHandler.peerConnectionDelegate = {
      onicecandidate:
        this.onIceCandidate.bind(this, sessionDescriptionHandler),
      onicegatheringstatechange:
        this.onIceGatheringStateChange.bind(this),
    };
    /* eslint-enable no-param-reassign */
  }

  inviteUserAgent(userAgent) {
    return new Promise((resolve, reject) => {
      if (this.userRequestedHangup === true) reject();
      const {
        hostname,
      } = this;

      const {
        callExtension,
        isListenOnly,
      } = this.callOptions;

      this._sessionStartTime = new Date();

      const target = SIP.UserAgent.makeURI(`sip:${callExtension}@${hostname}`);

      const matchConstraints = this.getAudioConstraints();

      const inviterOptions = {
        sessionDescriptionHandlerOptions: {
          constraints: {
            audio: isListenOnly
              ? false
              : matchConstraints,
            video: false,
          },
          iceGatheringTimeout: ICE_GATHERING_TIMEOUT,
        },
        sessionDescriptionHandlerModifiersPostICEGathering: [
          stripMDnsCandidates,
          filterValidIceCandidates.bind(this, this.validIceCandidates),
        ],
        delegate: {
          onSessionDescriptionHandler:
            this.initSessionDescriptionHandler.bind(this),
        },
      };

      if (isListenOnly) {
        inviterOptions.sessionDescriptionHandlerOptions.offerOptions = {
          offerToReceiveAudio: true,
        };
      }

      const inviter = new SIP.Inviter(userAgent, target, inviterOptions);
      this.currentSession = inviter;

      this.setupEventHandlers(inviter).then(() => {
        inviter.invite().then(() => {
          resolve();
        }).catch(e => reject(e));
      });
    });
  }

  setupEventHandlers(currentSession) {
    return new Promise((resolve, reject) => {
      if (this.userRequestedHangup === true) reject();

      let iceCompleted = false;
      let fsReady = false;
      let sessionTerminated = false;

      const setupRemoteMedia = () => {
        const mediaElement = document.querySelector(MEDIA_TAG);

        this.remoteStream = new MediaStream();

        this.currentSession.sessionDescriptionHandler
          .peerConnection.getReceivers().forEach((receiver) => {
            if (receiver.track) {
              this.remoteStream.addTrack(receiver.track);
            }
          });

        logger.info({
          logCode: 'sip_js_session_playing_remote_media',
          extraInfo: {
            callerIdName: this.user.callerIdName,
          },
        }, 'Audio call - playing remote media');

        mediaElement.srcObject = this.remoteStream;
        mediaElement.play();
      };

      const checkIfCallReady = () => {
        if (this.userRequestedHangup === true) {
          this.exitAudio();
          resolve();
        }

        logger.info({
          logCode: 'sip_js_session_check_if_call_ready',
          extraInfo: {
            iceCompleted,
            fsReady,
          },
        }, 'Audio call - check if ICE is finished and FreeSWITCH is ready');
        if (iceCompleted && fsReady) {
          this.webrtcConnected = true;
          setupRemoteMedia();

          const { sdp } = this.currentSession.sessionDescriptionHandler
            .peerConnection.remoteDescription;

          logger.info({
            logCode: 'sip_js_session_setup_remote_media',
            extraInfo: {
              callerIdName: this.user.callerIdName,
              sdp,
            },
          }, 'Audio call - setup remote media');

          this.callback({ status: this.baseCallStates.started, bridge: BRIDGE_NAME });
          resolve();
        }
      };

      // Sometimes FreeSWITCH just won't respond with anything and hangs. This timeout is to
      // avoid that issue
      const callTimeout = setTimeout(() => {
        this.callback({
          status: this.baseCallStates.failed,
          error: 1006,
          bridgeError: `Call timed out on start after ${CALL_CONNECT_TIMEOUT / 1000}s`,
          bridge: BRIDGE_NAME,
        });

        this.exitAudio();
      }, CALL_CONNECT_TIMEOUT);

      let iceNegotiationTimeout;

      const handleSessionAccepted = () => {
        logger.info({ logCode: 'sip_js_session_accepted', extraInfo: { callerIdName: this.user.callerIdName } }, 'Audio call session accepted');
        clearTimeout(callTimeout);

        // If ICE isn't connected yet then start timeout waiting for ICE to finish
        if (!iceCompleted) {
          iceNegotiationTimeout = setTimeout(() => {
            this.callback({
              status: this.baseCallStates.failed,
              error: 1010,
              bridgeError: 'ICE negotiation timeout after '
                + `${ICE_NEGOTIATION_TIMEOUT / 1000}s`,
              bridge: BRIDGE_NAME,
            });

            this.exitAudio();

            reject({
              type: this.baseErrorCodes.CONNECTION_ERROR,
            });
          }, ICE_NEGOTIATION_TIMEOUT);
        }
        checkIfCallReady();
      };

      const handleIceNegotiationFailed = (peer) => {
        if (iceCompleted) {
          logger.warn({
            logCode: 'sipjs_ice_failed_after',
            extraInfo: {
              callerIdName: this.user.callerIdName,
            },
          }, 'ICE connection failed after success');
        } else {
          logger.warn({
            logCode: 'sipjs_ice_failed_before',
            extraInfo: {
              callerIdName: this.user.callerIdName,
            },
          }, 'ICE connection failed before success');
        }
        clearTimeout(callTimeout);
        clearTimeout(iceNegotiationTimeout);
        this.callback({
          status: this.baseCallStates.failed,
          error: 1007,
          bridgeError: 'ICE negotiation failed. Current state '
            + `- ${peer.iceConnectionState}`,
          bridge: BRIDGE_NAME,
        });
      };

      const handleIceConnectionTerminated = (peer) => {
        if (!this.userRequestedHangup) {
          logger.warn({
            logCode: 'sipjs_ice_closed',
            extraInfo: {
              callerIdName: this.user.callerIdName,
            },
          }, 'ICE connection closed');
        } else return;

        this.callback({
          status: this.baseCallStates.failed,
          error: 1012,
          bridgeError: 'ICE connection closed. Current state -'
            + `${peer.iceConnectionState}`,
          bridge: BRIDGE_NAME,
        });
      };

      const handleSessionProgress = (update) => {
        logger.info({
          logCode: 'sip_js_session_progress',
          extraInfo: {
            callerIdName: this.user.callerIdName,
            update,
          },
        }, 'Audio call session progress update');

        this.currentSession.sessionDescriptionHandler.peerConnectionDelegate
          .onconnectionstatechange = (event) => {
            const peer = event.target;

            logger.info({
              logCode: 'sip_js_connection_state_change',
              extraInfo: {
                connectionStateChange: peer.connectionState,
                callerIdName: this.user.callerIdName,
              },
            }, 'ICE connection state change - Current connection state - '
            + `${peer.connectionState}`);

            switch (peer.connectionState) {
              case 'failed':
                // Chrome triggers 'failed' for connectionState event, only
                handleIceNegotiationFailed(peer);
                break;
              default:
                break;
            }
          };

        this.currentSession.sessionDescriptionHandler.peerConnectionDelegate
          .oniceconnectionstatechange = (event) => {
            const peer = event.target;

            switch (peer.iceConnectionState) {
              case 'completed':
              case 'connected':
                if (iceCompleted) {
                  logger.info({
                    logCode: 'sip_js_ice_connection_success_after_success',
                    extraInfo: {
                      currentState: peer.connectionState,
                      callerIdName: this.user.callerIdName,
                    },
                  }, 'ICE connection success, but user is already connected, '
                  + 'ignoring it...'
                  + `${peer.iceConnectionState}`);

                  return;
                }

                logger.info({
                  logCode: 'sip_js_ice_connection_success',
                  extraInfo: {
                    currentState: peer.connectionState,
                    callerIdName: this.user.callerIdName,
                  },
                }, 'ICE connection success. Current ICE Connection state - '
                + `${peer.iceConnectionState}`);

                clearTimeout(callTimeout);
                clearTimeout(iceNegotiationTimeout);

                iceCompleted = true;

                logSelectedCandidate(peer, this.protocolIsIpv6);

                checkIfCallReady();
                break;
              case 'failed':
                handleIceNegotiationFailed(peer);
                break;

              case 'closed':
                handleIceConnectionTerminated(peer);
                break;
              default:
                break;
            }
          };
      };

      const checkIfCallStopped = (message) => {
        if ((!this.ignoreCallState && fsReady) || !sessionTerminated) {
          return null;
        }

        if (!message && !!this.userRequestedHangup) {
          return this.callback({
            status: this.baseCallStates.ended,
            bridge: BRIDGE_NAME,
          });
        }

        // if session hasn't even started, we let audio-modal to handle
        // any possile errors
        if (!this._currentSessionState) return false;


        let mappedCause;
        let cause;
        if (!iceCompleted) {
          mappedCause = '1004';
          cause = 'ICE error';
        } else {
          cause = 'Audio Conference Error';
          mappedCause = '1005';
        }

        logger.warn({
          logCode: 'sip_js_call_terminated',
          extraInfo: { cause, callerIdName: this.user.callerIdName },
        }, `Audio call terminated. cause=${cause}`);

        return this.callback({
          status: this.baseCallStates.failed,
          error: mappedCause,
          bridgeError: cause,
          bridge: BRIDGE_NAME,
        });
      }

      const handleSessionTerminated = (message) => {
        logger.info({
          logCode: 'sip_js_session_terminated',
          extraInfo: { callerIdName: this.user.callerIdName },
        }, 'SIP.js session terminated');

        clearTimeout(callTimeout);
        clearTimeout(iceNegotiationTimeout);

        sessionTerminated = true;
        checkIfCallStopped();
      };

      currentSession.stateChange.addListener((state) => {
        switch (state) {
          case SIP.SessionState.Initial:
            break;
          case SIP.SessionState.Establishing:
            handleSessionProgress();
            break;
          case SIP.SessionState.Established:
            handleSessionAccepted();
            break;
          case SIP.SessionState.Terminating:
            break;
          case SIP.SessionState.Terminated:
            handleSessionTerminated();
            break;
          default:
            logger.warn({
              logCode: 'sipjs_ice_session_unknown_state',
              extraInfo: {
                callerIdName: this.user.callerIdName,
              },
            }, 'SIP.js unknown session state');
            break;
        }
        this._currentSessionState = state;
      });

      Tracker.autorun((c) => {
        const selector = {
          meetingId: Auth.meetingID,
          userId: Auth.userID,
          clientSession: getCurrentAudioSessionNumber(),
        };

        const query = VoiceCallStates.find(selector);

        query.observeChanges({
          changed: (id, fields) => {
            if (!fsReady && ((this.inEchoTest && fields.callState === CallStateOptions.IN_ECHO_TEST)
              || (!this.inEchoTest && fields.callState === CallStateOptions.IN_CONFERENCE))) {
              fsReady = true;
              checkIfCallReady();
            }

            if (fields.callState === CallStateOptions.CALL_ENDED) {
              fsReady = false;
              c.stop();
              checkIfCallStopped();
            }
          },
        });
      });

      resolve();
    });
  }

  /**
   * Filter constraints set in audioDeviceConstraints, based on
   * constants supported by browser. This avoids setting a constraint
   * unsupported by browser. In currently safari version (13+), for example,
   * setting an unsupported constraint crashes the audio.
   * @param  {Object} audioDeviceConstraints Constraints to be set
   * see: https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints
   * @return {Object}                        A new Object of the same type as
   * input, containing only the supported constraints.
   */
  filterSupportedConstraints(audioDeviceConstraints) {
    try {
      const matchConstraints = {};
      const supportedConstraints = navigator
        .mediaDevices.getSupportedConstraints() || {};
      Object.entries(audioDeviceConstraints).forEach(
        ([constraintName, constraintValue]) => {
          if (supportedConstraints[constraintName]) {
            matchConstraints[constraintName] = constraintValue;
          }
        }
      );

      return matchConstraints;
    } catch (error) {
      logger.error({
        logCode: 'sipjs_unsupported_audio_constraint_error',
        extraInfo: {
          callerIdName: this.user.callerIdName,
        },
      }, 'SIP.js unsupported constraint error');
      return {};
    }
  }

  /**
   * Update audio constraints for current local MediaStream (microphone)
   * @param  {Object}  constraints MediaTrackConstraints object. See:
   * https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints
   * @return {Promise}             A Promise for this process
   */
  async updateAudioConstraints(constraints) {
    try {
      if (typeof constraints !== 'object') return;

      logger.info({
        logCode: 'sipjs_update_audio_constraint',
        extraInfo: {
          callerIdName: this.user.callerIdName,
        },
      }, 'SIP.js updating audio constraint');

      const matchConstraints = this.filterSupportedConstraints(constraints);

      //Chromium bug - see: https://bugs.chromium.org/p/chromium/issues/detail?id=796964&q=applyConstraints&can=2
      const { isChrome } = browserInfo;

      if (isChrome) {
        matchConstraints.deviceId = this.inputDeviceId;

        const stream = await navigator.mediaDevices.getUserMedia(
          { audio: matchConstraints },
        );

        this.currentSession.sessionDescriptionHandler
          .setLocalMediaStream(stream);
      } else {
        const { localMediaStream } = this.currentSession
          .sessionDescriptionHandler;

        localMediaStream.getAudioTracks().forEach(
          track => track.applyConstraints(matchConstraints),
        );
      }
    } catch (error) {
      logger.error({
        logCode: 'sipjs_audio_constraint_error',
        extraInfo: {
          callerIdName: this.user.callerIdName,
        },
      }, 'SIP.js failed to update audio constraint');
    }
  }
}

export default class SIPBridge extends BaseAudioBridge {
  constructor(userData) {
    super(userData);

    const {
      userId,
      username,
      sessionToken,
    } = userData;

    this.user = {
      userId,
      sessionToken,
      name: username,
    };

    this.media = {
      inputDevice: {},
    };

    this.protocol = window.document.location.protocol;
    if (MEDIA['sip_ws_host'] != null && MEDIA['sip_ws_host'] != '') {
      this.hostname = MEDIA.sip_ws_host;
    } else {
      this.hostname = window.document.location.hostname;
    }

    // SDP conversion utilitary methods to be used inside SIP.js
    window.isUnifiedPlan = isUnifiedPlan;
    window.toUnifiedPlan = toUnifiedPlan;
    window.toPlanB = toPlanB;
    window.stripMDnsCandidates = stripMDnsCandidates;

    // No easy way to expose the client logger to sip.js code so we need to attach it globally
    window.clientLogger = logger;
  }

  get inputDeviceId() {
    const sessionInputDeviceId = Storage.getItem(INPUT_DEVICE_ID_KEY);

    if (sessionInputDeviceId) {
      return sessionInputDeviceId;
    }

    if (this.media.inputDeviceId) {
      return this.media.inputDeviceId;
    }

    if (this.activeSession) {
      return this.activeSession.inputDeviceId;
    }

    return DEFAULT_INPUT_DEVICE_ID;
  }

  set inputDeviceId(deviceId) {
    Storage.setItem(INPUT_DEVICE_ID_KEY, deviceId);
    this.media.inputDeviceId = deviceId;

    if (this.activeSession) {
      this.activeSession.inputDeviceId = deviceId;
    }
  }

  get outputDeviceId() {
    const sessionOutputDeviceId = Storage.getItem(OUTPUT_DEVICE_ID_KEY);
    if (sessionOutputDeviceId) {
      return sessionOutputDeviceId;
    }

    if (this.media.outputDeviceId) {
      return this.media.outputDeviceId;
    }

    if (this.activeSession) {
      return this.activeSession.outputDeviceId;
    }

    return DEFAULT_OUTPUT_DEVICE_ID;
  }

  set outputDeviceId(deviceId) {
    Storage.setItem(OUTPUT_DEVICE_ID_KEY, deviceId);
    this.media.outputDeviceId = deviceId;

    if (this.activeSession) {
      this.activeSession.outputDeviceId = deviceId;
    }
  }

  get inputStream() {
    return this.activeSession ? this.activeSession.inputStream : null;
  }

  /**
   * Wrapper for SIPSession's ignoreCallState flag
   * @param {boolean} value
   */
  set ignoreCallState(value) {
    if (this.activeSession) {
      this.activeSession.ignoreCallState = value;
    }
  }

  get ignoreCallState() {
    return this.activeSession ? this.activeSession.ignoreCallState : false;
  }

  joinAudio({ isListenOnly, extension, validIceCandidates }, managerCallback) {
    const hasFallbackDomain = typeof IPV4_FALLBACK_DOMAIN === 'string' && IPV4_FALLBACK_DOMAIN !== '';

    return new Promise((resolve, reject) => {
      let { hostname } = this;

      this.activeSession = new SIPSession(this.user, this.userData, this.protocol,
        hostname, this.baseCallStates, this.baseErrorCodes, false);

      const callback = (message) => {
        if (message.status === this.baseCallStates.failed) {
          let shouldTryReconnect = false;

          // Try and get the call to clean up and end on an error
          this.activeSession.exitAudio().catch(() => { });

          if (this.activeSession.webrtcConnected) {
            // webrtc was able to connect so just try again
            message.silenceNotifications = true;
            callback({ status: this.baseCallStates.reconnecting, bridge: BRIDGE_NAME, });
            shouldTryReconnect = true;
          } else if (hasFallbackDomain === true && hostname !== IPV4_FALLBACK_DOMAIN) {
            message.silenceNotifications = true;
            logger.info({ logCode: 'sip_js_attempt_ipv4_fallback', extraInfo: { callerIdName: this.user.callerIdName } }, 'Attempting to fallback to IPv4 domain for audio');
            hostname = IPV4_FALLBACK_DOMAIN;
            shouldTryReconnect = true;
          }

          if (shouldTryReconnect) {
            const fallbackExtension = this.activeSession.inEchoTest ? extension : undefined;
            this.activeSession = new SIPSession(this.user, this.userData, this.protocol,
              hostname, this.baseCallStates, this.baseErrorCodes, true);
            const { inputDeviceId, outputDeviceId } = this;
            this.activeSession.joinAudio({
              isListenOnly,
              extension: fallbackExtension,
              inputDeviceId,
              outputDeviceId,
              validIceCandidates,
            }, callback)
              .then((value) => {
                this.changeOutputDevice(outputDeviceId, true);
                resolve(value);
              }).catch((reason) => {
                reject(reason);
              });
          }
        }

        return managerCallback(message);
      };

      const { inputDeviceId, outputDeviceId } = this;
      this.activeSession.joinAudio({
        isListenOnly,
        extension,
        inputDeviceId,
        outputDeviceId,
        validIceCandidates,
      }, callback)
        .then((value) => {
          this.changeOutputDevice(outputDeviceId, true);
          resolve(value);
        }).catch((reason) => {
          reject(reason);
        });
    });
  }

  transferCall(onTransferSuccess) {
    return this.activeSession.transferCall(onTransferSuccess);
  }

  getPeerConnection() {
    if (!this.activeSession) return null;

    const { currentSession } = this.activeSession;
    if (currentSession && currentSession.sessionDescriptionHandler) {
      return currentSession.sessionDescriptionHandler.peerConnection;
    }
    return null;
  }

  exitAudio() {
    return this.activeSession.exitAudio();
  }

  setDefaultInputDevice() {
    this.inputDeviceId = DEFAULT_INPUT_DEVICE_ID;
  }

  async changeInputDeviceId(inputDeviceId) {
    if (!inputDeviceId) {
      throw new Error();
    }

    this.inputDeviceId = inputDeviceId;
    return inputDeviceId;
  }

  liveChangeInputDevice(deviceId) {
    this.inputDeviceId = deviceId;
    return this.activeSession.liveChangeInputDevice(deviceId);
  }

  reloadAudioElement(audioElement) {
    if (audioElement && (audioElement.readyState > 0)) {
      logger.debug({
        logCode: 'sip_js_reload_audio_element',
        extraInfo: {
          callerIdName: this.user.callerIdName,
        },
      }, 'Reloading audio element after changing output device');
      audioElement.load();
    }
  }

  async changeOutputDevice(value, isLive) {
    const audioElement = document.querySelector(MEDIA_TAG);

    if (audioElement.setSinkId) {
      try {
        if (!isLive) {
          audioElement.srcObject = null;
        }

        await audioElement.setSinkId(value);
        this.reloadAudioElement(audioElement);
        this.outputDeviceId = value;
      } catch (err) {
        logger.error({
          logCode: 'audio_sip_changeoutputdevice_error',
          extraInfo: { error: err, callerIdName: this.user.callerIdName },
        }, 'Change Output Device error');
        throw new Error(this.baseErrorCodes.MEDIA_ERROR);
      }
    }

    return this.outputDeviceId;
  }

  async updateAudioConstraints(constraints) {
    return this.activeSession.updateAudioConstraints(constraints);
  }
}

module.exports = SIPBridge;
