import VoiceUsers from '/imports/api/voice-users';
import { Tracker } from 'meteor/tracker';
import BaseAudioBridge from './base';

const MEDIA = Meteor.settings.public.media;
const STUN_TURN_FETCH_URL = MEDIA.stunTurnServersFetchAddress;
const MEDIA_TAG = MEDIA.mediaTag;
const CALL_TRANSFER_TIMEOUT = MEDIA.callTransferTimeout;

const fetchStunTurnServers = sessionToken =>
  new Promise(async (resolve, reject) => {
    const handleStunTurnResponse = ({ stunServers, turnServers }) => {
      if (!stunServers && !turnServers) {
        return { error: 404, stun: [], turn: [] };
      }
      return {
        stun: stunServers.map(server => server.url),
        turn: turnServers.map(server => server.url),
      };
    };

    const url = `${STUN_TURN_FETCH_URL}?sessionToken=${sessionToken}`;
    const response = await fetch(url)
      .then(res => res.json())
      .then(handleStunTurnResponse);

    if (response.error) return reject('Could not fetch the stuns/turns servers!');
    return resolve(response);
  });

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
    const causes = window.SIP.C.causes;
    this.errorCodes = {
      [causes.REQUEST_TIMEOUT]: this.baseErrorCodes.REQUEST_TIMEOUT,
      [causes.INVALID_TARGET]: this.baseErrorCodes.INVALID_TARGET,
      [causes.CONNECTION_ERROR]: this.baseErrorCodes.CONNECTION_ERROR,
    };
  }

  joinAudio({ isListenOnly, extension, inputStream }, managerCallback) {
    return new Promise((resolve, reject) => {
      const callExtension = extension ? `${extension}${this.userData.voiceBridge}` : this.userData.voiceBridge;

      const callback = (message) => {
        managerCallback(message).then(resolve);
      };

      this.callback = callback;

      return this.doCall({ callExtension, isListenOnly, inputStream }, callback)
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
          bridgeError: 'Timeout on call transfer' });
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
    return new Promise((resolve) => {
      this.currentSession.on('bye', () => {
        resolve();
      });
      this.currentSession.bye();
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

      const handleUserAgentDisconnection = () => {
        userAgent.stop();
        userAgent = null;
        this.callback({
          status: this.baseCallStates.failed,
          error: this.baseErrorCodes.CONNECTION_ERROR,
          bridgeError: 'User Agent Disconnected' });
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
      const handleConnectionCompleted = () => {
        this.callback({ status: this.baseCallStates.started });
        resolve();
      };

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
      currentSession.mediaHandler.on('iceConnectionCompleted', handleConnectionCompleted);
      currentSession.mediaHandler.on('iceConnectsionConnected', handleConnectionCompleted);

      this.currentSession = currentSession;
    });
  }

  async changeInputDevice(value) {
    const {
      media,
    } = this;

    const getMediaStream = constraints =>
      navigator.mediaDevices.getUserMedia(constraints);

    if (!value) {
      const mediaStream = await getMediaStream({ audio: true });
      const deviceLabel = mediaStream.getAudioTracks()[0].label;
      const mediaDevices = await navigator.mediaDevices.enumerateDevices();
      const device = mediaDevices.find(d => d.label === deviceLabel);
      return this.changeInputDevice(device.deviceId);
    }

    if (media.inputDevice.audioContext) {
      media.inputDevice.audioContext.close().then(() => {
        media.inputDevice.audioContext = null;
        media.inputDevice.scriptProcessor = null;
        media.inputDevice.source = null;
        return this.changeInputDevice(value);
      });
    }

    media.inputDevice.id = value;
    if ('AudioContext' in window) {
      media.inputDevice.audioContext = new window.AudioContext();
    } else {
      media.inputDevice.audioContext = new window.webkitAudioContext();
    }
    media.inputDevice.scriptProcessor = media.inputDevice.audioContext
                                              .createScriptProcessor(2048, 1, 1);
    media.inputDevice.source = null;

    const constraints = {
      audio: {
        deviceId: value,
      },
    };

    const mediaStream = await getMediaStream(constraints);
    media.inputDevice.stream = mediaStream;
    media.inputDevice.source = media.inputDevice.audioContext.createMediaStreamSource(mediaStream);
    media.inputDevice.source.connect(media.inputDevice.scriptProcessor);
    media.inputDevice.scriptProcessor.connect(media.inputDevice.audioContext.destination);

    return this.media.inputDevice;
  }

  changeOutputDevice(value) {
    const audioContext = document.querySelector(MEDIA_TAG);

    if (audioContext.setSinkId) {
      audioContext.setSinkId(value);
      this.media.outputDeviceId = value;
    }

    return value;
  }
}
