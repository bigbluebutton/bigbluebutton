import getFromUserSettings from '/imports/ui/services/users-settings';
import Storage from '/imports/ui/services/storage/session';
import logger from '/imports/startup/client/logger';
import { makeCall } from '/imports/ui/services/api';
import AudioManager from '/imports/ui/services/audio-manager';

const MUTED_KEY = 'muted';
const APP_CONFIG = Meteor.settings.public.app;
const TOGGLE_MUTE_THROTTLE_TIME = Meteor.settings.public.media.toggleMuteThrottleTime;
const DEVICE_LABEL_MAX_LENGTH = 40;
const CLIENT_DID_USER_SELECTED_MICROPHONE_KEY = 'clientUserSelectedMicrophone';
const CLIENT_DID_USER_SELECTED_LISTEN_ONLY_KEY = 'clientUserSelectedListenOnly';

export const handleLeaveAudio = (meetingIsBreakout: boolean) => {
  if (!meetingIsBreakout) {
    Storage.setItem(CLIENT_DID_USER_SELECTED_MICROPHONE_KEY, !!false);
    Storage.setItem(CLIENT_DID_USER_SELECTED_LISTEN_ONLY_KEY, !!false);
  }

  const skipOnFistJoin = getFromUserSettings(
    'bbb_skip_check_audio_on_first_join',
    APP_CONFIG.skipCheckOnJoin
  );
  if (skipOnFistJoin && !Storage.getItem('getEchoTest')) {
    Storage.setItem('getEchoTest', true);
  }

  AudioManager.forceExitAudio();
  logger.info(
    {
      logCode: 'audiocontrols_leave_audio',
      extraInfo: { logType: 'user_action' },
    },
    'audio connection closed by user'
  );
};

export const toggleMuteMicrophone = (muted: boolean) => {
  Storage.setItem(MUTED_KEY, !muted);

  if (muted) {
    logger.info(
      {
        logCode: 'audiomanager_unmute_audio',
        extraInfo: { logType: 'user_action' },
      },
      'microphone unmuted by user'
    );
    makeCall('toggleVoice');
  } else {
    logger.info(
      {
        logCode: 'audiomanager_mute_audio',
        extraInfo: { logType: 'user_action' },
      },
      'microphone muted by user'
    );
    makeCall('toggleVoice');
  }
};

export const truncateDeviceName = (deviceName: string) => {
  if (deviceName && deviceName.length <= DEVICE_LABEL_MAX_LENGTH) {
    return deviceName;
  }
  return `${deviceName.substring(0, DEVICE_LABEL_MAX_LENGTH - 3)}...`;
};

export const notify = (message: string, error: boolean, icon?: string) => {
  AudioManager.notify(message, error, icon);
};

export const liveChangeInputDevice = (inputDeviceId: string) =>
  AudioManager.liveChangeInputDevice(inputDeviceId);

export const liveChangeOutputDevice = (inputDeviceId: string, isLive: boolean) =>
  AudioManager.changeOutputDevice(inputDeviceId, isLive);

export default {
  handleLeaveAudio,
  toggleMuteMicrophone,
  truncateDeviceName,
  notify,
  liveChangeInputDevice,
};
