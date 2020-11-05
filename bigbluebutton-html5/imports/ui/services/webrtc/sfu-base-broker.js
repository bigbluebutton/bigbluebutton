import logger from '/imports/startup/client/logger';
import { notifyStreamStateChange } from '/imports/ui/services/webrtc/stream-state-service';

const PING_INTERVAL_MS = 15000;

class BaseBroker {
  constructor(sfuComponent, wsUrl) {
    this.wsUrl = wsUrl;
    this.sfuComponent = sfuComponent;
    this.ws = null;
    this.webRtcPeer = null;
    this.pingInterval = null;
    this.started = false;
    this.logCodePrefix = `${this.sfuComponent}_broker`;
  }

  openWSConnection () {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.wsUrl);

      this.ws.onmessage = this.onWSMessage.bind(this);

      this.ws.onclose = () => {
        logger.error({
          logCode: `${this.logCodePrefix}_websocket_closed`,
          extraInfo: { sfuComponent: this.sfuComponent },
        }, 'WebSocket connection to SFU closed unexpectedly');
        this.onFailure('Websocket connection closed');
      };

      this.ws.onerror = (error) => {
        logger.error({
          logCode: `${this.logCodePrefix}_websocket_error`,
          extraInfo: {
            errorMessage: error.name || error.message || 'Unknown error',
            sfuComponent: this.sfuComponent,
          }
        }, 'Error in the WebSocket connection to SFU');
        this.onFailure('Websocket connection error');
        return reject(error);
      };

      this.ws.onopen = () => {
        this.pingInterval = setInterval(this.ping.bind(this), PING_INTERVAL_MS);
        return resolve();
      };
    });
  }

  sendMessage (message) {
    const jsonMessage = JSON.stringify(message);
    this.ws.send(jsonMessage);
  }

  ping () {
    const message = {
      id: 'ping',
    };
    this.sendMessage({ id: 'ping' });
  }

  processAnswer (message) {
    const { response, sdpAnswer, role, connectionId } = message;

    if (response !== 'accepted') {
      return this.handleSFUError(message);
    }

    logger.debug({
      logCode: `${this.logCodePrefix}_start_success`,
      extraInfo: {
        sfuConnectionId: connectionId,
        role,
        sfuComponent: this.sfuComponent,
      }
    }, `Start request accepted for ${this.sfuComponent}`);

    this.webRtcPeer.processAnswer(sdpAnswer, (error) => {
      if (error) {
        logger.error({
          logCode: `${this.logCodePrefix}_processanswer_error`,
          extraInfo: {
            errorMessage: error.name || error.message || 'Unknown error',
            sfuConnectionId: connectionId,
            role,
            sfuComponent: this.sfuComponent,
          }
        }, `Error processing SDP answer from SFU for ${this.sfuComponent}`);

        return this.onFailure(error);
      }

      // Mark the peer as negotiated and flush the ICE queue
      this.webRtcPeer.negotiated = true;
      this.processIceQueue();
    });
  }

  addIceServers (options) {
    if (this.iceServers && this.iceServers.length > 0) {
      options.configuration = {};
      options.configuration.iceServers = this.iceServers;
    }

    return options;
  }

  handleConnectionStateChange (errorMessage, errorCode, eventIdentifier) {
    if (this.webRtcPeer) {
      const { peerConnection } = this.webRtcPeer;
      const connectionState = peerConnection.connectionState;

      if (eventIdentifier) {
        notifyStreamStateChange(eventIdentifier, connectionState);
      }

      if (connectionState === 'failed' || connectionState === 'closed') {
        this.webRtcPeer.peerConnection.onconnectionstatechange = null;
        logger.error({
          logCode: `${this.logCodePrefix}_connection_state_failed`,
          extraInfo: {
            errorCode, errorMessage, connectionState, sfuComponent: this.sfuComponent,
          }
        }, `RTCPeerConnection connectionState reached final state`);
        this.onFailure({ errorMessage, errorCode });
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
            sfuComponent: this.sfuComponent,
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
    this.onSuccess = function(){};
    this.onFailure = function(){};
    this.started = false;

    if (this.webRtcPeer) {
      this.webRtcPeer.peerConnection.onconnectionstatechange = null;
    }

    if (this.ws !== null) {
      this.ws.onclose = function () {};
      this.ws.close();
    }

    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }

    this.disposePeer();

    logger.debug({
      logCode: `${this.logCodePrefix}_stop`,
      extraInfo: { sfuComponent: this.sfuComponent },
    }, `Stopped broker session for ${this.sfuComponent}`);
  }
}

export default BaseBroker;
