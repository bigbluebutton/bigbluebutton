import VoiceUsers from '/imports/api/2.0/voice-users';
import { Tracker } from 'meteor/tracker';
import BaseAudioBridge from './base';

const STUN_TURN_FETCH_URL = Meteor.settings.public.media.stunTurnServersFetchAddress;
const MEDIA_TAG = Meteor.settings.public.media.mediaTag;
const CALL_TRANSFER_TIMEOUT = Meteor.settings.public.media.callTransferTimeout;

const handleStunTurnResponse = ({ result, stunServers, turnServers }) =>
  new Promise((resolve) => {
    if (result) {
      resolve({ error: 404, stun: [], turn: [] });
    }
    resolve({
      stun: stunServers.map(server => server.url),
      turn: turnServers.map(server => server.url),
    });
  });

const fetchStunTurnServers = sessionToken =>
  new Promise(async (resolve, reject) => {
    const url = `${STUN_TURN_FETCH_URL}?sessionToken=${sessionToken}`;

    const response = await fetch(url)
      .then(res => res.json())
      .then(json => handleStunTurnResponse(json));

    if (response.error) return reject('Could not fetch the stuns/turns servers!');
    return resolve(response);
  });

const inviteUserAgent = (voiceBridge, server, userAgent, inputStream) => {
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

  return userAgent.invite(`sip:${voiceBridge}@${server}`, options);
};

export default class SIPBridge extends BaseAudioBridge {
  constructor(userData) {
    super(userData);
    this.isConnected = false;

    this.errorCodes = {
      'Request Timeout': this.baseErrorCodes.REQUEST_TIMEOUT,
      'Invalid Target': this.baseErrorCodes.INVALID_TARGET,
      'Connection Error': this.baseErrorCodes.CONNECTION_ERROR,
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
                   callback({ status: this.baseCallStates.failed, error: reason });
                   reject(reason);
                 });
    });
  }

  transferCall(onTransferStart, onTransferSuccess) {
    return new Promise((resolve, reject) => {
      onTransferStart();
      this.currentSession.dtmf(1);
      let trackerControl = null;
      Tracker.autorun((c) => {
        trackerControl = c;
        const selector = { meetingId: this.userData.meetingId, intId: this.userData.userId };
        const query = VoiceUsers.find(selector);
        window.Kappa = query;

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

      const timeout = setTimeout(() => {
        clearTimeout(timeout);
        trackerControl.stop();
        this.callback({
          status: this.baseCallStates.failed,
          error: this.baseErrorCodes.REQUEST_TIMEOUT,
          bridgeError: 'Could not transfer the call' });
        reject('Call transfer timeout');
      }, CALL_TRANSFER_TIMEOUT);
    });
  }

  exitAudio() {
    return new Promise((resolve) => {
      this.currentSession.on('bye', () => {
        this.hangup = true;
        resolve();
      });
      this.currentSession.bye();
    });
  }

  doCall({ isListenOnly, callExtension, inputStream }, callback) {
    const {
      userId,
      username,
      sessionToken,
    } = this.userData;

    const server = window.document.location.hostname;
    const callerIdName = `${userId}-bbbID-${username}`;

    return fetchStunTurnServers(sessionToken)
                        .then(stunTurnServers =>
                          this.createUserAgent(server, callerIdName, stunTurnServers))
                        .then(userAgent =>
                          inviteUserAgent(callExtension, server, userAgent, inputStream))
                        .then(currentSession =>
                          this.setupEventHandlers(currentSession, callback));
  }

  createUserAgent(server, username, { stun, turn }) {
    return new Promise((resolve, reject) => {
      const protocol = document.location.protocol;
      this.userAgent = new window.SIP.UA({
        uri: `sip:${encodeURIComponent(username)}@${server}`,
        wsServers: `${(protocol === 'https:' ? 'wss://' : 'ws://')}${server}/ws`,
        log: {
          builtinEnabled: false,
        },
        displayName: username,
        register: false,
        traceSip: true,
        autostart: false,
        userAgentString: 'BigBlueButton',
        stunServers: stun,
        turnServers: turn,
      });

      this.userAgent.removeAllListeners('connected');
      this.userAgent.removeAllListeners('disconnected');

      this.userAgent.on('connected', () => this.handleUserAgentConnection(resolve));
      this.userAgent.on('disconnected', () => this.handleUserAgentDisconnection(reject));

      this.userAgent.start();
    });
  }

  handleUserAgentConnection(resolve) {
    this.isConnected = true;
    resolve(this.userAgent);
  }

  handleUserAgentDisconnection(reject) {
    this.userAgent.stop();
    this.userAgent = null;
    this.callback({
      status: this.baseCallStates.failed,
      error: this.baseErrorCodes.GENERIC_ERROR,
      bridgeError: 'User Agent' });
    reject('CONNECTION_ERROR');
  }

  setupEventHandlers(currentSession, callback) {
    return new Promise(() => {
      currentSession.on('terminated', (message, cause) => this.handleSessionTerminated(message, cause, callback));

      currentSession.mediaHandler.on('iceConnectionCompleted', () => this.handleConnectionCompleted(callback));
      currentSession.mediaHandler.on('iceConnectionConnected', () => this.handleConnectionCompleted(callback));

      this.currentSession = currentSession;
    });
  }

  handleConnectionCompleted(callback) {
    this.hangup = false;
    callback({ status: this.baseCallStates.started });
    Promise.resolve();
  }

  handleSessionTerminated(message, cause, callback) {
    if (!message && !cause) {
      return callback({ status: this.baseCallStates.ended });
    }

    const mappedCause = cause in this.errorCodes ?
                        this.errorCodes[cause] :
                        this.baseErrorCodes.GENERIC_ERROR;

    return callback({ status: this.baseCallStates.failed, error: mappedCause, bridgeError: cause });
  }
}
