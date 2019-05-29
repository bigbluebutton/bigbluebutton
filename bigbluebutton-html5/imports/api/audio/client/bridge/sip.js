import browser from 'browser-detect';
import BaseAudioBridge from './base';
import logger from '/imports/startup/client/logger';
import { fetchStunTurnServers } from '/imports/utils/fetchStunTurnServers';
import { isUnifiedPlan, toUnifiedPlan, toPlanB} from '/imports/utils/sdpUtils';

const MEDIA = Meteor.settings.public.media;
const MEDIA_TAG = MEDIA.mediaTag;
const CALL_TRANSFER_TIMEOUT = MEDIA.callTransferTimeout;
const CALL_HANGUP_TIMEOUT = MEDIA.callHangupTimeout;
const CALL_HANGUP_MAX_RETRIES = MEDIA.callHangupMaximumRetries;
const ICE_NEGOTIATION_FAILED = ['iceConnectionFailed'];
const CALL_CONNECT_TIMEOUT = 15000;
const ICE_NEGOTIATION_TIMEOUT = 20000;

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
        managerCallback(message).then(resolve);
      };

      this.callback = callback;

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
      userId,
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
      const timeout = setInterval(() => {
        clearInterval(timeout);
        logger.error({ logCode: 'sip_js_transfer_timed_out' }, 'Timeout on transfering from echo test to conference');
        this.callback({
          status: this.baseCallStates.failed,
          error: 1008,
          bridgeError: 'Timeout on call transfer',
        });
        reject(this.baseErrorCodes.REQUEST_TIMEOUT);
      }, CALL_TRANSFER_TIMEOUT);

      // This is is the call transfer code ask @chadpilkey
      this.currentSession.dtmf(1);

      this.currentSession.on('dtmf', (event) => {
        if (event.body && (typeof event.body === 'string')) {
          const key = SIPBridge.parseDTMF(event.body);
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
      const { mediaHandler } = this.currentSession;

      this.userRequestedHangup = true;
      // Removing termination events to avoid triggering an error
      ICE_NEGOTIATION_FAILED.forEach(e => mediaHandler.off(e));
      const tryHangup = () => {
        if (this.currentSession.endTime) {
          hangup = true;
          return resolve();
        }

        this.currentSession.bye();
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

      this.currentSession.on('bye', () => {
        hangup = true;
        resolve();
      });

      return tryHangup();
    });
  }

  createUserAgent({ stun, turn }) {
    return new Promise((resolve, reject) => {
      const {
        hostname,
        protocol,
      } = this;

      const {
        callerIdName,
      } = this.user;

      let userAgentConnected = false;

      // WebView safari needs a transceiver to be added. Made it a SIP.js hack.
      // Don't like the UA picking though, we should straighten everything to user
      // transceivers - prlanzarin 2019/05/21
      const browserUA = window.navigator.userAgent.toLocaleLowerCase();
      const isSafariWebview = ((browserUA.indexOf('iphone') > -1
        || browserUA.indexOf('ipad') > -1) && browserUA.indexOf('safari') == -1);

      // Second UA check to get all Safari browsers to enable Unified Plan <-> PlanB
      // translation
      const isSafari = browser().name === 'safari';

      logger.debug('Creating the user agent');

      let userAgent = new window.SIP.UA({
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
      });

      userAgent.removeAllListeners('connected');
      userAgent.removeAllListeners('disconnected');

      const handleUserAgentConnection = () => {
        userAgentConnected = true;
        resolve(userAgent);
      };

      const handleUserAgentDisconnection = () => {
        userAgent.stop();
        userAgent = null;

        let error;
        let bridgeError;

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

      userAgent.on('connected', handleUserAgentConnection);
      userAgent.on('disconnected', handleUserAgentDisconnection);

      userAgent.start();
    });
  }

  inviteUserAgent(userAgent) {
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
    return new Promise((resolve) => {
      const { mediaHandler } = currentSession;

      this.connectionCompleted = false;
      this.inEcho = false;

      let connectionCompletedEvents = ['iceConnectionCompleted', 'iceConnectionConnected'];
      // Edge sends a connected first and then a completed, but the call isn't ready until
      // the completed comes in. Due to the way that we have the listeners set up, the only
      // way to ignore one status is to not listen for it.
      if (browser().name === 'edge') {
        connectionCompletedEvents = ['iceConnectionCompleted'];
      }

      const checkIfCallReady = () => {
        if (this.connectionCompleted && this.inEcho) {
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
      }, CALL_CONNECT_TIMEOUT);

      let iceNegotiationTimeout;

      const handleSessionAccepted = () => {
        logger.info({ logCode: 'sip_js_session_accepted' }, 'Audio call session accepted');
        clearTimeout(callTimeout);

        // If ICE isn't connected yet then start timeout waiting for ICE to finish
        if (!this.connectionCompleted) {
          iceNegotiationTimeout = setTimeout(() => {
            this.callback({
              status: this.baseCallStates.failed,
              error: 1010,
              bridgeError: `ICE negotiation timeout after ${ICE_NEGOTIATION_TIMEOUT / 1000}s`,
            });
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
        logger.info({ logCode: 'sip_js_ice_connection_success' }, `ICE connection success. Current state - ${peer.iceConnectionState}`);
        clearTimeout(callTimeout);
        clearTimeout(iceNegotiationTimeout);
        connectionCompletedEvents.forEach(e => mediaHandler.off(e, handleConnectionCompleted));
        this.connectionCompleted = true;

        checkIfCallReady();
      };
      connectionCompletedEvents.forEach(e => mediaHandler.on(e, handleConnectionCompleted));

      const handleSessionTerminated = (message, cause) => {
        clearTimeout(callTimeout);
        clearTimeout(iceNegotiationTimeout);
        if (!message && !cause && !!this.userRequestedHangup) {
          return this.callback({
            status: this.baseCallStates.ended,
          });
        }

        logger.error({ logCode: 'sip_js_call_terminated' }, `Audio call terminated. cause=${cause}`);

        let mappedCause;
        if (!this.connectionCompleted) {
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
        if (this.connectionCompleted) {
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
          const dtmf = SIPBridge.parseDTMF(event.body);
          if (dtmf === '0') {
            this.inEcho = true;
            checkIfCallReady();
          }
        }
        currentSession.off('dtmf', inEchoDTMF);
      };
      currentSession.on('dtmf', inEchoDTMF);

      this.currentSession = currentSession;
    });
  }

  setDefaultInputDevice() {
    const handleMediaSuccess = (mediaStream) => {
      const deviceLabel = mediaStream.getAudioTracks()[0].label;
      window.defaultInputStream = mediaStream.getTracks();
      return navigator.mediaDevices.enumerateDevices().then((mediaDevices) => {
        const device = mediaDevices.find(d => d.label === deviceLabel);
        return this.changeInputDevice(device.deviceId);
      });
    };

    return navigator.mediaDevices.getUserMedia({ audio: true }).then(handleMediaSuccess);
  }

  changeInputDevice(value) {
    const {
      media,
    } = this;

    if (media.inputDevice.audioContext) {
      const handleAudioContextCloseSuccess = () => {
        media.inputDevice.audioContext = null;
        media.inputDevice.scriptProcessor = null;
        media.inputDevice.source = null;
        return this.changeInputDevice(value);
      };

      return media.inputDevice.audioContext.close().then(handleAudioContextCloseSuccess);
    }

    if ('AudioContext' in window) {
      media.inputDevice.audioContext = new window.AudioContext();
    } else {
      media.inputDevice.audioContext = new window.webkitAudioContext();
    }

    media.inputDevice.id = value;
    media.inputDevice.scriptProcessor = media.inputDevice.audioContext
      .createScriptProcessor(2048, 1, 1);
    media.inputDevice.source = null;

    const constraints = {
      audio: {
        deviceId: value,
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
        logger.error({ logCode: 'audio_sip_changeoutputdevice_error' }, err);
        throw new Error(this.baseErrorCodes.MEDIA_ERROR);
      }
    }

    return this.media.outputDeviceId || value;
  }
}
