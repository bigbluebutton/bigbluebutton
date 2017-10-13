'use strict'

const C = require('../constants/Constants.js');
const config = require('config');
const mediaServerClient = require('kurento-client');
const util = require('util');
const EventEmitter = require('events').EventEmitter;

/* Public members */
exports = class MediaServer extends EventEmitter {
  constructor(serverUri) {
    super();
    this._serverUri = serverUri;
    this._mediaServer = _getMediaServerClient(this._serverUri);
    this._mediaPipelines = {};
    this._mediaElements= {};
  }

  _getMediaServerClient (serverUri) {
    return new Promise((resolve, reject) =>  {
      mediaServerClient(serverUri, (error, client) => {
        if (error) {
          reject(error);
        }
        resolve(client);
      });
    });
  }

  _getMediaPipeline (conference) {
    return new Promise((resolve, reject) => {
      if (_mediaPipelines[conference]) {
        console.log(' [media] Pipeline already exists. ' + JSON.stringify(_mediaPipelines, null, 2));
        resolve(_mediaPipelines[conference]);
      }
      else {
        this._mediaServer.create('MediaPipeline', function(err, pipeline) {
          if (error) {
            console.log(error);
            reject(error);
          }
          _mediaPipelines[conference] = pipeline;
          resolve(pipeline);
        });
      }
    });
  }

  _releasePipeline (pipelineId) {
    let mediaPipeline = _mediaPipelines[pipelineId];

    if (typeof mediaPipeline !== 'undefined' && typeof mediaPipeline.release === 'function') {
      mediaElement.release();
    }
  }

  _createElement (pipeline, type) {
    return new Promise((resolve, reject) => {
      pipeline.create(type, (error, mediaElement) => {
        if (error) {
          reject(error);
        }
        console.log("  [MediaController] Created [" + type + "] media element: " + mediaElement.id);
        _mediaElements[mediaElement.id] = mediaElement;
        resolve(mediaElement);
      });
    });
  }


  async createMediaElement (conference, type) {
    try {
      const pipeline = await this._getMediaPipeline(conference);
      const mediaElement = await this._createElement(pipeline, type);
      Promise.resolve(mediaElement.id);
    }
    catch (err) {
      return Promise.reject(new Error(e));
    }
  }

  async connectMediaElements (sourceId, sinkId, type) {
    let source = _mediaElements[sourceId];
    let sink = _mediaElements[sinkId];

    if (source && sink) {
      return new Promise((resolve, reject) => {
        switch (type) {
          case 'ALL': 
            source.connect(sink, (error) => {
              if (error) {
                reject(error);
              }
              resolve();
            });
            break;


          case 'AUDIO':
          case 'VIDEO':
            source.connect(sink, (error) => {
              if (error) {
                reject(error);
              }
              resolve();
            });
            break;

          default: reject("[mcs] Invalid connect type");
        }
      });
    }

    return Promise.reject("Failed to connect " + type + ": " + sourceId + " to " + sinkId);
  }

  stop (elementId) {
    let mediaElement = _mediaElements[elementId];
    // TODO remove event listeners
    if (typeof mediaElement !== 'undefined' && typeof mediaElement.release === 'function') {
      mediaElement.release();
    }
  }

  
  addIceCandidate (elementId, candidate) {
    let mediaElement = _mediaElements[elementId];

    if (typeof mediaElement !== 'undefined' && typeof mediaElement.addIceCandidate === 'function') {
      mediaElement.addIceCandidate(candidate);
    }
  }

  gatherCandidates (elementId) {
    let mediaElement = _mediaElements[elementId];

    return new Promise((resolve, reject) => {
      if (typeof mediaElement !== 'undefined' && typeof mediaElement.gatherCandidates === 'function') {
        mediaElement.gatherCandidates((error) => {
          if (error) {
            reject(error);
          }
          resolve(); 
        });
      }
      reject("  [MediaController/gatherCandidates] There is no element " + elementId);
    });
  }

  setInputBandwidth (elementId, min, max) {
    let mediaElement = _mediaElements[elementId];

    if (typeof mediaElement !== 'undefined') {
      endpoint.setMinVideoRecvBandwidth(min);
      endpoint.setMaxVideoRecvBandwidth(max);
    } else {
      return (" [MediaController/setInputBandwidth] There is no element " + elementId);
    }
  }

  setOutputBandwidth (endpoint, min, max) {
    let mediaElement = _mediaElements[elementId];

    if (typeof mediaElement !== 'undefined') {
      endpoint.setMinVideoSendBandwidth(min);
      endpoint.setMaxVideoSendBandwidth(max);
    } else {
      return (" [MediaController/setOutputBandwidth] There is no element " + elementId );
    }
  }

  setOutputBitrate (endpoint, min, max) {
    let mediaElement = _mediaElements[elementId];

    if (typeof mediaElement !== 'undefined') {
      endpoint.setMinOutputBitrate(min);
      endpoint.setMaxOutputBitrate(max);
    } else {
      return (" [MediaController/setOutputBitrate] There is no element " + elementId);
    }
  }

  processOffer (elementId, sdpOffer) {
    let mediaElement = _mediaElements[elementId];

    return new Promise((resolve, reject) => {
      if (typeof mediaElement !== 'undefined' && typeof mediaElement.processOffer === 'function') {
        mediaElement.processOffer(sdpOffer, (error, answer) => {
          if (error) {
            reject(error);
          }
          resolve(answer);
        });
      }
      reject("  [MediaController/processOffer] There is no element " + elementId);
    });
  }

  trackMediaState (elementId, type) {
    switch (type) {
      case C.MEDIA_TYPE.URI:
        this.addMediaEventListener(elementId, C.MEDIA_TYPE.ENDOFSTREAM);
        this.addMediaEventListener(elementId, C.MEDIA_TYPE.CHANGED);
        this.addMediaEventListener(elementId, C.MEDIA_TYPE.FLOW_IN);
        this.addMediaEventListener(elementId, C.MEDIA_TYPE.FLOW_OUT);
        break;

      case C.MEDIA_TYPE.WEBRTC:
      case C.MEDIA_TYPE.RTP:
        this.addMediaEventListener(elementId, C.MEDIA_TYPE.CHANGED);
        this.addMediaEventListener(elementId, C.MEDIA_TYPE.FLOW_IN);
        this.addMediaEventListener(elementId, C.MEDIA_TYPE.FLOW_OUT);
        break;

      default: return;
    }
    return;
  }

  addMediaEventListener (elementId, eventTag) {
    let mediaElement = _mediaElements[elementId];
    // TODO event type validator
    if (typeof mediaElement !== 'undefined' && mediaElement) {
      mediaElement.on(eventTag, (event) => {
        this.emit(C.MEDIA_STATE.MEDIA_EVENT , {elementId, eventTag, event});
      });
    }
  }

  notifyMediaState (elementId, eventTag, event) {
    this.emit(C.MEDIA_STATE.MEDIA_EVENT , {elementId, eventTag, event});
  }
};
