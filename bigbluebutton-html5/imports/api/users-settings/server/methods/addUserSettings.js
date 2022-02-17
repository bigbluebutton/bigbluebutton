import { check } from 'meteor/check';
import addUserSetting from '/imports/api/users-settings/server/modifiers/addUserSetting';
import logger from '/imports/startup/server/logger';
import { extractCredentials } from '/imports/api/common/server/helpers';

const oldParameters = {
  askForFeedbackOnLogout: 'bbb_ask_for_feedback_on_logout',
  autoJoin: 'bbb_auto_join_audio',
  autoShareWebcam: 'bbb_auto_share_webcam',
  autoSwapLayout: 'bbb_auto_swap_layout',
  clientTitle: 'bbb_client_title',
  customStyle: 'bbb_custom_style',
  customStyleUrl: 'bbb_custom_style_url',
  displayBrandingArea: 'bbb_display_branding_area',
  enableVideo: 'bbb_enable_video',
  forceListenOnly: 'bbb_force_listen_only',
  hidePresentation: 'bbb_hide_presentation',
  listenOnlyMode: 'bbb_listen_only_mode',
  multiUserPenOnly: 'bbb_multi_user_pen_only',
  multiUserTools: 'bbb_multi_user_tools',
  presenterTools: 'bbb_presenter_tools',
  shortcuts: 'bbb_shortcuts',
  skipCheck: 'bbb_skip_check_audio',
};

const oldParametersKeys = Object.keys(oldParameters);

const currentParameters = [
  // APP
  'bbb_ask_for_feedback_on_logout',
  'bbb_override_default_locale',
  'bbb_auto_join_audio',
  'bbb_client_title',
  'bbb_force_listen_only',
  'bbb_listen_only_mode',
  'bbb_skip_check_audio',
  'bbb_skip_check_audio_on_first_join',
  // BRANDING
  'bbb_display_branding_area',
  // SHORTCUTS
  'bbb_shortcuts',
  // KURENTO
  'bbb_auto_share_webcam',
  'bbb_preferred_camera_profile',
  'bbb_enable_video',
  'bbb_record_video',
  'bbb_skip_video_preview',
  'bbb_skip_video_preview_on_first_join',
  'bbb_mirror_own_webcam',
  // PRESENTATION
  'bbb_force_restore_presentation_on_new_events',
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
  'bbb_show_public_chat_on_login',
  'bbb_hide_actions_bar',
  'bbb_hide_nav_bar',
];

function valueParser(val) {
  try {
    const parsedValue = JSON.parse(val.toLowerCase().trim());
    return parsedValue;
  } catch (error) {
    logger.warn(`addUserSettings:Parameter ${val} could not be parsed (was not json)`);
    return val;
  }
}

export default function addUserSettings(settings) {
  try {
    check(settings, [Object]);

    const { meetingId, requesterUserId: userId } = extractCredentials(this.userId);

    check(meetingId, String);
    check(userId, String);

    let parameters = {};

    settings.forEach((el) => {
      const settingKey = Object.keys(el).shift();
      const normalizedKey = settingKey.trim();

      if (currentParameters.includes(normalizedKey)) {
        if (!Object.keys(parameters).includes(normalizedKey)) {
          parameters = {
            [normalizedKey]: valueParser(el[settingKey]),
            ...parameters,
          };
        } else {
          parameters[normalizedKey] = el[settingKey];
        }
        return;
      }

      if (oldParametersKeys.includes(normalizedKey)) {
        const matchingNewKey = oldParameters[normalizedKey];
        if (!Object.keys(parameters).includes(matchingNewKey)) {
          parameters = {
            [matchingNewKey]: valueParser(el[settingKey]),
            ...parameters,
          };
        }
        return;
      }

      logger.warn(`Parameter ${normalizedKey} not handled`);
    });

    const settingsAdded = [];
    Object.entries(parameters).forEach((el) => {
      const setting = el[0];
      const value = el[1];
      settingsAdded.push(addUserSetting(meetingId, userId, setting, value));
    });

    return settingsAdded;
  } catch (err) {
    logger.error(`Exception while invoking method addUserSettings ${err.stack}`);
  }
}
