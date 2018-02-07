'use strict'

const C = require('../constants/Constants.js');
const config = require('config');
const mediaServerClient = require('kurento-client');
const util = require('util');
const EventEmitter = require('events').EventEmitter;
const Logger = require('../../../utils/Logger');
const isError = require('../utils/util').isError;

let instance = null;

/* Public members */
module.exports = class MediaServer extends EventEmitter {
  constructor(serverUri) {
    if(!instance){
      super();
      this._serverUri = serverUri;
      this._mediaPipelines = {};
      this._mediaElements= {};
      this._mediaServer;
      instance = this;
    }

    return instance;
  }

  async init () {
    if (typeof this._mediaServer === 'undefined' || !this._mediaServer) {
      this._mediaServer = await this._getMediaServerClient(this._serverUri);
      Logger.info("[mcs-media] Retrieved media server client => " + this._mediaServer);

      this._mediaServer.on('disconnect', (err) => {
        Logger.error('[mcs-media] Media server was disconnected for some reason, will have to clean up all elements and notify users');
        this._destroyElements();
        this._destroyMediaServer();
        this.emit(C.ERROR.MEDIA_SERVER_OFFLINE);
      });
    }
  }

  _getMediaServerClient (serverUri) {
    return new Promise((resolve, reject) =>  {
      mediaServerClient(serverUri, {failAfter: 3}, (error, client) => {
        if (error) {
          error = this._handleError(error);
          reject(error);
        }
        resolve(client);
      });
    });
  }

  _getMediaPipeline (roomId) {
    return new Promise((resolve, reject) => {
      if (this._mediaPipelines[roomId]) {
        Logger.warn('[mcs-media] Pipeline for', roomId, ' already exists.');
        resolve(this._mediaPipelines[roomId]);
      }
      else {
        this._mediaServer.create('MediaPipeline', (error, pipeline) => {
          if (error) {
            error = this._handleError(error);
            reject(error);
          }
          this._mediaPipelines[roomId] = pipeline;
          pipeline.activeElements = 0;
          resolve(pipeline);
        });
      }
    });
  }

  _releasePipeline (room) {
    Logger.debug("[mcs-media] Releasing room", room, "pipeline");
    let pipeline = this._mediaPipelines[room];
    if (pipeline && typeof pipeline.release === 'function') {
      pipeline.release();
      delete this._mediaPipelines[room];
    }
  }

  _createElement (pipeline, type) {
    return new Promise((resolve, reject) => {
      pipeline.create(type, (error, mediaElement) => {
        if (error) {
          error = this._handleError(error);
          return reject(error);
        }
        Logger.info("[mcs-media] Created [" + type + "] media element: " + mediaElement.id);
        this._mediaElements[mediaElement.id] = mediaElement;
        return resolve(mediaElement);
      });
    });
  }


  async createMediaElement (roomId, type) {
    try {
      const pipeline = await this._getMediaPipeline(roomId);
      const mediaElement = await this._createElement(pipeline, type);
      this._mediaPipelines[roomId].activeElements++;
      return Promise.resolve(mediaElement.id);
    }
    catch (err) {
      return Promise.reject(err);
    }
  }

  async connect (sourceId, sinkId, type) {
    let source = this._mediaElements[sourceId];
    let sink = this._mediaElements[sinkId];

    if (source && sink) {
      return new Promise((resolve, reject) => {
        switch (type) {
          case 'ALL': 
            source.connect(sink, (error) => {
              if (error) {
                error = this._handleError(error);
                return reject(error);
              }
              return resolve();
            });
            break;


          case 'AUDIO':
            source.connect(sink, 'AUDIO', (error) => {
              if (error) {
                error = this._handleError(error);
                return reject(error);
              }
              return resolve();
            });

          case 'VIDEO':
            source.connect(sink, (error) => {
              if (error) {
                error = this._handleError(error);
                return reject(error);
              }
              return resolve();
            });
            break;

          default: return reject("[mcs-media] Invalid connect type");
        }
      });
    }
    else {
      return Promise.reject("[mcs-media] Failed to connect " + type + ": " + sourceId + " to " + sinkId);
    }
  }

  stop (room, elementId) {
    Logger.info("[mcs-media] Releasing endpoint", elementId, "from room", room);
    let mediaElement = this._mediaElements[elementId];
    let pipeline = this._mediaPipelines[room];
    if (mediaElement && typeof mediaElement.release === 'function') {
      pipeline.activeElements--;

      Logger.info("[mcs-media] Pipeline has a total of", pipeline.activeElements, "active elements");
      if (pipeline.activeElements <= 0) {
        this._releasePipeline(room);
      }

      mediaElement.release();
      this._mediaElements[elementId] = null;
    }
    else {
      Logger.warn("[mcs-media] Media element", elementId, "could not be found to stop");
    }
  }

  
  addIceCandidate (elementId, candidate) {
    let mediaElement = this._mediaElements[elementId];
    let kurentoCandidate = mediaServerClient.getComplexType('IceCandidate')(candidate);

    if (typeof mediaElement !== 'undefined' && typeof mediaElement.addIceCandidate === 'function' &&
        typeof candidate !== 'undefined') {
      mediaElement.addIceCandidate(candidate);
      Logger.debug("[mcs-media] Added ICE candidate for => " + elementId);
      return Promise.resolve();
    }
    else {
      return Promise.reject("Candidate could not be parsed or media element does not exist");
    }
  }

  gatherCandidates (elementId) {
    Logger.info('[mcs-media] Gathering ICE candidates for ' + elementId);
    let mediaElement = this._mediaElements[elementId];

    return new Promise((resolve, reject) => {
      if (typeof mediaElement !== 'undefined' && typeof mediaElement.gatherCandidates === 'function') {
        mediaElement.gatherCandidates((error) => {
          if (error) {
            error = this._handleError(error);
            return reject(error);
          }
          Logger.info('[mcs-media] Triggered ICE gathering for ' + elementId);
          return resolve(); 
        });
      }
      else {
        return reject("[mcs-media] There is no element " + elementId);
      }
    });
  }

  setInputBandwidth (elementId, min, max) {
    let mediaElement = this._mediaElements[elementId];

    if (typeof mediaElement !== 'undefined') {
      endpoint.setMinVideoRecvBandwidth(min);
      endpoint.setMaxVideoRecvBandwidth(max);
    } else {
      return ("[mcs-media] There is no element " + elementId);
    }
  }

  setOutputBandwidth (endpoint, min, max) {
    let mediaElement = this._mediaElements[elementId];

    if (typeof mediaElement !== 'undefined') {
      endpoint.setMinVideoSendBandwidth(min);
      endpoint.setMaxVideoSendBandwidth(max);
    } else {
      return ("[mcs-media] There is no element " + elementId );
    }
  }

  setOutputBitrate (endpoint, min, max) {
    let mediaElement = this._mediaElements[elementId];

    if (typeof mediaElement !== 'undefined') {
      endpoint.setMinOutputBitrate(min);
      endpoint.setMaxOutputBitrate(max);
    } else {
      return ("[mcs-media] There is no element " + elementId);
    }
  }

  processOffer (elementId, sdpOffer) {
    let mediaElement = this._mediaElements[elementId];

    return new Promise((resolve, reject) => {
      if (typeof mediaElement !== 'undefined' && typeof mediaElement.processOffer === 'function') {
        mediaElement.processOffer(sdpOffer, (error, answer) => {
          if (error) {
            error = this._handleError(error);
            return reject(error);
          }
          return resolve(answer);
        });
      }
      else {
        return reject("[mcs-media] There is no element " + elementId);
      }
    });
  }

  trackMediaState (elementId, type) {
    switch (type) {
      case C.MEDIA_TYPE.URI:
        this.addMediaEventListener(C.EVENT.MEDIA_STATE.ENDOFSTREAM, elementId);
        this.addMediaEventListener(C.EVENT.MEDIA_STATE.CHANGED, elementId);
        this.addMediaEventListener(C.EVENT.MEDIA_STATE.FLOW_IN, elementId);
        this.addMediaEventListener(C.EVENT.MEDIA_STATE.FLOW_OUT, elementId);
        break;

      case C.MEDIA_TYPE.WEBRTC:
        this.addMediaEventListener(C.EVENT.MEDIA_STATE.CHANGED, elementId);
        this.addMediaEventListener(C.EVENT.MEDIA_STATE.FLOW_IN, elementId);
        this.addMediaEventListener(C.EVENT.MEDIA_STATE.FLOW_OUT, elementId);
        this.addMediaEventListener(C.EVENT.MEDIA_STATE.ICE, elementId);
        break;

      case C.MEDIA_TYPE.RTP:
        this.addMediaEventListener(C.EVENT.MEDIA_STATE.CHANGED, elementId);
        this.addMediaEventListener(C.EVENT.MEDIA_STATE.FLOW_IN, elementId);
        this.addMediaEventListener(C.EVENT.MEDIA_STATE.FLOW_OUT, elementId);
        break;

      default: return;
    }
    return;
  }

  addMediaEventListener (eventTag, elementId) {
    let mediaElement = this._mediaElements[elementId];
    // TODO event type validator
    if (typeof mediaElement !== 'undefined' && mediaElement) {
      Logger.debug('[mcs-media] Adding media state listener [' + eventTag + '] for ' + elementId);
      mediaElement.on(eventTag, (event) => {
        if (eventTag === C.EVENT.MEDIA_STATE.ICE) {
          event.candidate = mediaServerClient.getComplexType('IceCandidate')(event.candidate);
        }
        this.emit(C.EVENT.MEDIA_STATE.MEDIA_EVENT+elementId , {eventTag, event});
      });
    }
  }

  notifyMediaState (elementId, eventTag, event) {
    this.emit(C.MEDIA_STATE.MEDIA_EVENT , {elementId, eventTag, event});
  }

  _destroyElements() {
    for (var pipeline in this._mediaPipelines) {
      if (this._mediaPipelines.hasOwnProperty(pipeline)) {
        delete this._mediaPipelines[pipeline];
      }
    }

    for (var element in this._mediaElements) {
      if (this._mediaElements.hasOwnProperty(element)) {
        delete this._mediaElements[element];
      }
    }
  }

  _destroyMediaServer() {
    delete this._mediaServer;
  }

  _handleError(error) {
    // Checking if the error needs to be wrapped into a JS Error instance
    if(!isError(error)) {
      error = new Error(error);
    }

    error.code = C.ERROR.MEDIA_SERVER_ERROR;
    Logger.error('[mcs-media] Media Server returned error', error);
  }
};
