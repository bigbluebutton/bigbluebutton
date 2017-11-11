'use strict'

const Constants = require('./bbb/messages/Constants.js');
const config = require('config');
const kurento = require('kurento-client');
const mediaServerClient = null;

var _mediaPipelines = {};
var _mediaElements= {};

function createMediaPipeline(id, callback) {
  console.log(' [media] Creating media pipeline for ' + id);
  getMediaServerClient(function (error, mediaServerClient) {
    mediaServerClient.create('MediaPipeline', function(err, pipeline) {
      if (error) {
        console.log("Could not find media server at address " + kurentoUrl);
        return callback(error);
      }
      return callback(null , pipeline);
    });
  });
};

function getMediaServerClient (callback) {
  let kurentoUrl = config.get('kurentoUrl');
  if (mediaServerClient) {
    callback(null, mediaServerClient);
  }
  else {
    kurento(kurentoUrl, function(error, _mediaServerClient) {
      if (error) {
        console.log("Could not find media server at address " + kurentoUrl);
        return callback(error, null);
      }

      console.log(" [server] Initiating kurento client. Connecting to: " + kurentoUrl);
      return callback(null, _mediaServerClient);
    });
  }
};

/* Public members */
module.exports = {

  createMediaElement : function (conference, type, callback) {
    let self = this;
    self.getMediaPipeline(conference, function(error, pipeline) {

      pipeline.create(type, function(error, mediaElement) {
        if (error) {
          return callback(error, null);
        }
        console.log("  [MediaController] Created [" + type + "] media element: " + mediaElement.id);
        _mediaElements[mediaElement.id] = mediaElement;
        return callback(null, mediaElement);
      });
    });
  },

  connectMediaElements : function (sourceId, sinkId, type, callback) {
    let source = _mediaElements[sourceId];
    let sink = _mediaElements[sinkId];

    if (source && sink) {
      if (type === 'ALL') {
        source.connect(sink, function (error) {
          return callback (error);
        });
      } else {
        console.log(typeof source.connect);
        source.connect(sink, type, function (error) {
          return callback (error);
        });
      }
    } else {
      return callback ("Failed to connect " + type + ": " + sourceId + " to " + sinkId);
    }
  },

  releaseMediaElement : function (elementId) {
    let mediaElement = _mediaElements[elementId];

    if (typeof mediaElement !== 'undefined' && typeof mediaElement.release === 'function') {
      mediaElement.release();
    }
  },

  releasePipeline: function (pipelineId) {
    let MediaPipeline = _mediaPipelines[pipelineId];

    if (typeof mediaElement !== 'undefined' && typeof mediaElement.release === 'function') {
      mediaElement.release();
    }
  },

  processOffer : function (elementId, sdpOffer, callback) {
    let mediaElement = _mediaElements[elementId];

    if (typeof mediaElement !== 'undefined' && typeof mediaElement.processOffer === 'function') {
      mediaElement.processOffer (sdpOffer, function (error, sdpAnswer) {
        return callback (error, sdpAnswer);
      });
    } else {
      return callback ("  [MediaController/processOffer] There is no element " + elementId, null);
    }
  },

  getMediaPipeline : function(conference, callback) {
    let self = this;

    if (_mediaPipelines[conference]) {
      console.log(' [media] Pipeline already exists. ' + JSON.stringify(_mediaPipelines, null, 2));
      return callback(null, _mediaPipelines[conference]);
    } else {
      createMediaPipeline(conference, function(error, pipeline) {
        _mediaPipelines[conference] = pipeline;
        return callback(error, pipeline);
      });
    }
  },

  addIceCandidate : function (elementId, candidate) {
    let mediaElement = _mediaElements[elementId];

    if (typeof mediaElement !== 'undefined' && typeof mediaElement.addIceCandidate === 'function') {
      mediaElement.addIceCandidate(candidate);
    }
  },

  gatherCandidates : function (elementId, callback) {
    let mediaElement = _mediaElements[elementId];

    if (typeof mediaElement !== 'undefined' && typeof mediaElement.gatherCandidates === 'function') {
      mediaElement.gatherCandidates(function (error) {
        return callback(error);  
      });
    } else {
      return callback ("  [MediaController/gatherCandidates] There is no element " + elementId, null);
    }
  },
};
