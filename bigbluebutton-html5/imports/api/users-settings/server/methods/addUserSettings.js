import { check } from 'meteor/check';
import addUserSetting from '/imports/api/users-settings/server/modifiers/addUserSetting';
import logger from '/imports/startup/server/logger';

const oldParameters = {
  askForFeedbackOnLogout: 'bbb_ask_for_feedback_on_logout',
  autoJoin: 'bbb_auto_join_audio',
  autoShareWebcam: 'bbb_auto_share_webcam',
  autoSwapLayout: 'bbb_auto_swap_layout',
  clientTitle: 'bbb_client_title',
  customStyle: 'bbb_custom_style',
  customStyleUrl: 'bbb_custom_style_url',
  displayBrandingArea: 'bbb_display_branding_area',
  enableScreensharing: 'bbb_enable_screen_sharing',
  enableVideo: 'bbb_enable_video',
  forceListenOnly: 'bbb_force_listen_only',
  hidePresentation: 'bbb_hide_presentation',
  listenOnlyMode: 'bbb_listen_only_mode',
  multiUserPenOnly: 'bbb_multi_user_pen_only',
  multiUserTools: 'bbb_multi_user_tools',
  outsideToggleRecording: 'bbb_outside_toggle_recording',
  outsideToggleSelfVoice: 'bbb_outside_toggle_self_voice',
  presenterTools: 'bbb_presenter_tools',
  shortcuts: 'bbb_shortcuts',
  skipCheck: 'bbb_skip_check_audio',
};

const oldParametersKeys = Object.keys(oldParameters);

const currentParameters = [
  // APP
  'bbb_ask_for_feedback_on_logout',
  'bbb_auto_join_audio',
  'bbb_client_title',
  'bbb_force_listen_only',
  'bbb_listen_only_mode',
  'bbb_skip_check_audio',
  // BRANDING
  'bbb_display_branding_area',
  // SHORTCUTS
  'bbb_shortcuts',
  // KURENTO
  'bbb_auto_share_webcam',
  'bbb_preferred_camera_profile',
  'bbb_enable_screen_sharing',
  'bbb_enable_video',
  'bbb_skip_video_preview',
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
  'bbb_show_participants_on_login',
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
