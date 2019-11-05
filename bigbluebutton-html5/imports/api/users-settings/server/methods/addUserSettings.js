import { check } from 'meteor/check';
import addUserSetting from '/imports/api/users-settings/server/modifiers/addUserSetting';
import logger from '/imports/startup/server/logger';

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
  forceListenOnly: 'bbb_force_listen_only',
  clientTitle: 'bbb_client_title',
  askForFeedbackOnLogout: 'bbb_ask_for_feedback_on_logout',
  displayBrandingArea: 'bbb_display_branding_area',
  enableScreensharing: 'bbb_enable_screen_sharing',
  enableVideo: 'bbb_enable_video',
  enableVideoStats: 'bbb_enable_video_stats',
  multiUserPenOnly: 'bbb_multi_user_pen_only',
  presenterTools: 'bbb_presenter_tools',
  multiUserTools: 'bbb_multi_user_tools',
  customStyleUrl: 'bbb_custom_style_url',
};

const oldParametersKeys = Object.keys(oldParameters);

const currentParameters = [
  // APP
  'bbb_auto_join_audio',
  'bbb_listen_only_mode',
  'bbb_force_listen_only',
  'bbb_skip_check_audio',
  'bbb_client_title',
  'bbb_ask_for_feedback_on_logout',
  // BRANDING
  'bbb_display_branding_area',
  // SHORTCUTS
  'bbb_shortcuts',
  // KURENTO
  'bbb_enable_screen_sharing',
  'bbb_enable_video',
  'bbb_enable_video_stats',
  'bbb_auto_share_webcam',
  // WHITEBOARD
  'bbb_multi_user_pen_only',
  'bbb_presenter_tools',
  'bbb_multi_user_tools',
  // SKINNING/THEMMING
  'bbb_custom_style',
  'bbb_custom_style_url',
  // LAYOUT
  'bbb_auto_swap_layout',
  'bbb_hide_presentation',
  // OUTSIDE COMMANDS
  'bbb_outside_toggle_self_voice',
  'bbb_outside_toggle_recording',
];

function valueParser(val) {
  try {
    const parsedValue = JSON.parse(val.toLowerCase());
    return parsedValue;
  } catch (error) {
    logger.error('Parameter value could not ber parsed');
    return val;
  }
}

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
          [settingKey]: valueParser(el[settingKey]),
          ...parameters,
        };
      } else {
        parameters[settingKey] = el[settingKey];
      }
      return;
    }

    if (oldParametersKeys.includes(settingKey)) {
      const matchingNewKey = oldParameters[settingKey];
      if (!Object.keys(parameters).includes(matchingNewKey)) {
        parameters = {
          [matchingNewKey]: valueParser(el[settingKey]),
          ...parameters,
        };
      }
      return;
    }

    logger.warn(`Parameter ${settingKey} not handled`);
  });

  const settingsAdded = [];
  Object.entries(parameters).forEach((el) => {
    const setting = el[0];
    const value = el[1];
    settingsAdded.push(addUserSetting(meetingId, userId, setting, value));
  });

  return settingsAdded;
}
