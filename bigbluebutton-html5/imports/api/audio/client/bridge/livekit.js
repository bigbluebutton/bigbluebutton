import { AudioPresets } from 'livekit-client';
import BaseAudioBridge from './base';
import logger from '/imports/startup/client/logger';
import browserInfo from '/imports/utils/browserInfo';
import {
  getAudioConstraints,
  filterSupportedConstraints,
  doGUM,
} from '/imports/api/audio/client/bridge/service';

const BRIDGE_NAME = 'livekit';
const IS_CHROME = browserInfo.isChrome;
const getAudioTrack = (tracks) => {
  // eslint-disable-next-line no-restricted-syntax
  for (const [_, pub] of tracks) {
    if (pub.kind === 'audio') return pub;
  }

  return null;
};

export default class LiveKitAudioBridge extends BaseAudioBridge {
  constructor(userData) {
    super();
    this.userId = userData.userId;
    this.name = userData.username;
    this.sessionToken = userData.sessionToken;
    this.broker = null;
    this.iceServers = [];
    this.bridgeName = BRIDGE_NAME;
    this.supportsTransparentListenOnly = true;
    this._liveKitRoom = null;

    this.handleTermination = this.handleTermination.bind(this);
  }

  set liveKitRoom(room) {
    this._liveKitRoom = room;
  }

  get liveKitRoom() {
    return this._liveKitRoom;
  }

  // eslint-disable-next-line class-methods-use-this
  get inputStream() {
    const track = getAudioTrack(this.liveKitRoom?.localParticipant?.tracks);

    if (track) return track.mediaStream;

    return null;
  }

  get role() {
    return this.broker?.role;
  }

  setInputStream(stream, did) {
    const deviceId = did || this.inputDeviceId;
    this.liveKitRoom.switchActiveDevice('audioinput', did).then((switched) => {
      this.inputDeviceId = deviceId;

      if (switched) {
        logger.debug({
          logCode: 'livekit_switch_device',
          extraInfo: {
            deviceId,
            switched,
          },
        }, `LiveKit: new audio input ${did}`);
      }
    });
  }

  setSenderTrackEnabled(shouldEnable) {
    if (shouldEnable) {
      const SETTINGS = window.meetingClientSettings;
      const LIVEKIT_SETTINGS = SETTINGS.public.media.livekit;
      const publishOptions = LIVEKIT_SETTINGS.publishOptions || {
        audioPreset: AudioPresets.speech,
        dtx: true,
        red: false,
        forceStereo: false,
      };
      const constraints = getAudioConstraints({ deviceId: this.inputDeviceId });

      this.liveKitRoom.localParticipant.setMicrophoneEnabled(
        shouldEnable, constraints, publishOptions,
      ).catch((error) => {
        logger.error({
          logCode: 'livekitaudio_set_sender_track_error',
          extraInfo: {
            errorCode: error.code,
            errorMessage: error.message,
            errorStack: error.stack,
            bridgeName: this.bridgeName,
            role: this.role,
          },
        }, 'Failed to set sender track enabled');
      });
    } else {
      // Unpublish track
      this.liveKitRoom.localParticipant.audioTrackPublications.forEach((trackPub) => {
        trackPub.track?.stop();
        this.liveKitRoom.localParticipant.unpublishTrack(trackPub.track);
      });
    }
  }

  dispatchAutoplayHandlingEvent(mediaElement) {
    const tagFailedEvent = new CustomEvent('audioPlayFailed', {
      detail: { mediaElement },
    });
    window.dispatchEvent(tagFailedEvent);
    this.callback({ status: this.baseCallStates.autoplayBlocked, bridge: this.bridgeName });
  }

  handleTermination() {
    return this.callback({ status: this.baseCallStates.ended, bridge: this.bridgeName });
  }

  handleStart() {
    this.callback({
      status: this.baseCallStates.started,
      bridge: this.bridgeName,
    });
  }

  async _activateAudio(options) {
    const SETTINGS = window.meetingClientSettings;
    const LIVEKIT_SETTINGS = SETTINGS.public.media.livekit;
    const publishOptions = LIVEKIT_SETTINGS.publishOptions || {
      audioPreset: AudioPresets.speech,
      dtx: true,
      red: false,
      forceStereo: false,
    };

    const handleInitError = (_error) => {
      logger.error({
        logCode: 'livekitaudio_init_error',
        extraInfo: {
          errorCode: _error.code,
          errorMessage: _error.message,
          errorStack: _error.stack,
          bridgeName: this.bridgeName,
          role: this.role,
        },
      }, `LiveKit: activate audio failed: ${_error.message}`);
      throw _error;
    };

    try {
      const constraints = getAudioConstraints({ deviceId: this.inputDeviceId });

      await this.liveKitRoom.localParticipant.setMicrophoneEnabled(
        true,
        constraints,
        publishOptions,
      );
      this.handleStart();
    } catch (error) {
      handleInitError(error);
    }
  }

  async joinAudio(options, callback) {
    this.callback = callback;

    return this._activateAudio(options);
  }

  transferCall(onTransferSuccess) {
    this.inEchoTest = false;
    return this.trackTransferState(onTransferSuccess);
  }

  async updateAudioConstraints(constraints) {
    try {
      if (typeof constraints !== 'object') return;

      const matchConstraints = filterSupportedConstraints(constraints);

      if (IS_CHROME) {
        matchConstraints.deviceId = this.inputDeviceId;
        const stream = await doGUM({ audio: matchConstraints });
        await this.setInputStream(stream);
      } else {
        this.inputStream.getAudioTracks()
          .forEach((track) => track.applyConstraints(matchConstraints));
      }
    } catch (error) {
      logger.error({
        logCode: 'livekitaudio_audio_constraint_error',
        extraInfo: {
          errorCode: error.code,
          errorMessage: error.message,
          bridgeName: this.bridgeName,
          role: this.role,
        },
      }, 'Failed to update audio constraint');
    }
  }

  exitAudio() {
    return this.liveKitRoom.localParticipant.setMicrophoneEnabled(false)
      .catch((error) => {
        logger.error({
          logCode: 'livekitaudio_exit_error',
          extraInfo: {
            errorCode: error.code,
            errorMessage: error.message,
            bridgeName: this.bridgeName,
            role: this.role,
          },
        }, 'Failed to exit audio');
      })
      .finally(() => this.handleTermination());
  }
}
