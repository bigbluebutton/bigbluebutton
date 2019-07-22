import { check } from 'meteor/check';
import addUserSetting from '/imports/api/users-settings/server/modifiers/addUserSetting';

const oldParameters = {
  autoJoin: 'bbb_auto_join_audio',
  listenOnlyMode: 'bbb_listen_only_mode',
  skipCheck: 'bbb_skip_check_audio',
  shortcuts: 'bbb_shortcuts',
  autoShareWebcam: 'bbb_auto_share_webcam',
  customStyle: 'bbb_custom_style',
  autoSwapLayout: 'bbb_auto_swap_layout',
  hidePresentation: 'bbb_hide_presentation',
  outsideToggleSelfVoice: 'bbb_outside_toggle_self_voice',
  outsideToggleRecording: 'bbb_outside_toggle_recording',
};

const oldParametersKeys = Object.keys(oldParameters);

const currentParameters = [
  // APP
  'bbb_auto_join_audio',
  'bbb_listen_only_mode',
  'forceListenOnly',
  'bbb_skip_check_audio',
  'clientTitle',
  'lockOnJoin',
  'askForFeedbackOnLogout',
  // BRANDING
  'displayBrandingArea',
  // SHORTCUTS
  'bbb_shortcuts',
  // KURENTO
  'enableScreensharing',
  'enableVideo',
  'enableVideoStats',
  'bbb_auto_share_webcam',
  // WHITEBOARD
  'multiUserPenOnly',
  'presenterTools',
  'multiUserTools',
  // SKINNING/THEMMING
  'bbb_custom_style',
  'customStyleUrl',
  // LAYOUT
  'bbb_auto_swap_layout',
  'bbb_hide_presentation',
  // OUTSIDE COMMANDS
  'bbb_outside_toggle_self_voice',
  'bbb_outside_toggle_recording',
];

export default function addUserSettings(credentials, meetingId, userId, settings) {
  check(meetingId, String);
  check(userId, String);
  check(settings, [Object]);

  let parameters = {};
  settings.forEach((el) => {
    const settingKey = Object.keys(el).shift();

    if (currentParameters.includes(settingKey)) {
      if (!Object.keys(parameters).includes(settingKey)) {
        parameters = {
          [settingKey]: el[settingKey],
          ...parameters,
        };
      } else {
        parameters[settingKey] = el[settingKey];
      }
      return;
    }

    if (oldParametersKeys.includes(settingKey)) {
      const matchingNewKey = oldParameters[settingKey];
      const matchingNewKeyValue = el[settingKey];

      if (!Object.keys(parameters).includes(matchingNewKey)) {
        parameters = {
          [matchingNewKey]: matchingNewKeyValue,
          ...parameters,
        };
      }
    }
  });

  const settingsAdded = [];
  Object.entries(parameters).forEach((el) => {
    const setting = el[0];
    const value = el[1];
    settingsAdded.push(addUserSetting(meetingId, userId, setting, value));
  });

  return settingsAdded;
}
