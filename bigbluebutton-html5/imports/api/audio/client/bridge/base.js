import { Tracker } from 'meteor/tracker';
import VoiceCallStates from '/imports/api/voice-call-states';
import CallStateOptions from '/imports/api/voice-call-states/utils/callStates';
import logger from '/imports/startup/client/logger';
import Auth from '/imports/ui/services/auth';
import {
  DEFAULT_INPUT_DEVICE_ID,
  reloadAudioElement
} from '/imports/api/audio/client/bridge/service';

const MEDIA = Meteor.settings.public.media;
const BASE_BRIDGE_NAME = 'base';
const CALL_TRANSFER_TIMEOUT = MEDIA.callTransferTimeout;
const TRANSFER_TONE = '1';
const MEDIA_TAG = MEDIA.mediaTag;

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

  sendDtmf() {
    console.error('The Bridge must implement sendDtmf');
  }

  setDefaultInputDevice() {
    this.inputDeviceId = DEFAULT_INPUT_DEVICE_ID;
  }

  async changeInputDeviceId(inputDeviceId) {
    if (!inputDeviceId) {
      throw new Error();
    }

    this.inputDeviceId = inputDeviceId;
    return inputDeviceId;
  }

  async changeOutputDevice(value, isLive) {
    const audioElement = document.querySelector(MEDIA_TAG);

    if (audioElement.setSinkId) {
      try {
        if (!isLive) {
          audioElement.srcObject = null;
        }

        await audioElement.setSinkId(value);
        reloadAudioElement(audioElement);
        logger.debug({
          logCode: 'audio_reload_audio_element',
          extraInfo: {
            bridgeName: this.bridgeName,
            deviceId: value,
            isLive,
          },
        }, 'Audio element reloaded after changing output device');

        this.outputDeviceId = value;
      } catch (error) {
        logger.error({
          logCode: 'audio_changeoutputdevice_error',
          extraInfo: {
            bridgeName: this.bridgeName,
            deviceId: value,
            isLive,
            errorName: error.name,
            errorMessage: error.message,
          },
        }, `Change output device failed: ${error.name}`);
        throw new Error(this.baseErrorCodes.MEDIA_ERROR);
      }
    }

    return this.outputDeviceId;
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
}
