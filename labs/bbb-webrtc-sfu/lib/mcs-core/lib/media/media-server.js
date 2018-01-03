'use strict'

const C = require('../constants/Constants.js');
const config = require('config');
const mediaServerClient = require('kurento-client');
const util = require('util');
const EventEmitter = require('events').EventEmitter;

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
    }
  }

  _getMediaServerClient (serverUri) {
    return new Promise((resolve, reject) =>  {
      mediaServerClient(serverUri, (error, client) => {
        if (error) {
          reject(error);
        }
        console.log("  [media] Retrieved media server client => " + client);
        resolve(client);
      });
    });
  }

  _getMediaPipeline (conference) {
    return new Promise((resolve, reject) => {
      if (this._mediaPipelines[conference]) {
        console.log(' [media] Pipeline already exists. ' + JSON.stringify(this._mediaPipelines, null, 2));
        resolve(this._mediaPipelines[conference]);
      }
      else {
        this._mediaServer.create('MediaPipeline', (error, pipeline) => {
          if (error) {
            console.log(error);
            reject(error);
          }
          this._mediaPipelines[conference] = pipeline;
          resolve(pipeline);
        });
      }
    });
  }

  _releasePipeline (pipelineId) {
    let mediaPipeline = this._mediaPipelines[pipelineId];

    if (typeof mediaPipeline !== 'undefined' && typeof mediaPipeline.release === 'function') {
      mediaElement.release();
    }
  }

  _createElement (pipeline, type) {
    return new Promise((resolve, reject) => {
      pipeline.create(type, (error, mediaElement) => {
        if (error) {
          return reject(error);
        }
        console.log("  [MediaController] Created [" + type + "] media element: " + mediaElement.id);
        this._mediaElements[mediaElement.id] = mediaElement;
        return resolve(mediaElement);
      });
    });
  }


  async createMediaElement (conference, type) {
    try {
      const pipeline = await this._getMediaPipeline(conference);
      const mediaElement = await this._createElement(pipeline, type);
      return Promise.resolve(mediaElement.id);
    }
    catch (err) {
      return Promise.reject(new Error(err));
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
                return reject(error);
              }
              return resolve();
            });
            break;


          case 'AUDIO':
          case 'VIDEO':
            source.connect(sink, (error) => {
              if (error) {
                return reject(error);
              }
              return resolve();
            });
            break;

          default: return reject("  [media] Invalid connect type");
        }
      });
    }
    else {
      return Promise.reject("  [media] Failed to connect " + type + ": " + sourceId + " to " + sinkId);
    }
  }

  stop (elementId) {
    let mediaElement = this._mediaElements[elementId];
    if (typeof mediaElement !== 'undefined' && typeof mediaElement.release === 'function') {
      console.log("  [media] Releasing endpoint => " + elementId);
      mediaElement.release();
      this._mediaElements[elementId] = null;
    }
  }

  
  addIceCandidate (elementId, candidate) {
    let mediaElement = this._mediaElements[elementId];
    let kurentoCandidate = mediaServerClient.getComplexType('IceCandidate')(candidate);

    if (typeof mediaElement !== 'undefined' && typeof mediaElement.addIceCandidate === 'function' &&
        typeof candidate !== 'undefined') {
      mediaElement.addIceCandidate(candidate);
      console.log("  [media] Added ICE candidate for => " + elementId);
      return Promise.resolve();
    }
    else {
      return Promise.reject(new Error("Candidate could not be parsed or media element does not exist"));
    }
  }

  gatherCandidates (elementId) {
    console.log('  [media] Gathering ICE candidates for ' + elementId);
    let mediaElement = this._mediaElements[elementId];

    return new Promise((resolve, reject) => {
      if (typeof mediaElement !== 'undefined' && typeof mediaElement.gatherCandidates === 'function') {
        mediaElement.gatherCandidates((error) => {
          if (error) {
            return reject(new Error(error));
          }
          console.log('  [media] Triggered ICE gathering for ' + elementId);
          return resolve(); 
        });
      }
      else {
        return reject("  [MediaController/gatherCandidates] There is no element " + elementId);
      }
    });
  }

  setInputBandwidth (elementId, min, max) {
    let mediaElement = this._mediaElements[elementId];

    if (typeof mediaElement !== 'undefined') {
      endpoint.setMinVideoRecvBandwidth(min);
      endpoint.setMaxVideoRecvBandwidth(max);
    } else {
      return (" [MediaController/setInputBandwidth] There is no element " + elementId);
    }
  }

  setOutputBandwidth (endpoint, min, max) {
    let mediaElement = this._mediaElements[elementId];

    if (typeof mediaElement !== 'undefined') {
      endpoint.setMinVideoSendBandwidth(min);
      endpoint.setMaxVideoSendBandwidth(max);
    } else {
      return (" [MediaController/setOutputBandwidth] There is no element " + elementId );
    }
  }

  setOutputBitrate (endpoint, min, max) {
    let mediaElement = this._mediaElements[elementId];

    if (typeof mediaElement !== 'undefined') {
      endpoint.setMinOutputBitrate(min);
      endpoint.setMaxOutputBitrate(max);
    } else {
      return (" [MediaController/setOutputBitrate] There is no element " + elementId);
    }
  }

  processOffer (elementId, sdpOffer) {
    let mediaElement = this._mediaElements[elementId];

    return new Promise((resolve, reject) => {
      if (typeof mediaElement !== 'undefined' && typeof mediaElement.processOffer === 'function') {
        mediaElement.processOffer(sdpOffer, (error, answer) => {
          if (error) {
            return reject(error);
          }
          return resolve(answer);
        });
      }
      else {
        return reject("  [MediaController/processOffer] There is no element " + elementId);
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
      console.log('  [media] Adding media state listener [' + eventTag + '] for ' + elementId);
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
};
