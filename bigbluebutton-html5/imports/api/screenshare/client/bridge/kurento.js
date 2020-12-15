import Auth from '/imports/ui/services/auth';
import logger from '/imports/startup/client/logger';
import BridgeService from './service';
import ScreenshareBroker from '/imports/ui/services/bbb-webrtc-sfu/screenshare-broker';
import { setSharingScreen } from '/imports/ui/components/screenshare/service';

const SFU_CONFIG = Meteor.settings.public.kurento;
const SFU_URL = SFU_CONFIG.wsUrl;

const BRIDGE_NAME = 'kurento'
const SCREENSHARE_VIDEO_TAG = 'screenshareVideo';
const SEND_ROLE = 'send';
const RECV_ROLE = 'recv';

const errorCodeMap = {
  1301: 1101,
  1302: 1102,
  1305: 1105,
  1307: 1108, // This should be 1107, but I'm preserving the existing locales - prlanzarin
}

const mapErrorCode = (error) => {
  const { errorCode } = error;
  const mappedErrorCode = errorCodeMap[errorCode];
  if (errorCode == null || mappedErrorCode == null) return error;
  error.errorCode = mappedErrorCode;
  return error;
}

export default class KurentoScreenshareBridge {
  constructor() {
    this.role;
    this.broker;
    this._gdmStream;
    this.hasAudio = false;
    this.connectionAttempts = 0;
    this.reconnecting = false;
    this.reconnectionTimeout;
    this.restartIntervalMs = BridgeService.BASE_MEDIA_TIMEOUT;
  }

  get gdmStream() {
    return this._gdmStream;
  }

  set gdmStream(stream) {
    this._gdmStream = stream;
  }

  outboundStreamReconnect() {
    const currentRestartIntervalMs = this.restartIntervalMs;
    const stream = this.gdmStream;

    logger.warn({
      logCode: 'screenshare_presenter_reconnect',
      extraInfo: {
        reconnecting: this.reconnecting,
        role: this.role,
        bridge: BRIDGE_NAME
      },
    }, `Screenshare presenter session is reconnecting`);

    this.stop();
    this.restartIntervalMs = BridgeService.getNextReconnectionInterval(currentRestartIntervalMs);
    this.share(stream, this.onerror).then(() => {
      this.clearReconnectionTimeout();
    }).catch(error => {
      // Error handling is a no-op because it will be "handled" in handlePresenterFailure
      logger.debug({
        logCode: 'screenshare_reconnect_failed',
        extraInfo: {
          errorMessage: error.errorMessage,
          reconnecting: this.reconnecting,
          role: this.role,
          bridge: BRIDGE_NAME
        },
      }, 'Screensharing reconnect failed');
    });
  }

  inboundStreamReconnect() {
    const currentRestartIntervalMs = this.restartIntervalMs;

    logger.warn({
      logCode: 'screenshare_viewer_reconnect',
      extraInfo: {
        reconnecting: this.reconnecting,
        role: this.role,
        bridge: BRIDGE_NAME
      },
    }, `Screenshare viewer session is reconnecting`);

    // Cleanly stop everything before triggering a reconnect
    this.stop();
    // Create new reconnect interval time
    this.restartIntervalMs = BridgeService.getNextReconnectionInterval(currentRestartIntervalMs);
    this.view(this.hasAudio).then(() => {
      this.clearReconnectionTimeout();
    }).catch(error => {
      // Error handling is a no-op because it will be "handled" in handleViewerFailure
      logger.debug({
        logCode: 'screenshare_reconnect_failed',
        extraInfo: {
          errorMessage: error.errorMessage,
          reconnecting: this.reconnecting,
          role: this.role,
          bridge: BRIDGE_NAME
        },
      }, 'Screensharing reconnect failed');
    });
  }

  handleConnectionTimeoutExpiry() {
    this.reconnecting = true;

    switch (this.role) {
      case RECV_ROLE:
        return this.inboundStreamReconnect();
      case SEND_ROLE:
        return this.outboundStreamReconnect();
      default:
        this.reconnecting = false;
        logger.error({
          logCode: 'screenshare_invalid_role'
        }, 'Screen sharing with invalid role, wont reconnect');
        break;
    }
  }

  maxConnectionAttemptsReached () {
    return this.connectionAttempts > BridgeService.MAX_CONN_ATTEMPTS;
  }

  scheduleReconnect () {
    if (this.reconnectionTimeout == null) {
      this.reconnectionTimeout = setTimeout(
        this.handleConnectionTimeoutExpiry.bind(this),
        this.restartIntervalMs
      );
    }
  }

  clearReconnectionTimeout () {
    this.reconnecting = false;
    this.restartIntervalMs = BridgeService.BASE_MEDIA_TIMEOUT;

    if (this.reconnectionTimeout) {
      clearTimeout(this.reconnectionTimeout);
      this.reconnectionTimeout = null;
    }
  }

  handleViewerStart() {
    const mediaElement = document.getElementById(SCREENSHARE_VIDEO_TAG);

    if (mediaElement && this.broker && this.broker.webRtcPeer) {
      const stream = this.broker.webRtcPeer.getRemoteStream();
      BridgeService.screenshareLoadAndPlayMediaStream(stream, mediaElement, !this.broker.hasAudio);
    }

    this.clearReconnectionTimeout();
  }

  handleBrokerFailure(error) {
    mapErrorCode(error);
    const { errorMessage, errorCause, errorCode } = error;

    logger.error({
      logCode: 'screenshare_failure',
      extraInfo: {
        errorMessage, errorCode, errorCause,
        role: this.broker.role,
        started: this.broker.started,
        reconnecting: this.reconnecting,
        bridge: BRIDGE_NAME
      },
    }, 'Screenshare broker failure');

    // Screensharing was already successfully negotiated and error occurred during
    // during call; schedule a reconnect
    // If the session has not yet started, a reconnect should already be scheduled
    if (this.broker.started) {
      this.scheduleReconnect();
    }

    return error;
  }

  async view(hasAudio = false) {
    this.hasAudio = hasAudio;
    this.role = RECV_ROLE;
    const iceServers = await BridgeService.getIceServers(Auth.sessionToken);
    const options = {
      iceServers,
      userName: Auth.fullname,
      hasAudio,
    };

    this.broker = new ScreenshareBroker(
      Auth.authenticateURL(SFU_URL),
      BridgeService.getConferenceBridge(),
      Auth.userID,
      Auth.meetingID,
      this.role,
      options,
    );

    this.broker.onstart = this.handleViewerStart.bind(this);
    this.broker.onerror = this.handleBrokerFailure.bind(this);
    return this.broker.view().finally(this.scheduleReconnect.bind(this));
  }

  handlePresenterStart() {
    logger.info({
      logCode: 'screenshare_presenter_start_success',
    }, 'Screenshare presenter started succesfully');
    this.clearReconnectionTimeout();
    this.reconnecting = false;
    this.connectionAttempts = 0;
  }

  share(stream, onFailure) {
    return new Promise(async (resolve, reject) => {
      this.onerror = onFailure;
      this.connectionAttempts += 1;
      this.role = SEND_ROLE;
      this.hasAudio = BridgeService.streamHasAudioTrack(stream);
      this.gdmStream = stream;

      const onerror = (error) => {
        const normalizedError = this.handleBrokerFailure(error);
        if (this.maxConnectionAttemptsReached()) {
          this.clearReconnectionTimeout();
          this.connectionAttempts = 0;
          onFailure({
            errorCode: 1120,
            errorMessage: `MAX_CONNECTION_ATTEMPTS_REACHED`,
          });

          return reject({ errorCode: 1120, errorMessage: "MAX_CONNECTION_ATTEMPTS_REACHED" });
        }
      };

      const iceServers = await BridgeService.getIceServers(Auth.sessionToken);
      const options = {
        iceServers,
        userName: Auth.fullname,
        stream,
        hasAudio: this.hasAudio,
      };

      this.broker = new ScreenshareBroker(
        Auth.authenticateURL(SFU_URL),
        BridgeService.getConferenceBridge(),
        Auth.userID,
        Auth.meetingID,
        this.role,
        options,
      );

      this.broker.onerror = onerror.bind(this);
      this.broker.onstreamended = this.stop.bind(this);
      this.broker.onstart = this.handlePresenterStart.bind(this);

      this.broker.share().then(() => {
          this.scheduleReconnect();
          return resolve();
        }).catch(reject);
    });
  };

  stop() {
    if (this.broker) {
      this.broker.stop();
      // Checks if this session is a sharer and if it's not reconnecting
      // If that's the case, clear the local sharing state in screen sharing UI
      // component tracker to be extra sure we won't have any client-side state
      // inconsistency - prlanzarin
      if (this.broker.role === SEND_ROLE && !this.reconnecting) setSharingScreen(false);
      this.broker = null;
    }
    this.gdmStream = null;
    this.clearReconnectionTimeout();
  }
}
