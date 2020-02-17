import browser from 'browser-detect';
import BaseAudioBridge from './base';
import logger from '/imports/startup/client/logger';
import { fetchStunTurnServers } from '/imports/utils/fetchStunTurnServers';
import {
  isUnifiedPlan,
  toUnifiedPlan,
  toPlanB,
  stripMDnsCandidates,
  analyzeSdp,
  logSelectedCandidate,
} from '/imports/utils/sdpUtils';

const MEDIA = Meteor.settings.public.media;
const MEDIA_TAG = MEDIA.mediaTag;
const CALL_TRANSFER_TIMEOUT = MEDIA.callTransferTimeout;
const CALL_HANGUP_TIMEOUT = MEDIA.callHangupTimeout;
const CALL_HANGUP_MAX_RETRIES = MEDIA.callHangupMaximumRetries;
const RELAY_ONLY_ON_RECONNECT = MEDIA.relayOnlyOnReconnect;
const IPV4_FALLBACK_DOMAIN = Meteor.settings.public.app.ipv4FallbackDomain;
const ICE_NEGOTIATION_FAILED = ['iceConnectionFailed'];
const CALL_CONNECT_TIMEOUT = 20000;
const ICE_NEGOTIATION_TIMEOUT = 20000;
const AUDIO_SESSION_NUM_KEY = 'AudioSessionNumber';


const getAudioSessionNumber = () => {
  let currItem = parseInt(sessionStorage.getItem(AUDIO_SESSION_NUM_KEY), 10);
  if (!currItem) {
    currItem = 0;
  }

  currItem += 1;
  sessionStorage.setItem(AUDIO_SESSION_NUM_KEY, currItem);
  return currItem;
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
  }

  static parseDTMF(message) {
    const parse = message.match(/Signal=(.)/);
    if (parse && parse.length === 2) {
      return parse[1];
    }
    return '';
  }

  joinAudio({ isListenOnly, extension, inputStream }, managerCallback) {
    return new Promise((resolve, reject) => {
      const callExtension = extension ? `${extension}${this.userData.voiceBridge}` : this.userData.voiceBridge;

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

      return this.doCall({ callExtension, isListenOnly, inputStream })
        .catch((reason) => {
          reject(reason);
        });
    });
  }

  doCall(options) {
    const {
      isListenOnly,
    } = options;

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

    return fetchStunTurnServers(sessionToken)
      .then(this.createUserAgent.bind(this))
      .then(this.inviteUserAgent.bind(this))
      .then(this.setupEventHandlers.bind(this));
  }

  transferCall(onTransferSuccess) {
    return new Promise((resolve, reject) => {
      this.inEchoTest = false;

      const timeout = setInterval(() => {
        clearInterval(timeout);
        logger.error({ logCode: 'sip_js_transfer_timed_out' }, 'Timeout on transferring from echo test to conference');
        this.callback({
          status: this.baseCallStates.failed,
          error: 1008,
          bridgeError: 'Timeout on call transfer',
        });

        this.exitAudio();

        reject(this.baseErrorCodes.REQUEST_TIMEOUT);
      }, CALL_TRANSFER_TIMEOUT);

      // This is is the call transfer code ask @chadpilkey
      this.currentSession.dtmf(1);

      this.currentSession.on('dtmf', (event) => {
        if (event.body && (typeof event.body === 'string')) {
          const key = SIPSession.parseDTMF(event.body);
          if (key === '7') {
            clearInterval(timeout);
            onTransferSuccess();
            resolve();
          }
        }
      });
    });
  }

  exitAudio() {
    return new Promise((resolve, reject) => {
      let hangupRetries = 0;
      let hangup = false;

      this.userRequestedHangup = true;

      if (this.currentSession) {
        const { mediaHandler } = this.currentSession;

        // Removing termination events to avoid triggering an error
        ICE_NEGOTIATION_FAILED.forEach(e => mediaHandler.off(e));
      }
      const tryHangup = () => {
        if ((this.currentSession && this.currentSession.endTime)
          || (this.userAgent && this.userAgent.status === SIP.UA.C.STATUS_USER_CLOSED)) {
          hangup = true;
          return resolve();
        }

        if (this.currentSession) this.currentSession.bye();
        if (this.userAgent) this.userAgent.stop();

        hangupRetries += 1;

        setTimeout(() => {
          if (hangupRetries > CALL_HANGUP_MAX_RETRIES) {
            this.callback({
              status: this.baseCallStates.failed,
              error: 1006,
              bridgeError: 'Timeout on call hangup',
            });
            return reject(this.baseErrorCodes.REQUEST_TIMEOUT);
          }

          if (!hangup) return tryHangup();
          return resolve();
        }, CALL_HANGUP_TIMEOUT);
      };

      if (this.currentSession) {
        this.currentSession.on('bye', () => {
          hangup = true;
          resolve();
        });
      }

      return tryHangup();
    });
  }

  createUserAgent({ stun, turn }) {
    return new Promise((resolve, reject) => {
      if (this.userRequestedHangup === true) reject();

      const {
        hostname,
        protocol,
      } = this;

      const {
        callerIdName,
      } = this.user;

      // WebView safari needs a transceiver to be added. Made it a SIP.js hack.
      // Don't like the UA picking though, we should straighten everything to user
      // transceivers - prlanzarin 2019/05/21
      const browserUA = window.navigator.userAgent.toLocaleLowerCase();
      const isSafariWebview = ((browserUA.indexOf('iphone') > -1
        || browserUA.indexOf('ipad') > -1) && browserUA.indexOf('safari') === -1);

      // Second UA check to get all Safari browsers to enable Unified Plan <-> PlanB
      // translation
      const isSafari = browser().name === 'safari';

      logger.debug({ logCode: 'sip_js_creating_user_agent' }, 'Creating the user agent');

      if (this.userAgent && this.userAgent.isConnected()) {
        if (this.userAgent.configuration.hostPortParams === this.hostname) {
          logger.debug({ logCode: 'sip_js_reusing_user_agent' }, 'Reusing the user agent');
          resolve(this.userAgent);
          return;
        }
        logger.debug({ logCode: 'sip_js_different_host_name' }, 'Different host name. need to kill');
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

      this.userAgent = new window.SIP.UA({
        uri: `sip:${encodeURIComponent(callerIdName)}@${hostname}`,
        wsServers: `${(protocol === 'https:' ? 'wss://' : 'ws://')}${hostname}/ws`,
        displayName: callerIdName,
        register: false,
        traceSip: true,
        autostart: false,
        userAgentString: 'BigBlueButton',
        stunServers: stun,
        turnServers: turn,
        hackPlanBUnifiedPlanTranslation: isSafari,
        hackAddAudioTransceiver: isSafariWebview,
        relayOnlyOnReconnect: this.reconnectAttempt && RELAY_ONLY_ON_RECONNECT,
        localSdpCallback,
        remoteSdpCallback,
      });

      const handleUserAgentConnection = () => {
        userAgentConnected = true;
        resolve(this.userAgent);
      };

      const handleUserAgentDisconnection = () => {
        if (this.userAgent) {
          this.userAgent.removeAllListeners();
          this.userAgent.stop();
        }

        let error;
        let bridgeError;

        if (this.userRequestedHangup) return;

        if (userAgentConnected) {
          error = 1001;
          bridgeError = 'Websocket disconnected';
        } else {
          error = 1002;
          bridgeError = 'Websocket failed to connect';
        }

        this.callback({
          status: this.baseCallStates.failed,
          error,
          bridgeError,
        });
        reject(this.baseErrorCodes.CONNECTION_ERROR);
      };

      this.userAgent.on('connected', handleUserAgentConnection);
      this.userAgent.on('disconnected', handleUserAgentDisconnection);

      this.userAgent.start();
    });
  }

  inviteUserAgent(userAgent) {
    if (this.userRequestedHangup === true) Promise.reject();

    const {
      hostname,
    } = this;

    const {
      inputStream,
      callExtension,
    } = this.callOptions;

    const options = {
      media: {
        stream: inputStream,
        constraints: {
          audio: true,
          video: false,
        },
        render: {
          remote: document.querySelector(MEDIA_TAG),
        },
      },
      RTCConstraints: {
        offerToReceiveAudio: true,
        offerToReceiveVideo: false,
      },
    };

    return userAgent.invite(`sip:${callExtension}@${hostname}`, options);
  }

  setupEventHandlers(currentSession) {
    return new Promise((resolve, reject) => {
      if (this.userRequestedHangup === true) reject();

      const { mediaHandler } = currentSession;

      let iceCompleted = false;
      let fsReady = false;

      this.currentSession = currentSession;

      let connectionCompletedEvents = ['iceConnectionCompleted', 'iceConnectionConnected'];
      // Edge sends a connected first and then a completed, but the call isn't ready until
      // the completed comes in. Due to the way that we have the listeners set up, the only
      // way to ignore one status is to not listen for it.
      if (browser().name === 'edge') {
        connectionCompletedEvents = ['iceConnectionCompleted'];
      }

      const checkIfCallReady = () => {
        if (this.userRequestedHangup === true) {
          this.exitAudio();
          resolve();
        }

        if (iceCompleted && fsReady) {
          this.webrtcConnected = true;
          this.callback({ status: this.baseCallStates.started });
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
        });

        this.exitAudio();
      }, CALL_CONNECT_TIMEOUT);

      let iceNegotiationTimeout;

      const handleSessionAccepted = () => {
        logger.info({ logCode: 'sip_js_session_accepted' }, 'Audio call session accepted');
        clearTimeout(callTimeout);
        currentSession.off('accepted', handleSessionAccepted);

        // If ICE isn't connected yet then start timeout waiting for ICE to finish
        if (!iceCompleted) {
          iceNegotiationTimeout = setTimeout(() => {
            this.callback({
              status: this.baseCallStates.failed,
              error: 1010,
              bridgeError: `ICE negotiation timeout after ${ICE_NEGOTIATION_TIMEOUT / 1000}s`,
            });

            this.exitAudio();
          }, ICE_NEGOTIATION_TIMEOUT);
        }
      };
      currentSession.on('accepted', handleSessionAccepted);

      const handleSessionProgress = (update) => {
        logger.info({ logCode: 'sip_js_session_progress' }, 'Audio call session progress update');
        clearTimeout(callTimeout);
        currentSession.off('progress', handleSessionProgress);
      };
      currentSession.on('progress', handleSessionProgress);

      const handleConnectionCompleted = (peer) => {
        logger.info({
          logCode: 'sip_js_ice_connection_success',
          extraInfo: { currentState: peer.iceConnectionState },
        }, `ICE connection success. Current state - ${peer.iceConnectionState}`);
        clearTimeout(callTimeout);
        clearTimeout(iceNegotiationTimeout);
        connectionCompletedEvents.forEach(e => mediaHandler.off(e, handleConnectionCompleted));
        iceCompleted = true;

        logSelectedCandidate(peer, this.protocolIsIpv6);

        checkIfCallReady();
      };
      connectionCompletedEvents.forEach(e => mediaHandler.on(e, handleConnectionCompleted));

      const handleSessionTerminated = (message, cause) => {
        clearTimeout(callTimeout);
        clearTimeout(iceNegotiationTimeout);
        currentSession.off('terminated', handleSessionTerminated);

        if (!message && !cause && !!this.userRequestedHangup) {
          return this.callback({
            status: this.baseCallStates.ended,
          });
        }

        logger.error({
          logCode: 'sip_js_call_terminated',
          extraInfo: { cause },
        }, `Audio call terminated. cause=${cause}`);

        let mappedCause;
        if (!iceCompleted) {
          mappedCause = '1004';
        } else {
          mappedCause = '1005';
        }

        return this.callback({
          status: this.baseCallStates.failed,
          error: mappedCause,
          bridgeError: cause,
        });
      };
      currentSession.on('terminated', handleSessionTerminated);

      const handleIceNegotiationFailed = (peer) => {
        if (iceCompleted) {
          logger.error({ logCode: 'sipjs_ice_failed_after' }, 'ICE connection failed after success');
        } else {
          logger.error({ logCode: 'sipjs_ice_failed_before' }, 'ICE connection failed before success');
        }
        clearTimeout(callTimeout);
        clearTimeout(iceNegotiationTimeout);
        ICE_NEGOTIATION_FAILED.forEach(e => mediaHandler.off(e, handleIceNegotiationFailed));
        this.callback({
          status: this.baseCallStates.failed,
          error: 1007,
          bridgeError: `ICE negotiation failed. Current state - ${peer.iceConnectionState}`,
        });
      };
      ICE_NEGOTIATION_FAILED.forEach(e => mediaHandler.on(e, handleIceNegotiationFailed));

      const handleIceConnectionTerminated = (peer) => {
        ['iceConnectionClosed'].forEach(e => mediaHandler.off(e, handleIceConnectionTerminated));
        if (!this.userRequestedHangup) {
          logger.error({ logCode: 'sipjs_ice_closed' }, 'ICE connection closed');
        }
        /*
        this.callback({
          status: this.baseCallStates.failed,
          error: 1012,
          bridgeError: "ICE connection closed. Current state - " + peer.iceConnectionState,
        });
        */
      };
      ['iceConnectionClosed'].forEach(e => mediaHandler.on(e, handleIceConnectionTerminated));

      const inEchoDTMF = (event) => {
        if (event.body && typeof event.body === 'string') {
          const dtmf = SIPSession.parseDTMF(event.body);
          if (dtmf === '0') {
            fsReady = true;
            checkIfCallReady();
          }
        }
        currentSession.off('dtmf', inEchoDTMF);
      };
      currentSession.on('dtmf', inEchoDTMF);
    });
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
    this.hostname = window.document.location.hostname;

    // SDP conversion utilitary methods to be used inside SIP.js
    window.isUnifiedPlan = isUnifiedPlan;
    window.toUnifiedPlan = toUnifiedPlan;
    window.toPlanB = toPlanB;
    window.stripMDnsCandidates = stripMDnsCandidates;
  }

  joinAudio({ isListenOnly, extension, inputStream }, managerCallback) {
    const hasFallbackDomain = typeof IPV4_FALLBACK_DOMAIN === 'string' && IPV4_FALLBACK_DOMAIN !== '';

    return new Promise((resolve, reject) => {
      let { hostname } = this;

      this.activeSession = new SIPSession(this.user, this.userData, this.protocol,
        hostname, this.baseCallStates, this.baseErrorCodes, false);

      const callback = (message) => {
        if (message.status === this.baseCallStates.failed) {
          let shouldTryReconnect = false;

          // Try and get the call to clean up and end on an error
          this.activeSession.exitAudio().catch(() => {});

          if (this.activeSession.webrtcConnected) {
            // webrtc was able to connect so just try again
            message.silenceNotifications = true;
            callback({ status: this.baseCallStates.reconnecting });
            shouldTryReconnect = true;
          } else if (hasFallbackDomain === true && hostname !== IPV4_FALLBACK_DOMAIN) {
            message.silenceNotifications = true;
            logger.info({ logCode: 'sip_js_attempt_ipv4_fallback' }, 'Attempting to fallback to IPv4 domain for audio');
            hostname = IPV4_FALLBACK_DOMAIN;
            shouldTryReconnect = true;
          }

          if (shouldTryReconnect) {
            const fallbackExtension = this.activeSession.inEchoTest ? extension : undefined;
            this.activeSession = new SIPSession(this.user, this.userData, this.protocol,
              hostname, this.baseCallStates, this.baseErrorCodes, true);
            this.activeSession.joinAudio({ isListenOnly, extension: fallbackExtension, inputStream }, callback)
              .then((value) => {
                resolve(value);
              }).catch((reason) => {
                reject(reason);
              });
          }
        }

        return managerCallback(message);
      };

      this.activeSession.joinAudio({ isListenOnly, extension, inputStream }, callback)
        .then((value) => {
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
    const { currentSession } = this.activeSession;
    if (currentSession && currentSession.mediaHandler) {
      return currentSession.mediaHandler.peerConnection;
    }
    return null;
  }

  exitAudio() {
    return this.activeSession.exitAudio();
  }

  setDefaultInputDevice() {
    const handleMediaSuccess = (mediaStream) => {
      const deviceLabel = mediaStream.getAudioTracks()[0].label;
      window.defaultInputStream = mediaStream.getTracks();
      return navigator.mediaDevices.enumerateDevices().then((mediaDevices) => {
        const device = mediaDevices.find(d => d.label === deviceLabel);
        return this.changeInputDevice(device.deviceId, deviceLabel);
      });
    };

    return navigator.mediaDevices.getUserMedia({ audio: true }).then(handleMediaSuccess);
  }

  changeInputDevice(deviceId, deviceLabel) {
    const {
      media,
    } = this;
    if (media.inputDevice.audioContext) {
      const handleAudioContextCloseSuccess = () => {
        media.inputDevice.audioContext = null;
        media.inputDevice.scriptProcessor = null;
        media.inputDevice.source = null;
        return this.changeInputDevice(deviceId);
      };

      return media.inputDevice.audioContext.close().then(handleAudioContextCloseSuccess);
    }

    if ('AudioContext' in window) {
      media.inputDevice.audioContext = new window.AudioContext();
    } else {
      media.inputDevice.audioContext = new window.webkitAudioContext();
    }

    media.inputDevice.id = deviceId;
    media.inputDevice.label = deviceLabel;
    media.inputDevice.scriptProcessor = media.inputDevice.audioContext
      .createScriptProcessor(2048, 1, 1);
    media.inputDevice.source = null;

    const constraints = {
      audio: {
        deviceId,
      },
    };

    const handleMediaSuccess = (mediaStream) => {
      media.inputDevice.stream = mediaStream;
      media.inputDevice.source = media.inputDevice.audioContext
        .createMediaStreamSource(mediaStream);
      media.inputDevice.source.connect(media.inputDevice.scriptProcessor);
      media.inputDevice.scriptProcessor.connect(media.inputDevice.audioContext.destination);

      return this.media.inputDevice;
    };

    return navigator.mediaDevices.getUserMedia(constraints).then(handleMediaSuccess);
  }

  async changeOutputDevice(value) {
    const audioContext = document.querySelector(MEDIA_TAG);

    if (audioContext.setSinkId) {
      try {
        audioContext.srcObject = null;
        await audioContext.setSinkId(value);
        this.media.outputDeviceId = value;
      } catch (err) {
        logger.error({
          logCode: 'audio_sip_changeoutputdevice_error',
          extraInfo: { error: err },
        }, 'Change Output Device error');
        throw new Error(this.baseErrorCodes.MEDIA_ERROR);
      }
    }

    return this.media.outputDeviceId || value;
  }
}
