import _ from 'lodash';
import VoiceUsers from '/imports/api/voice-users';
import { Tracker } from 'meteor/tracker';
import BaseAudioBridge from './base';

const MEDIA = Meteor.settings.public.media;
const STUN_TURN_FETCH_URL = MEDIA.stunTurnServersFetchAddress;
const MEDIA_TAG = MEDIA.mediaTag;
const CALL_TRANSFER_TIMEOUT = MEDIA.callTransferTimeout;
const CALL_HANGUP_TIMEOUT = MEDIA.callHangupTimeout;
const CALL_HANGUP_MAX_RETRIES = MEDIA.callHangupMaximumRetries;
const CONNECTION_TERMINATED_EVENTS = ['iceConnectionFailed', 'iceConnectionClosed'];

const fetchStunTurnServers = (sessionToken) => {
  const handleStunTurnResponse = ({ stunServers, turnServers }) => {
    if (!stunServers && !turnServers) {
      return { error: 404, stun: [], turn: [] };
    }

    const turnReply = [];
    _.each(turnServers, (turnEntry) => {
      const { password, url, username } = turnEntry;
      turnReply.push({
        urls: url,
        password,
        username,
      });
    });

    return {
      stun: stunServers.map(server => server.url),
      turn: turnReply,
    };
  };

  const url = `${STUN_TURN_FETCH_URL}?sessionToken=${sessionToken}`;
  return fetch(url, { credentials: 'same-origin' })
    .then(res => res.json())
    .then(handleStunTurnResponse)
    .then((response) => {
      if (response.error) {
        return Promise.reject('Could not fetch the stuns/turns servers!');
      }
      return response;
    });
};


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

    const {
      causes,
    } = window.SIP.C;

    this.errorCodes = {
      [causes.REQUEST_TIMEOUT]: this.baseErrorCodes.REQUEST_TIMEOUT,
      [causes.INVALID_TARGET]: this.baseErrorCodes.INVALID_TARGET,
      [causes.CONNECTION_ERROR]: this.baseErrorCodes.CONNECTION_ERROR,
      [causes.WEBRTC_NOT_SUPPORTED]: this.baseErrorCodes.WEBRTC_NOT_SUPPORTED,
    };
    this.webRtcError = {
      1001: '1001',
      1002: '1002',
      1003: '1003',
      1004: '1004',
      1005: '1005',
      1006: '1006',
      1007: '1007',
      1008: '1008',
      1009: '1009',
      1010: '1010',
      1011: '1011',
    };
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
          callback({
            status: this.baseCallStates.failed,
            error: this.baseErrorCodes.GENERIC_ERROR,
            bridgeError: reason,
          });
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
    ].join('-');

    this.user.callerIdName = callerIdName;
    this.callOptions = options;

    return fetchStunTurnServers(sessionToken)
      .then(this.createUserAgent.bind(this))
      .then(this.inviteUserAgent.bind(this))
      .then(this.setupEventHandlers.bind(this));
  }

  transferCall(onTransferSuccess) {
    return new Promise((resolve, reject) => {
      let trackerControl = null;

      const timeout = setTimeout(() => {
        clearTimeout(timeout);
        trackerControl.stop();
        this.callback({
          status: this.baseCallStates.failed,
          error: this.baseErrorCodes.REQUEST_TIMEOUT,
          bridgeError: 'Timeout on call transfer',
        });
        reject(this.baseErrorCodes.REQUEST_TIMEOUT);
      }, CALL_TRANSFER_TIMEOUT);

      // This is is the call transfer code ask @chadpilkey
      this.currentSession.dtmf(1);

      Tracker.autorun((c) => {
        trackerControl = c;
        const selector = { meetingId: this.userData.meetingId, intId: this.userData.userId };
        const query = VoiceUsers.find(selector);

        query.observeChanges({
          changed: (id, fields) => {
            if (fields.joined) {
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

  exitAudio() {
    return new Promise((resolve, reject) => {
      let hangupRetries = 0;
      let hangup = false;
      const { mediaHandler } = this.currentSession;

      // Removing termination events to avoid triggering an error
      CONNECTION_TERMINATED_EVENTS.forEach(e => mediaHandler.off(e));
      const tryHangup = () => {
        this.currentSession.bye();
        hangupRetries += 1;

        setTimeout(() => {
          if (hangupRetries > CALL_HANGUP_MAX_RETRIES) {
            this.callback({
              status: this.baseCallStates.failed,
              error: this.baseErrorCodes.REQUEST_TIMEOUT,
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

      let userAgent = new window.SIP.UA({
        uri: `sip:${encodeURIComponent(callerIdName)}@${hostname}`,
        wsServers: `${(protocol === 'https:' ? 'wss://' : 'ws://')}${hostname}/ws`,
        log: {
          builtinEnabled: false,
        },
        displayName: callerIdName,
        register: false,
        traceSip: true,
        autostart: false,
        userAgentString: 'BigBlueButton',
        stunServers: stun,
        turnServers: turn,
      });

      userAgent.removeAllListeners('connected');
      userAgent.removeAllListeners('disconnected');

      const handleUserAgentConnection = () => {
        resolve(userAgent);
      };

      const handleUserAgentDisconnection = (event) => {
        userAgent.stop();
        userAgent = null;
        const { lastTransportError } = event.transport;
        const errorCode = lastTransportError.code;
        const error = this.webRtcError[errorCode] || this.baseErrorCodes.CONNECTION_ERROR;
        this.callback({
          status: this.baseCallStates.failed,
          error,
          bridgeError: 'User Agent Disconnected',
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
        mandatory: {
          OfferToReceiveAudio: true,
          OfferToReceiveVideo: false,
        },
      },
    };

    return userAgent.invite(`sip:${callExtension}@${hostname}`, options);
  }

  setupEventHandlers(currentSession) {
    return new Promise((resolve) => {
      const { mediaHandler } = currentSession;

      const connectionCompletedEvents = ['iceConnectionCompleted', 'iceConnectionConnected'];
      const handleConnectionCompleted = () => {
        connectionCompletedEvents.forEach(e => mediaHandler.off(e, handleConnectionCompleted));
        this.callback({ status: this.baseCallStates.started });
        this.connectionCompleted = true;
        resolve();
      };
      connectionCompletedEvents.forEach(e => mediaHandler.on(e, handleConnectionCompleted));

      const handleSessionTerminated = (message, cause) => {
        if (!message && !cause) {
          return this.callback({
            status: this.baseCallStates.ended,
          });
        }

        const mappedCause = cause in this.errorCodes ?
          this.errorCodes[cause] :
          this.baseErrorCodes.GENERIC_ERROR;

        return this.callback({
          status: this.baseCallStates.failed,
          error: mappedCause,
          bridgeError: cause,
        });
      };
      currentSession.on('terminated', handleSessionTerminated);

      const handleConnectionTerminated = (peer) => {
        CONNECTION_TERMINATED_EVENTS.forEach(e => mediaHandler.off(e, handleConnectionTerminated));
        this.callback({
          status: this.baseCallStates.failed,
          error: this.baseErrorCodes.ICE_NEGOTIATION_FAILED,
          bridgeError: peer,
        });
      };
      CONNECTION_TERMINATED_EVENTS.forEach(e => mediaHandler.on(e, handleConnectionTerminated));

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
        await audioContext.setSinkId(value);
        this.media.outputDeviceId = value;
      } catch (err) {
        console.error(err);
        throw new Error(this.baseErrorCodes.MEDIA_ERROR);
      }
    }

    return this.media.outputDeviceId || value;
  }
}
