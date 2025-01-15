import { Tracker } from 'meteor/tracker';
import VoiceCallStates from '/imports/api/voice-call-states';
import CallStateOptions from '/imports/api/voice-call-states/utils/callStates';
import logger from '/imports/startup/client/logger';
import Auth from '/imports/ui/services/auth';
import {
  getAudioConstraints,
  doGUM,
} from '/imports/api/audio/client/bridge/service';
import { getTransportStats } from '/imports/utils/stats';

const MEDIA = Meteor.settings.public.media;
const BASE_BRIDGE_NAME = 'base';
const CALL_TRANSFER_TIMEOUT = MEDIA.callTransferTimeout;
const TRANSFER_TONE = '1';
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
    };

    this.bridgeName = BASE_BRIDGE_NAME;
  }

  getPeerConnection() {
    console.error('The Bridge must implement getPeerConnection');
  }

  exitAudio() {
    console.error('The Bridge must implement exitAudio');
  }

  joinAudio() {
    console.error('The Bridge must implement joinAudio');
  }

  changeInputDevice() {
    console.error('The Bridge must implement changeInputDevice');
  }

  setInputStream() {
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
      const constraints = {
        audio: getAudioConstraints({ deviceId }),
      };

      // Backup stream (current one) in case the switch fails
      if (this.inputStream && this.inputStream.active) {
        backupStream = this.inputStream ? this.inputStream.clone() : null;
        this.inputStream.getAudioTracks().forEach((track) => track.stop());
      }

      newStream = await doGUM(constraints);
      await this.setInputStream(newStream);
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
    return new Promise((resolve, reject) => {
      let trackerControl = null;

      const timeout = setTimeout(() => {
        trackerControl.stop();
        logger.warn({ logCode: 'audio_transfer_timed_out' },
          'Timeout on transferring from echo test to conference');
        this.callback({
          status: this.baseCallStates.failed,
          error: 1008,
          bridgeError: 'Timeout on call transfer',
          bridge: this.bridgeName,
        });

        this.exitAudio();

        reject(this.baseErrorCodes.REQUEST_TIMEOUT);
      }, CALL_TRANSFER_TIMEOUT);

      this.sendDtmf(TRANSFER_TONE);

      Tracker.autorun((c) => {
        trackerControl = c;
        const selector = { meetingId: Auth.meetingID, userId: Auth.userID };
        const query = VoiceCallStates.find(selector);

        query.observeChanges({
          changed: (id, fields) => {
            if (fields.callState === CallStateOptions.IN_CONFERENCE) {
              clearTimeout(timeout);
              transferCallback();

              c.stop();
              resolve();
            }
          },
        });
      });
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
    let transportStats = {};

    if (!peerStats) {
      peer = this.getPeerConnection();

      if (!peer) return null;

      peerStats = await peer.getStats();
    }

    const audioStats = {};

    peerStats.forEach((stat) => {
      if (FILTER_AUDIO_STATS.includes(stat.type)) {
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
