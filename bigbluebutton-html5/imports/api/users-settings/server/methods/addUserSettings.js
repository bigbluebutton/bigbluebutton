import { check } from 'meteor/check';
import addUserSetting from '/imports/api/users-settings/server/modifiers/addUserSetting';
import Logger from '/imports/startup/server/logger';

const handledHTML5Parameters = [
  // APP
  'autoJoin',
  'listenOnlyMode',
  'forceListenOnly',
  'skipCheck',
  'clientTitle',
  'lockOnJoin',
  'askForFeedbackOnLogout',
  // BRANDING
  'displayBrandingArea',
  // SHORTCUTS
  'shortcuts',
  // KURENTO
  'enableScreensharing',
  'enableVideo',
  'enableVideoStats',
  'autoShareWebcam',
  // WHITEBOARD
  'multiUserPenOnly',
  'presenterTools',
  'multiUserTools',
  // SKINNING/THEMMING
  'customStyle',
  'customStyleUrl',
  // LAYOUT
  'autoSwapLayout',
  'hidePresentation',
  // OUTSIDE COMMANDS
  'outsideToggleSelfVoice',
  'outsideToggleRecording',
];

const newParameterNames = [
  'bbb_auto_join_audio',
  'bbb_auto_share_webcam',
  'bbb_auto_swap_layout',
  'bbb_custom_style',
  'bbb_hide_presentation',
  'bbb_listen_only_mode',
  'bbb_outside_toggle_recording',
  'bbb_outside_toggle_self_voice',
  'bbb_shortcuts',
  'bbb_skip_check_audio',
];

const newParametersToMongoProperty = {
  bbb_auto_join_audio: 'autoJoin',
  bbb_auto_share_webcam: 'autoShareWebcam',
  bbb_auto_swap_layout: 'autoSwapLayout',
  bbb_custom_style: 'customStyle',
  bbb_hide_presentation: 'hidePresentation',
  bbb_listen_only_mode: 'listenOnlyMode',
  bbb_outside_toggle_recording: 'outsideToggleRecording',
  bbb_outside_toggle_self_voice: 'outsideToggleSelfVoice',
  bbb_shortcuts: 'shortcuts',
  bbb_skip_check_audio: 'skipCheck',
};

function getKeyByValue(value) {
  return Object.keys(newParametersToMongoProperty).find(key => newParametersToMongoProperty[key] === value);
}

export default function addUserSettings(credentials, meetingId, userId, settings) {
  check(meetingId, String);
  check(userId, String);
  check(settings, [Object]);

  const customData = settings
    .filter((item, idx, arr) => {
      const key = Object.keys(item).shift();
      const keys = arr.map(i => Object.keys(i).shift());
      if (newParametersToMongoProperty[key]) return true;
      return !keys.includes(getKeyByValue(key));
    })
    .reduce((acc, data, idx, arr) => {
      let key = Object.keys(data).shift();

      let value = null;
      if (handledHTML5Parameters.includes(key)) {
        value = data[key];
      }

      if (newParameterNames.includes(key)) {
        value = data[key];
        const newKey = newParametersToMongoProperty[key];
        key = newKey;
      }

      try {
        value = JSON.parse(value);
      } catch (e) {
        Logger.error(`Caught: ${e.message}`);
      }

      return { ...acc, [key]: value };
    }, {});

  const settingsAdded = [];

  Object.entries(customData).forEach((el) => {
    const setting = el[0];
    const value = el[1];
    settingsAdded.push(addUserSetting(meetingId, userId, setting, value));
  });

  return settingsAdded;
}
