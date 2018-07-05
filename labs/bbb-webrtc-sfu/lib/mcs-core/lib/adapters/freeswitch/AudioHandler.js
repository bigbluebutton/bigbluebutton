'use strict';

const Logger = require('../../../../utils/Logger');
const config = require('config');

var kmh = function(sdp) {
  this.endpointSdp = sdp;
};
/**
 * @classdesc
 * 	Custom sipjs's MediaHandler to manage media communication between
 * 	Kurento and Freeswitch
 * 	@constructor
 */
kmh.prototype.AudioHandler = function (session, options ) {
  this.session = session;
  this.options = options;
  this.Kurento;
  this.sdp = null;
  this.endpointSdp = null;
  this.remote_sdp = null;
  this.version = '0.0.1';

  //Default video configuration
  this.video = {
      configuration: {
          codecId: '96',
          sendReceive: 'sendrecv',
          rtpProfile: 'RTP/AVP',
          codecName: 'H264' ,
          codecRate: '90000',
          frameRate: '30.000000'
      }
  };
};

/**
 * Factory method for AudioHandler
 * @param  {Object} session Current session of this media handler
 * @param  {Object} options Options
 * @return {AudioHandler} A AudioHandler
 */
kmh.prototype.AudioHandler.defaultFactory = function audioDefaultFactory(session, options) {
  return new kmh.prototype.AudioHandler(session, options);
};

/**
 * Setup method for this media handler. This method MUST be called before
 * the SIP session starts.
 * @param  {Object} configuration Configuration parameters for the session
 */
kmh.prototype.AudioHandler.setup = function (sdp, rtp, kurento) {
    kmh.prototype.AudioHandler.prototype.sendSdp = sdp;
    kmh.prototype.AudioHandler.prototype.rtp = rtp;
    kmh.prototype.AudioHandler.prototype.Kurento = kurento;

    Logger.info('[mcs-audio-handler] Setting SDP');
};

kmh.prototype.AudioHandler.prototype = {

  isReady: function () { return true; },

  close: function () {
    if (this.timeout) {
      clearTimeout(this.timeout);
      delete this.timeout;
    }
    delete this.session;
  },

  render: function(){},
  mute: function(){},
  unmute: function(){},

  getDescription: async function (onSuccess, onFailure, mediaHint) {
    if(this.endpointSdp === null) {
      Logger.info("[mcs-audio-handler] Processing SDP for Kurento RTP endpoint", this.rtp);
      this.endpointSdp = await this.Kurento.processOffer(this.rtp, this.remote_sdp);
    }
    this.sdp = this.endpointSdp;
    this.timeout = setTimeout(function () {
      delete this.timeout;
      onSuccess(this.sdp);
  }.bind(this), 0);
  },

  setDescription: function (description, onSuccess, onFailure) {
    Logger.debug("  [AudioHandler] Remote SDP: ", description);
    this.remote_sdp = description;
    this.timeout = setTimeout(function () {
      delete this.timeout;
      onSuccess();
    }.bind(this), 0);
  }
};

module.exports = new kmh();
