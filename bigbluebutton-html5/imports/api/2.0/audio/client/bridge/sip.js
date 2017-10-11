import BaseAudioBridge from './base';

const STUN_TURN_FETCH_URL = Meteor.settings.public.media.stunTurnServersFetchAddress;
const MEDIA_TAG = Meteor.settings.public.media.mediaTag;

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
    console.log('FETCHSTUNTURN');
    const url = `${STUN_TURN_FETCH_URL}?sessionToken=${sessionToken}`;

    const response = await fetch(url)
      .then(res => res.json())
      .then(json => handleStunTurnResponse(json));

    if (response.error) return reject('Could not fetch the stuns/turns servers!');
    return resolve(response);
  });

const inviteUserAgent = (voiceBridge, server, userAgent, inputStream) => {
  console.log('INVITEUSERAGENT');
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

  console.log(voiceBridge, server, userAgent);
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
      const callExtension = extension || this.userData.voiceBridge;

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
    console.log('CREATEUSERAGENT');
    return new Promise((resolve, reject) => {
      const protocol = document.location.protocol;
      console.log('username', username);
      this.userAgent = new window.SIP.UA({
        uri: `sip:${encodeURIComponent(username)}@${server}`,
        wsServers: `${(protocol === 'https:' ? 'wss://' : 'ws://')}${server}/ws`,
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
    console.log('CONNECTED');
    this.isConnected = true;
    resolve(this.userAgent);
  }

  handleUserAgentDisconnection(reject) {
    this.userAgent.stop();
    this.userAgent = null;
    this.callback({ status: this.baseCallStates.failed,
                    error: this.baseErrorCodes.GENERIC_ERROR,
                    bridgeError: 'User Agent' });
    console.log('DISCONNECTED');
    reject('CONNECTION_ERROR');
  }

  setupEventHandlers(currentSession, callback) {
    return new Promise(() => {
      console.log('SETUPEVENTHANDLERS');

      currentSession.on('terminated', (message, cause) => this.handleSessionTerminated(message, cause, callback));

      currentSession.mediaHandler.on('iceConnectionCompleted', () => this.handleConnectionCompleted(callback));
      currentSession.mediaHandler.on('iceConnectionConnected', () => this.handleConnectionCompleted(callback));

      this.currentSession = currentSession;
    });
  }

  handleConnectionCompleted(callback) {
    console.log('handleConnectionCompleted');
    this.hangup = false;
    callback({ status: this.baseCallStates.started });
    Promise.resolve();
  }

  handleSessionTerminated(message, cause, callback) {
    console.log('TERMINATED', message, cause);
    if (!message && !cause) {
      return callback({ status: this.baseCallStates.ended });
    }

    const mappedCause = cause in this.errorCodes ?
                        this.errorCodes[cause] :
                        this.baseErrorCodes.GENERIC_ERROR;

    return callback({ status: this.baseCallStates.failed, error: mappedCause, bridgeError: cause });
  }
}
