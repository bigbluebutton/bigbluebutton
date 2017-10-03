import BaseAudioBridge from './base';

const RETRY_INTERVAL = Meteor.settings.public.media.WebRTCHangupRetryInterval;

export default class SIPBridge extends BaseAudioBridge {
  constructor(userData) {
    super();
    this.userData = userData;

    console.log('userdata', userData);
    this.isConnected = false;
    this.callStates = {
      callStarted: 'iceConnectionCompleted',
      callEnded: 'bye',
      callDisconnected: 'failed',
    };
  }

  joinAudio({ isListenOnly, extension, inputStream }, managerCallback) {
    return new Promise((resolve) => {
      extension = extension || this.userData.voiceBridge;

      const callback = (message) => {
        managerCallback(message).then(() => resolve());
      };

      this.makeCall({ extension, isListenOnly, inputStream }, callback);
    });
  }

  exitAudio() {
    return new Promise((resolve) => {
      const attemptHangup = () => {
        if (this.isConnected) {
          console.log('Attempting to hangup on WebRTC call');
          window.webrtc_hangup(() => resolve());
        } else {
          console.log('RETRYING hangup on WebRTC call in ' +
            `${RETRY_INTERVAL} ms`);
          setTimeout(attemptHangup, RETRY_INTERVAL);
        }
      };

      return attemptHangup();
    });
  }

  makeCall({ isListenOnly, extension, inputStream }, callback) {
    const {
      userId,
      username,
      sessionToken,
    } = this.userData;

    const server = window.document.location.hostname;
    const callerIdName = `${userId}-bbbID-${username}`;

    return this.fetchStunTurnServers(sessionToken)
                        .then((stunTurnServers) => this.createUserAgent(server, callerIdName, stunTurnServers))
                        .then((userAgent) => this.inviteUserAgent(extension, server, userAgent, inputStream))
                        .then((currentSession) => this.setupEventHandlers(currentSession, callback));
  }

  fetchStunTurnServers(sessionToken) {
    console.log('FETCHSTUNTURN');
    return new Promise(async (resolve, reject) => {
      const url = `/bigbluebutton/api/stuns?sessionToken=${sessionToken}`;

      let response = await fetch(url)
        .then(response => response.json())
        .then(({ response, stunServers, turnServers}) => {
          return new Promise((resolve) => {
            if (response) {
              resolve({ error: 404, stun: [], turn: [] });
            }
            resolve({
              stun: stunServers.map(server => server.url),
              turn: turnServers.map(server => server.url),
            });
          });
        });

      if(response.error) return reject(`Could not fetch the stuns/turns servers!`);
      resolve(response);
    })
  }

  createUserAgent(server, username, { stun, turn }) {
    console.log('CREATEUSERAGENT');
    return new Promise((resolve, reject) => {
      const protocol = document.location.protocol;

      this.userAgent = new window.SIP.UA({
        uri: `sip:${encodeURIComponent(username)}@${server}`,
        wsServers: `${('https:' === protocol ? 'wss://' : 'ws://')}${server}/ws`,
        displayName: username,
        register: false,
        traceSip: true,
        autostart: false,
        userAgentString: 'BigBlueButton',
        stunServers: stun,
        turnServers: turn,
      });

      console.log(this.userAgent);

      this.userAgent.removeAllListeners('connected');
      this.userAgent.removeAllListeners('disconnected');

      this.userAgent.on('connected', () => {
        console.log('CONNECTED');
        this.isConnected = true;
        resolve(this.userAgent);
      });

      this.userAgent.on('disconnected', () => {
        this.userAgent.stop();
        this.userAgent = null;
        console.log('DISCONNECTED');
      })

      this.userAgent.start();
    });
  }

  inviteUserAgent(voiceBridge, server, userAgent, inputStream) {
    console.log('INVITEUSERAGENT');
    const options = {
			media: {
				stream: inputStream,
				constraints: {
					audio: true,
					video: false
				},
				render: {
					remote: document.getElementById('remote-media')
				}
			},
			RTCConstraints: {
				mandatory: {
					OfferToReceiveAudio: true,
					OfferToReceiveVideo: false
				}
			}
    }
    console.log(voiceBridge, server, userAgent);
    return userAgent.invite(`sip:${voiceBridge}@${server}`, options);
  }

  setupEventHandlers(currentSession, callback) {
    return new Promise((resolve) => {
      console.log('SETUPEVENTHANDLERS');
      currentSession.mediaHandler.on('iceGatheringComplete', function() {
        callback({ status: 'iceGatheringComplete' });
      });

      currentSession.on('connecting', () => {
        callback({})
      	console.log('connecting');
      });

      currentSession.on('progress', (response) => {
        console.log('progress');
      });

      currentSession.on('failed', (response, cause) => {
        console.log('failed', cause);
      });

      currentSession.on('bye', (request) => {
        console.log('bye');
        callback({ status: 'bye' });
      });

      currentSession.on('accepted', (data) => {
        console.log('accepted');
      });

      currentSession.mediaHandler.on('iceConnectionFailed', () => {
        console.log('iceConnectionFailed');
      });

      currentSession.mediaHandler.on('iceConnectionConnected', () => {
        console.log('iceConnectionConnected');
      });

      currentSession.mediaHandler.on('iceConnectionCompleted', () => {
        console.log('iceConnectionCompleted');
        callback({ status: 'iceConnectionCompleted' });
        resolve();
      });
    })
  }
}
