'use strict'

const C = require('../constants/Constants.js');
const config = require('config');
const mediaServerClient = require('kurento-client');
const EventEmitter = require('events').EventEmitter;
const Logger = require('../../../utils/Logger');
const isError = require('../utils/util').isError;

let instance = null;

module.exports = class MediaServer extends EventEmitter {
  constructor(serverUri) {
    if(!instance){
      super();
      this._serverUri = serverUri;
      this._mediaPipelines = {};
      this._mediaElements = {};
      this._mediaServer;
      this._reconnectionRoutine = null;
      instance = this;
    }

    return instance;
  }

  async init () {
    if (!this._mediaServer) {
      this._mediaServer = await this._getMediaServerClient(this._serverUri);
      Logger.info("[mcs-media] Retrieved media server client => " + this._mediaServer);
      this._monitorConnectionState();
    }
  }

  _getMediaServerClient (serverUri) {
    return new Promise((resolve, reject) =>  {
      mediaServerClient(serverUri, {failAfter: 1}, (error, client) => {
        if (error) {
          error = this._handleError(error);
          return reject(error);
        }
        resolve(client);
      });
    });
  }

  _monitorConnectionState () {
    Logger.debug('[mcs-media] Monitoring connection state');
    this._mediaServer.on('disconnect', this._onDisconnection.bind(this));
    this._mediaServer.on('reconnected',this._onReconnection.bind(this));
  }

  _onDisconnection () {
    Logger.error('[mcs-media] Media server was disconnected for some reason, will have to clean up all elements and notify users');
    this._destroyElements();
    this._destroyMediaServer();
    this.emit(C.ERROR.MEDIA_SERVER_OFFLINE);
    this._reconnectToServer();
  }

  _onReconnection (sameSession) {
    if (!sameSession) {
      Logger.info('[mcs-media] Media server is back online');
      this.emit(C.EVENT.MEDIA_SERVER_ONLINE);
    }
  }

  _reconnectToServer () {
    if (!this._reconnectionRoutine) {
      this._reconnectionRoutine = setInterval(async () => {
        try {
          this._mediaServer = await this._getMediaServerClient(this._serverUri);
          this._monitorConnectionState();
          clearInterval(this._reconnectionRoutine);
          this._reconnectionRoutine = null;
          Logger.warn("[mcs-media] Reconnection to media server succeeded");
        }
        catch (error) {
          delete this._mediaServer;
        }
      }, 2000);
    }
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
    return new Promise((resolve, reject) => {
      Logger.debug("[mcs-media] Releasing room", room, "pipeline");
      let pipeline = this._mediaPipelines[room];
      if (pipeline && typeof pipeline.release === 'function') {
        pipeline.release((error) => {
          if (error) {
            error = this._handleError(error);
            return reject(error);
          }
          delete this._mediaPipelines[room];
          return resolve()
        });
      }
    });
  }

  _createElement (pipeline, type, options) {
    return new Promise((resolve, reject) => {
      pipeline.create(type, options, (error, mediaElement) => {
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


  async createMediaElement (roomId, type, options) {
    options = options || {};
    try {
      const pipeline = await this._getMediaPipeline(roomId);
      const mediaElement = await this._createElement(pipeline, type, options);
      this._mediaPipelines[roomId].activeElements++;
      return Promise.resolve(mediaElement.id);
    }
    catch (err) {
      return Promise.reject(err);
    }
  }

  async startRecording (sourceId) {
    let source = this._mediaElements[sourceId];

    if (source) {
      return new Promise((resolve, reject) => {
        try {
          source.record((err) => {
            if (err) {
              return reject(this._handleError(err));
            }
            return resolve();
          });
        }
        catch (err) {
          return reject(this._handleError(err));
        }
      });
    }
    else {
      return Promise.reject("[mcs-recording] startRecording error");
    }
  }

  async _stopRecording (sourceId) {
    let source = this._mediaElements[sourceId];

    if (source) {
      return new Promise((resolve, reject) => {
        try {
          source.stopAndWait((err) => {
            if (err) {
              return reject(this._handleError(err));
            }
            return resolve();
          });
        }
        catch (err) {
          return reject(this._handleError(err));
        }
      });
    }
    else {
      return Promise.reject("[mcs-recording] stopRecording error");
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

          default:
            return this._handleError("[mcs-media] Invalid connect type");
        }
      });
    }
    else {
      let error = this._handleError("[mcs-media] Failed to connect " + type + ": " + sourceId + " to " + sinkId);
      return Promise.reject(error);
    }
  }

  async disconnect (sourceId, sinkId, type) {
    let source = this._mediaElements[sourceId];
    let sink = this._mediaElements[sinkId];

    if (source && sink) {
      return new Promise((resolve, reject) => {
        switch (type) {
          case 'ALL':
            source.disconnect(sink, (error) => {
              if (error) {
                error = this._handleError(error);
                return reject(error);
              }
              return resolve();
            });
            break;


          case 'AUDIO':
            source.disconnect(sink, 'AUDIO', (error) => {
              if (error) {
                error = this._handleError(error);
                return reject(error);
              }
              return resolve();
            });

          case 'VIDEO':
            source.disconnect(sink, (error) => {
              if (error) {
                error = this._handleError(error);
                return reject(error);
              }
              return resolve();
            });
            break;

          default:
            return this._handleError("[mcs-media] Invalid connect type");
        }
      });
    }
    else {
      let error = this._handleError("[mcs-media] Failed to connect " + type + ": " + sourceId + " to " + sinkId);
      return Promise.reject(error);
    }
  }

  stop (room, type, elementId) {
    return new Promise(async (resolve, reject) => {
      try {
        Logger.info("[mcs-media] Releasing endpoint", elementId, "from room", room);
        const mediaElement = this._mediaElements[elementId];
        const pipeline = this._mediaPipelines[room];

        if (type === 'RecorderEndpoint') {
          await this._stopRecording(elementId);
        }

        if (mediaElement && typeof mediaElement.release === 'function') {
          mediaElement.release(async (error) => {
            if (error) {
              error = this._handleError(error);
              return reject(error);
            }

            delete this._mediaElements[elementId];

            if (pipeline) {
              pipeline.activeElements--;

              Logger.info("[mcs-media] Pipeline has a total of", pipeline.activeElements, "active elements");
              if (pipeline.activeElements <= 0) {
                await this._releasePipeline(room);
              }
            }
            return resolve();
          });
        }
        else {
          Logger.warn("[mcs-media] Media element", elementId, "could not be found to stop");
          return resolve();
        }
      }
      catch (err) {
        err = this._handleError(err);
        resolve();
      }
    });
  }

  addIceCandidate (elementId, candidate) {
    let mediaElement = this._mediaElements[elementId];
    let kurentoCandidate = mediaServerClient.getComplexType('IceCandidate')(candidate);

    if (mediaElement  && candidate) {
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
      if (mediaElement) {
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

    if (mediaElement) {
      endpoint.setMinVideoRecvBandwidth(min);
      endpoint.setMaxVideoRecvBandwidth(max);
    } else {
      return ("[mcs-media] There is no element " + elementId);
    }
  }

  setOutputBandwidth (endpoint, min, max) {
    let mediaElement = this._mediaElements[elementId];

    if (mediaElement) {
      endpoint.setMinVideoSendBandwidth(min);
      endpoint.setMaxVideoSendBandwidth(max);
    } else {
      return ("[mcs-media] There is no element " + elementId );
    }
  }

  setOutputBitrate (endpoint, min, max) {
    let mediaElement = this._mediaElements[elementId];

    if (mediaElement) {
      endpoint.setMinOutputBitrate(min);
      endpoint.setMaxOutputBitrate(max);
    } else {
      return ("[mcs-media] There is no element " + elementId);
    }
  }

  processOffer (elementId, sdpOffer) {
    let mediaElement = this._mediaElements[elementId];

    return new Promise((resolve, reject) => {
      if (mediaElement) {
        mediaElement.processOffer(sdpOffer, (error, answer) => {
          if (error) {
            error = this._handleError(error);
            return reject(error);
          }
          return resolve(answer);
        });
      }
      else {
        return reject(this._handleError("[mcs-media] There is no element " + elementId));
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

      case C.MEDIA_TYPE.RECORDING:
        break;

      default: return;
    }
    return;
  }

  addMediaEventListener (eventTag, elementId) {
    let mediaElement = this._mediaElements[elementId];
    // TODO event type validator
    if (mediaElement) {
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

  _destroyElements () {
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
    if (!isError(error)) {
      error = new Error(error);
    }

    Logger.error('[mcs-media] Media Server returned an', error.message);
    return error;
  }
};
