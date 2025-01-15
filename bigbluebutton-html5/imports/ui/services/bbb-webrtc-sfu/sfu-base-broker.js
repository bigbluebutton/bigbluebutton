import logger from '/imports/startup/client/logger';
import { notifyStreamStateChange } from '/imports/ui/services/bbb-webrtc-sfu/stream-state-service';
import { SFU_BROKER_ERRORS } from '/imports/ui/services/bbb-webrtc-sfu/broker-base-errors';

const WS_HEARTBEAT_OPTS = {
  interval: 15000,
  delay: 3000,
};
const ICE_RESTART = 'restartIce';

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
    this.wsHeartbeat = null;
    this.started = false;
    this.signallingTransportOpen = false;
    this.logCodePrefix = `${this.sfuComponent}_broker`;
    this.peerConfiguration = {};
    this.restartIce = false;
    this.restartIceMaxRetries = 3;
    this._restartIceRetries = 0;

    this.onbeforeunload = this.onbeforeunload.bind(this);
    this._onWSError = this._onWSError.bind(this);
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

  _onWSMessage(message) {
    this._updateLastMsgTime();
    this.onWSMessage(message);
  }

  onWSMessage(message) {
    // To be implemented by inheritors
  }

  _onWSError(error) {
    let normalizedError;

    logger.error({
      logCode: `${this.logCodePrefix}_websocket_error`,
      extraInfo: {
        errorMessage: error.name || error.message || 'Unknown error',
        sfuComponent: this.sfuComponent,
      }
    }, 'WebSocket connection to SFU failed');

    if (this.signallingTransportOpen) {
      // 1301: "WEBSOCKET_DISCONNECTED", transport was already open
      normalizedError = BaseBroker.assembleError(1301);
    } else {
      // 1302: "WEBSOCKET_CONNECTION_FAILED", transport errored before establishment
      normalizedError = BaseBroker.assembleError(1302);
    }

    this.onerror(normalizedError);
    return normalizedError;
  }

  openWSConnection () {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.wsUrl);

      this.ws.onmessage = this._onWSMessage.bind(this);

      this.ws.onclose = () => {
        // 1301: "WEBSOCKET_DISCONNECTED",
        this.onerror(BaseBroker.assembleError(1301));
      };

      this.ws.onerror = (error) => reject(this._onWSError(error));

      this.ws.onopen = () => {
        this.setupWSHeartbeat();
        this.signallingTransportOpen = true;
        return resolve();
      };
    });
  }

  closeWs() {
    this.clearWSHeartbeat();

    if (this.ws !== null) {
      this.ws.onclose = function (){};
      this.ws.close();
    }
  }

  _updateLastMsgTime() {
    this.ws.isAlive = true;
    this.ws.lastMsgTime = Date.now();
  }

  _getTimeSinceLastMsg() {
    return Date.now() - this.ws.lastMsgTime;
  }

  setupWSHeartbeat() {
    if (WS_HEARTBEAT_OPTS.interval === 0 || this.ws == null) return;

    this.ws.isAlive = true;
    this.wsHeartbeat = setInterval(() => {
      if (this.ws.isAlive === false) {
        logger.warn({
          logCode: `${this.logCodePrefix}_ws_heartbeat_failed`,
        }, `WS heartbeat failed (${this.sfuComponent})`);
        this.closeWs();
        this._onWSError(new Error('HeartbeatFailed'));
        return;
      }

      if (this._getTimeSinceLastMsg() < (
        WS_HEARTBEAT_OPTS.interval - WS_HEARTBEAT_OPTS.delay
      )) {
        return;
      }

      this.ws.isAlive = false;
      this.ping();
    }, WS_HEARTBEAT_OPTS.interval);

    this.ping();
  }

  clearWSHeartbeat() {
    if (this.wsHeartbeat) {
      clearInterval(this.wsHeartbeat);
    }
  }

  sendMessage (message) {
    const jsonMessage = JSON.stringify(message);

    try {
      this.ws.send(jsonMessage);
    } catch (error) {
      logger.error({
        logCode: `${this.logCodePrefix}_ws_send_error`,
        extraInfo: {
          errorName: error.name,
          errorMessage: error.message,
          sfuComponent: this.sfuComponent,
        },
      }, `Failed to send WebSocket message (${this.sfuComponent})`);
    }
  }

  ping () {
    this.sendMessage({ id: 'ping' });
  }

  _processRemoteDescription(localDescription = null) {
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

  processOffer(sfuResponse) {
    if (this._validateStartResponse(sfuResponse)) {
      this.webRtcPeer.processOffer(sfuResponse.sdpAnswer)
        .then(this._processRemoteDescription.bind(this))
        .catch((error) => {
          logger.error({
            logCode: `${this.logCodePrefix}_processoffer_error`,
            extraInfo: {
              errorMessage: error.name || error.message || 'Unknown error',
              sfuComponent: this.sfuComponent,
            },
          }, `Error processing offer from SFU for ${this.sfuComponent}`);
          // 1305: "PEER_NEGOTIATION_FAILED",
          this.onerror(BaseBroker.assembleError(1305));
        });
    }
  }

  processAnswer(sfuResponse) {
    if (this._validateStartResponse(sfuResponse)) {
      this.webRtcPeer.processAnswer(sfuResponse.sdpAnswer)
        .then(this._processRemoteDescription.bind(this))
        .catch((error) => {
          logger.error({
            logCode: `${this.logCodePrefix}_processanswer_error`,
            extraInfo: {
              errorMessage: error.name || error.message || 'Unknown error',
              sfuComponent: this.sfuComponent,
            },
          }, `Error processing answer from SFU for ${this.sfuComponent}`);
          // 1305: "PEER_NEGOTIATION_FAILED",
          this.onerror(BaseBroker.assembleError(1305));
        });
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
      const { connectionState } = peerConnection;
      const handleFatalFailure = () => {
        if (this.webRtcPeer?.peerConnection) {
          this.webRtcPeer.peerConnection.onconnectionstatechange = null;
        }
        // 1307: "ICE_STATE_FAILED",
        const error = BaseBroker.assembleError(1307);
        this.onerror(error);
      };

      if (eventIdentifier) notifyStreamStateChange(eventIdentifier, connectionState);

      switch (connectionState) {
        case 'closed':
          handleFatalFailure();
          break;

        case 'failed':
          if (!this.restartIce) {
            handleFatalFailure();
          } else {
            try {
              this.requestRestartIce();
            } catch (error) {
              handleFatalFailure();
            }
          }
          break;

        case 'connected':
          if (this._restartIceRetries > 0) {
            this._restartIceRetries = 0;
            logger.info({
              logCode: `${this.logCodePrefix}_ice_restarted`,
              extraInfo: { sfuComponent: this.sfuComponent },
            }, 'ICE restart successful');
          }
          break;

        default:
          break;
      }
    }
  }

  addIceCandidate(candidate) {
    this.webRtcPeer.addIceCandidate(candidate).catch((error) => {
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
        },
      }, 'Adding ICE candidate failed');
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

  // Sends a message to the SFU to restart ICE
  requestRestartIce() {
    if (this._restartIceRetries >= this.restartIceMaxRetries) {
      throw new Error('Max ICE restart retries reached');
    }

    const message = {
      id: ICE_RESTART,
      type: this.sfuComponent,
      role: this.role,
    };

    this._restartIceRetries += 1;
    logger.warn({
      logCode: `${this.logCodePrefix}_restart_ice`,
      extraInfo: {
        sfuComponent: this.sfuComponent,
        retries: this._restartIceRetries,
      },
    }, `Requesting ICE restart (${this._restartIceRetries}/${this.restartIceMaxRetries})`);
    this.sendMessage(message);
  }

  handleRestartIceResponse({ sdp }) {
    if (this.webRtcPeer) {
      this.webRtcPeer.restartIce(sdp, this.offering).catch((error) => {
        logger.error({
          logCode: `${this.logCodePrefix}_restart_ice_error`,
          extraInfo: {
            errorMessage: error?.message,
            errorCode: error?.code,
            errorName: error?.name,
            sfuComponent: this.sfuComponent,
          },
        }, 'ICE restart failed');

        if (this.webRtcPeer?.peerConnection) {
          this.webRtcPeer.peerConnection.onconnectionstatechange = null;
        }

        // 1307: "ICE_STATE_FAILED",
        this.onerror(BaseBroker.assembleError(1307));
      });
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

    if (this.webRtcPeer?.peerConnection) {
      this.webRtcPeer.peerConnection.onconnectionstatechange = null;
    }

    this.closeWs();
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
