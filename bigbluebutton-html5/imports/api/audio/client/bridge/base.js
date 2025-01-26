import logger from '/imports/startup/client/logger';
import {
  getAudioConstraints,
  doGUM,
} from '/imports/api/audio/client/bridge/service';
import { getTransportStats } from '/imports/utils/stats';

const BASE_BRIDGE_NAME = 'base';
/**
 * Audio status to be filtered in getStats()
 */
const FILTER_AUDIO_STATS = [
  'outbound-rtp',
  'inbound-rtp',
  'candidate-pair',
  'local-candidate',
  'transport',
];

export default class BaseAudioBridge {
  constructor(userData) {
    this.userData = userData;

    this.baseErrorCodes = {
      INVALID_TARGET: 'INVALID_TARGET',
      CONNECTION_ERROR: 'CONNECTION_ERROR',
      REQUEST_TIMEOUT: 'REQUEST_TIMEOUT',
      GENERIC_ERROR: 'GENERIC_ERROR',
      MEDIA_ERROR: 'MEDIA_ERROR',
      WEBRTC_NOT_SUPPORTED: 'WEBRTC_NOT_SUPPORTED',
      ICE_NEGOTIATION_FAILED: 'ICE_NEGOTIATION_FAILED',
    };

    this.baseCallStates = {
      started: 'started',
      ended: 'ended',
      failed: 'failed',
      reconnecting: 'reconnecting',
      autoplayBlocked: 'autoplayBlocked',
      audioPublished: 'audioPublished',
    };

    this.bridgeName = BASE_BRIDGE_NAME;
  }

  getPeerConnection() {
    console.error('The Bridge must implement getPeerConnection');
  }

  exitAudio() {
    console.error('The Bridge must implement exitAudio');
  }

  joinAudio(options, callback) {
    console.error('The Bridge must implement joinAudio');
  }

  changeInputDevice() {
    console.error('The Bridge must implement changeInputDevice');
  }

  setInputStream(inputStream, {
    deviceId = null,
    force = false,
  } = {}) {
    console.error('The Bridge must implement setInputStream');
  }

  sendDtmf() {
    console.error('The Bridge must implement sendDtmf');
  }

  set inputDeviceId (deviceId) {
    this._inputDeviceId = deviceId;
  }

  get inputDeviceId () {
    return this._inputDeviceId;
  }

  setSenderTrackEnabled(shouldEnable) {
    const peer = this.getPeerConnection();

    if (!peer) return;

    peer.getSenders().forEach((sender) => {
      const { track } = sender;
      if (track && track.kind === 'audio') {
        track.enabled = shouldEnable;
      }
    });
  }

  /* eslint-disable class-methods-use-this */
  supportsTransparentListenOnly() {
    return false;
  }

  /**
   * Change the input device with the given deviceId, without renegotiating
   * peer.
   * A new MediaStream object is created for the given deviceId. This object
   * is returned by the resolved promise.
   * @param  {String}  deviceId The id of the device to be set as input
   * @return {Promise}          A promise that is resolved with the MediaStream
   *                            object after changing the input device.
   */
  async liveChangeInputDevice(deviceId) {
    let newStream;
    let backupStream;

    try {
      // Remove all input audio tracks from the stream
      // This will effectively mute the microphone
      // and keep the audio output working
      if (deviceId === 'listen-only') {
        const stream = this.inputStream;
        if (stream) {
          stream.getAudioTracks().forEach((track) => {
            track.stop();
            stream.removeTrack(track);
          });
        }
        return stream;
      }

      const constraints = {
        audio: getAudioConstraints({ deviceId }),
      };

      // Backup stream (current one) in case the switch fails
      if (this.inputStream && this.inputStream.active) {
        backupStream = this.inputStream ? this.inputStream.clone() : null;
        this.inputStream.getAudioTracks().forEach((track) => track.stop());
      }

      newStream = await doGUM(constraints);
      await this.setInputStream(newStream, { deviceId });
      if (backupStream && backupStream.active) {
        backupStream.getAudioTracks().forEach((track) => track.stop());
        backupStream = null;
      }

      return newStream;
    } catch (error) {
      // Device change failed. Clean up the tentative new stream to avoid lingering
      // stuff, then try to rollback to the previous input stream.
      if (newStream && typeof newStream.getAudioTracks === 'function') {
        newStream.getAudioTracks().forEach((t) => t.stop());
        newStream = null;
      }

      // Rollback to backup stream
      if (backupStream && backupStream.active) {
        this.setInputStream(backupStream).catch((rollbackError) => {
          logger.error({
            logCode: 'audio_changeinputdevice_rollback_failure',
            extraInfo: {
              bridgeName: this.bridgeName,
              deviceId,
              errorName: rollbackError.name,
              errorMessage: rollbackError.message,
            },
          }, 'Microphone device change rollback failed - the device may become silent');

          backupStream.getAudioTracks().forEach((track) => track.stop());
          backupStream = null;
        });
      }

      throw error;
    }
  }

  trackTransferState(transferCallback) {
    return new Promise((resolve) => {
      transferCallback();
      resolve();
    });
  }

  /**
   * Get stats about active audio peer.
   * We filter the status based on FILTER_AUDIO_STATS constant.
   * We also append to the returned object the information about peer's
   * transport. This transport information is retrieved by
   * getTransportStatsFromPeer().
   *
   * @returns An Object containing the status about the active audio peer.
   *
   * For more information see:
   * https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/getStats
   * and
   * https://developer.mozilla.org/en-US/docs/Web/API/RTCStatsReport
   */
  async getStats(stats) {
    let peer;
    let peerStats = stats;

    if (!peerStats) {
      peer = this.getPeerConnection();

      if (!peer) return null;

      peerStats = await peer.getStats();
    }

    return this.parseStats(peerStats, peer);
  }

  /**
  * Parses the provided statistics, filters audio stats, and fetches transport stats for the
  * given peer.
  *
  * @param stats - An array of statistics objects containing various types of stats.
  * @param peer - The peer object representing the connection for which transport stats
  *  need to be fetched.
  *
  * @returns A promise that resolves to an object containing the transport stats and audio stats.
  * The object will include `transportStats` from the `getTransportStats` function and the filtered
  * `audioStats`.
  *
  */
  async parseStats(stats, peer) {
    let transportStats = {};
    const audioStats = {};

    stats.forEach((stat) => {
      if (FILTER_AUDIO_STATS.includes(stat.type) && (!stat.kind || stat.kind === 'audio')) {
        audioStats[stat.id] = stat;
      }
    });

    try {
      transportStats = await getTransportStats(peer, audioStats);
    } catch (error) {
      logger.debug({
        logCode: 'audio_transport_stats_failed',
        extraInfo: {
          errorCode: error.errorCode,
          errorMessage: error.errorMessage,
          bridgeName: this.bridgeName,
        },
      }, 'Failed to get transport stats for audio');
    }

    return { transportStats, ...audioStats };
  }
}
