import BaseAudioBridge from './base';

export default class SIPBridge extends BaseAudioBridge {
  constructor(userData) {
    super();
    this.userData = userData;

    console.log('userdata', userData);
    this.isConnected = false;
  }

  joinAudio({ isListenOnly, extension, inputStream }, managerCallback) {
    return new Promise((resolve, reject) => {
      extension = extension || this.userData.voiceBridge;

      const callback = (message) => {
        managerCallback(message).then(() => resolve());
      };

      return this.doCall({ extension, isListenOnly, inputStream }, callback)
                 .catch(reason => {
                   callback({ status: 'failed', error: reason });
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

  doCall({ isListenOnly, extension, inputStream }, callback) {
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
        reject('CONNECTION_ERROR');
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

      const {
        causes,
      } = window.SIP.C;

      currentSession.on('terminated', (message, cause) => {
        console.log('TERMINATED', message, cause);
        if (!message && !cause) {
          return callback({ status: 'ended'})
        } else if(cause) {
          if (cause === causes.REQUEST_TIMEOUT) {
            return callback({ status: 'failed' , error: 'REQUEST_TIMEOUT'});
          } else if (cause === causes.CONNECTION_ERROR) {
            return callback({ status: 'failed' , error: 'CONNECTION_ERROR'});
          }
        }
        return callback({ status: 'failed' , error: 'ERROR', message: cause});
      })

      currentSession.mediaHandler.on('iceConnectionCompleted', () => {
        console.log('iceConnectionCompleted');
        this.hangup = false;
        callback({ status: 'started' });
        resolve();
      });

      currentSession.mediaHandler.on('iceConnectionConnected', () => {
        console.log('iceConnectionConnected');
        this.hangup = false;
        callback({ status: 'started' });
        resolve();
      });

      this.currentSession = currentSession;
    })
  }
}
