import logger from '/imports/startup/client/logger';
import { notifyStreamStateChange } from '/imports/ui/services/bbb-webrtc-sfu/stream-state-service';
import { SFU_BROKER_ERRORS } from '/imports/ui/services/bbb-webrtc-sfu/broker-base-errors';

const PING_INTERVAL_MS = 15000;

class BaseBroker {
  static assembleError(code, reason) {
    const message = reason || SFU_BROKER_ERRORS[code];
    const error = new Error(message);
    error.errorCode = code;
    // Duplicating key-vals because we can't settle on an error pattern... - prlanzarin
    error.errorCause = error.message;
    error.errorMessage = error.message;

    return error;
  }

  constructor(sfuComponent, wsUrl) {
    this.wsUrl = wsUrl;
    this.sfuComponent = sfuComponent;
    this.ws = null;
    this.webRtcPeer = null;
    this.pingInterval = null;
    this.started = false;
    this.signallingTransportOpen = false;
    this.logCodePrefix = `${this.sfuComponent}_broker`;
    this.peerConfiguration = {};

    this.onbeforeunload = this.onbeforeunload.bind(this);
    window.addEventListener('beforeunload', this.onbeforeunload);
  }

  set started (val) {
    this._started = val;
  }

  get started () {
    return this._started;
  }

  onbeforeunload () {
    return this.stop();
  }

  onstart () {
    // To be implemented by inheritors
  }

  onerror (error) {
    // To be implemented by inheritors
  }

  onended () {
    // To be implemented by inheritors
  }

  handleSFUError (sfuResponse) {
    // To be implemented by inheritors
  }

  sendLocalDescription (localDescription) {
    // To be implemented by inheritors
  }

  openWSConnection () {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.wsUrl);

      this.ws.onmessage = this.onWSMessage.bind(this);

      this.ws.onclose = () => {
        // 1301: "WEBSOCKET_DISCONNECTED",
        this.onerror(BaseBroker.assembleError(1301));
      };

      this.ws.onerror = (error) => {
        logger.error({
          logCode: `${this.logCodePrefix}_websocket_error`,
          extraInfo: {
            errorMessage: error.name || error.message || 'Unknown error',
            sfuComponent: this.sfuComponent,
          }
        }, 'WebSocket connection to SFU failed');

        if (this.signallingTransportOpen) {
          // 1301: "WEBSOCKET_DISCONNECTED", transport was already open
          this.onerror(BaseBroker.assembleError(1301));
        } else {
          // 1302: "WEBSOCKET_CONNECTION_FAILED", transport errored before establishment
          const normalized1302 = BaseBroker.assembleError(1302);
          this.onerror(normalized1302);
          return reject(normalized1302);
        }
      };

      this.ws.onopen = () => {
        this.pingInterval = setInterval(this.ping.bind(this), PING_INTERVAL_MS);
        this.signallingTransportOpen = true;
        return resolve();
      };
    });
  }

  sendMessage (message) {
    const jsonMessage = JSON.stringify(message);
    this.ws.send(jsonMessage);
  }

  ping () {
    this.sendMessage({ id: 'ping' });
  }

  _handleRemoteDescriptionProcessing (error, localDescription = null) {
    if (error) {
      logger.error({
        logCode: `${this.logCodePrefix}_processanswer_error`,
        extraInfo: {
          errorMessage: error.name || error.message || 'Unknown error',
          sfuComponent: this.sfuComponent,
        }
      }, `Error processing SDP answer from SFU for ${this.sfuComponent}`);
      // 1305: "PEER_NEGOTIATION_FAILED",
      return this.onerror(BaseBroker.assembleError(1305));
    }

    // There is a new local description; send it back to the server
    if (localDescription) this.sendLocalDescription(localDescription);

    // Mark the peer as negotiated and flush the ICE queue
    this.webRtcPeer.negotiated = true;
    this.processIceQueue();
  }

  _validateStartResponse (sfuResponse) {
    const { response, role } = sfuResponse;

    if (response !== 'accepted') {
      this.handleSFUError(sfuResponse);
      return false;
    }

    logger.debug({
      logCode: `${this.logCodePrefix}_start_success`,
      extraInfo: {
        role,
        sfuComponent: this.sfuComponent,
      }
    }, `Start request accepted for ${this.sfuComponent}`);

    return true;
  }

  processOffer (sfuResponse) {
    if (this._validateStartResponse(sfuResponse)) {
      this.webRtcPeer.processOffer(
        sfuResponse.sdpAnswer,
        this._handleRemoteDescriptionProcessing.bind(this)
      );
    }
  }

  processAnswer (sfuResponse) {
    if (this._validateStartResponse(sfuResponse)) {
      this.webRtcPeer.processAnswer(
        sfuResponse.sdpAnswer,
        this._handleRemoteDescriptionProcessing.bind(this)
      );
    }
  }

  populatePeerConfiguration () {
    this.addIceServers();
    if (this.forceRelay) {
      this.setRelayTransportPolicy();
    }

    return this.peerConfiguration;
  }

  addIceServers () {
    if (this.iceServers && this.iceServers.length > 0) {
      this.peerConfiguration.iceServers = this.iceServers;
    }
  }

  setRelayTransportPolicy () {
    this.peerConfiguration.iceTransportPolicy = 'relay';
  }

  handleConnectionStateChange (eventIdentifier) {
    if (this.webRtcPeer) {
      const { peerConnection } = this.webRtcPeer;
      const connectionState = peerConnection.connectionState;
      if (eventIdentifier) {
        notifyStreamStateChange(eventIdentifier, connectionState);
      }

      if (connectionState === 'failed' || connectionState === 'closed') {
        this.webRtcPeer.peerConnection.onconnectionstatechange = null;
        // 1307: "ICE_STATE_FAILED",
        const error = BaseBroker.assembleError(1307);
        this.onerror(error);
      }
    }
  }

  addIceCandidate (candidate) {
    this.webRtcPeer.addIceCandidate(candidate, (error) => {
      if (error) {
        // Just log the error. We can't be sure if a candidate failure on add is
        // fatal or not, so that's why we have a timeout set up for negotiations and
        // listeners for ICE state transitioning to failures, so we won't act on it here
        logger.error({
          logCode: `${this.logCodePrefix}_addicecandidate_error`,
          extraInfo: {
            errorMessage: error.name || error.message || 'Unknown error',
            errorCode: error.code || 'Unknown code',
            sfuComponent: this.sfuComponent,
            started: this.started,
          }
        }, `Adding ICE candidate failed`);
      }
    });
  }

  processIceQueue () {
    const peer = this.webRtcPeer;
    while (peer.iceQueue.length) {
      const candidate = peer.iceQueue.shift();
      this.addIceCandidate(candidate);
    }
  }

  handleIceCandidate (candidate) {
    const peer = this.webRtcPeer;

    if (peer.negotiated) {
      this.addIceCandidate(candidate);
    } else {
      // ICE candidates are queued until a SDP answer has been processed.
      // This was done due to a long term iOS/Safari quirk where it'd (as of 2018)
      // fail if candidates were added before the offer/answer cycle was completed.
      // IT STILL HAPPENS - prlanzarin sept 2019
      // still happens - prlanzarin sept 2020
      peer.iceQueue.push(candidate);
    }
  }

  disposePeer () {
    if (this.webRtcPeer) {
      this.webRtcPeer.dispose();
      this.webRtcPeer = null;
    }
  }

  stop () {
    this.onstart = function(){};
    this.onerror = function(){};
    window.removeEventListener('beforeunload', this.onbeforeunload);

    if (this.webRtcPeer) {
      this.webRtcPeer.peerConnection.onconnectionstatechange = null;
    }

    if (this.ws !== null) {
      this.ws.onclose = function (){};
      this.ws.close();
    }

    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }

    this.disposePeer();
    this.started = false;

    logger.debug({
      logCode: `${this.logCodePrefix}_stop`,
      extraInfo: { sfuComponent: this.sfuComponent },
    }, `Stopped broker session for ${this.sfuComponent}`);

    this.onended();
    this.onended = function(){};
  }
}

export default BaseBroker;
