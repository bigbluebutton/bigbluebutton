'use strict'

const C = require('../../constants/Constants.js');
const config = require('config');
const EventEmitter = require('events').EventEmitter;
const audioHandler = require('./AudioHandler.js');
const Logger = require('../../../../utils/Logger');
const SIPJS = require('sip.js');
const LOCAL_IP_ADDRESS = config.get('localIpAddress');
const FREESWITCH_IP = config.get('freeswitch').ip;
const FREESWITCH_PORT = config.get('freeswitch').port;
const Kurento = require('../kurento');
const isError = require('../../utils/util').isError;

let instance = null;

/* Public members */
module.exports = class Freeswitch extends EventEmitter {
  constructor(serverUri) {
    if(!instance){
      super();
      this._serverUri = serverUri;
      this._userAgents = {};
      this._sessions = {};
      this._rtpConverters = {};
      this._Kurento = new Kurento(config.get('kurentoUrl'));
      instance = this;
    }

    return instance;
  }

  async init () {
    Logger.debug("[mcs-media] freeswitch init stub");
    await this._Kurento.init();
  }


  _getMediaServerClient (serverUri) {
    return new Promise((resolve, reject) =>  {
    });
  }

  async createMediaElement (roomId, type, params) {
    if (this._userAgents[roomId]) {
      return Promise.resolve(roomId);
    }
    try {
      let userAgent = await this._createUserAgent(type, params.name, roomId);
      this._userAgents[roomId] = userAgent;
      return Promise.resolve(roomId); 
    }
    catch (err) {
      return Promise.reject(err);
    }
  }

  async connect (sourceId, sinkId, type) {
    let source = this._sessions[sourceId];
    Logger.debug("[mcs-media-freeswitch] Connecting", this._rtpConverters[sourceId], "to", sinkId);

    if (source) {
      return new Promise((resolve, reject) => {
        switch (type) {
          case 'ALL': 

          case 'AUDIO':

          case 'VIDEO':
            this._Kurento.connect(this._rtpConverters[sourceId], sinkId, type);
            return resolve();
            break;

          default: return reject("[mcs-media] Invalid connect type");
        }
      });
    }
    else {
      return Promise.reject("[mcs-media] Failed to connect " + type + ": " + sourceId + " to " + sinkId);
    }
  }

  stop (roomId, elementId) {
    Logger.info("[mcs-media-freeswitch] Releasing endpoint", elementId, "from room", roomId);
    let userAgent = this._userAgents[elementId];
    let rtpConverter = this._rtpConverters[elementId];

    if (userAgent) {
      Logger.info("[mcs-media-freeswitch] Stopping user agent", elementId);
      userAgent.stop();
      delete this._userAgents[elementId]; 
    }

    if (rtpConverter) {
      this._Kurento.stop(roomId, this._rtpConverters[elementId]);
      delete this._rtpConverters[elementId];
    }

    return;
  }

  async processOffer (elementId, sdpOffer, params) {
    let userAgent = this._userAgents[elementId];
    let rtpEndpoint;

    return new Promise(async (resolve, reject) => {
      try {
        if (userAgent) {

          if (this._rtpConverters[elementId]) {
            rtpEndpoint = this._rtpConverters[elementId];
          }
          else {
            rtpEndpoint = await this._Kurento.createMediaElement(elementId, 'RtpEndpoint');
            this._rtpConverters[elementId] = rtpEndpoint;
          }

          Logger.info("[mcs-media-freeswitch] RTP endpoint equivalent to SIP instance is", rtpEndpoint);

          let session = this.sipCall(userAgent,
              params.name,
              elementId,
              FREESWITCH_IP,
              FREESWITCH_PORT,
              rtpEndpoint
              //sdpOffer
              );

          session.on('accepted', (response, cause) => {
            this._sessions[elementId] = session;
            return resolve(session.remote_sdp);
          });

          session.on('rejected', (response, cause) => {
            Logger.info("session rejected", response, cause);
          });

          session.on('failed', (response, cause) => {
            Logger.info("session failed", response, cause);
          });

          session.on('progress', (response) => {
            Logger.info("session progress", response);
          });

        } else {
          return reject("[mcs-media] There is no element " + elementId);
        }
      }
      catch (error) {
        this._handleError(error);
        reject(error);
      }
    });
  }

  trackMediaState (elementId, type) {
    let userAgent = this._userAgents[elementId];
    if (userAgent) {
      userAgent.on('invite', function(session) {
        Logger.info("[mcs-media-freeswitch] On UserAgentInvite");
      });

      userAgent.on('message', function(message) {
        Logger.info("[mcs-media-freeswitch] On UserAgentMessage", message);
      });

      userAgent.on('connected', function() {
        Logger.info("[mcs-media-freeswitch] On UserAgentConnected");
      });

      userAgent.on('disconnected', function (){
        Logger.warn("[mcs-media-freeswitch] UserAgent disconnected");
      });

      return;
    }
  }

  _destroyElements() {
    for (var ua in this._userAgents) {
      if (this._userAgents.hasOwnProperty(ua)) {
        delete this._mediaElements[ua];
      }
    }
  }

  _createUserAgent (type, displayName, roomId) {
    var mediaFactory = audioHandler.AudioHandler.defaultFactory;
    var newUA = new SIPJS.UA({
      uri: 'sip:' + C.FREESWITCH.GLOBAL_AUDIO_PREFIX + roomId + '@' + LOCAL_IP_ADDRESS,
      wsServers: 'ws://' + FREESWITCH_IP + ':' + FREESWITCH_PORT,
      displayName: displayName,
      register: false,
      mediaHandlerFactory: mediaFactory,
      userAgentString: C.STRING.SIP_USER_AGENT,
      log: {
        builtinEnabled: false,
        level: 3,
        connector: this.sipjsLogConnector
      },
      traceSip: true,
      hackIpInContact: LOCAL_IP_ADDRESS 
    });

    Logger.info("[mcs-freeswitch-adapter] Created new user agent for endpoint " + displayName);

    return newUA;
  }

/**
   * Makes a sip call to a Freeswitch instance
   * @param {UA} caller's SIP.js User Agent
   * @param {String} username The user identifier (Kurento Endpoint ID)
   * @param {String} voiceBridge The voiceBridge we are going to call to
   * @param {String} host Freeswitch host address
   * @param {String} port Freeswitch port
   */
  sipCall (userAgent, username, voiceBridge, host, port, rtp) {
    //call options
    var options = {
      media: {
        constraints: {
          audio: true,
          video: false
        },
      },
      inviteWithoutSdp: true,
      params: {
        from_displayName : username
      }
    };

    audioHandler.AudioHandler.setup(null, rtp, this._Kurento);

    var sipUri = new SIPJS.URI('sip', voiceBridge, host, port);

    Logger.info('[mcs-media-freeswitch] Making SIP call to: ' + sipUri + ' from: ' + username);



    return userAgent.invite(sipUri, options);
  }

  _handleError(error) {
    // Checking if the error needs to be wrapped into a JS Error instance
    if(!isError(error)) {
      error = new Error(error);
    }

    error.code = C.ERROR.MEDIA_SERVER_ERROR;
    Logger.error('[mcs-media] Media Server returned error', error);
  }


  sipjsLogConnector (level, category, label, content) {
    Logger.debug('[SIP.js]  ' + content);
  }
};
