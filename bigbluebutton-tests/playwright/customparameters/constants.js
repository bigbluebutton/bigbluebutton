const e = require('../core/elements');

exports.autoJoin = 'userdata-bbb_auto_join_audio=false';
exports.listenOnlyMode = 'userdata-bbb_listen_only_mode=false';
exports.forceListenOnly = 'userdata-bbb_force_listen_only=true';
exports.skipCheck = 'userdata-bbb_skip_check_audio=true';
exports.skipCheckOnFirstJoin = 'userdata-bbb_skip_check_audio_on_first_join=true';
const docTitle = 'playwright';
exports.docTitle = docTitle;
exports.clientTitle = `userdata-bbb_client_title=${docTitle}`;
exports.askForFeedbackOnLogout = 'userdata-bbb_ask_for_feedback_on_logout=true';
exports.displayBrandingArea = 'userdata-bbb_display_branding_area=true';
exports.logo = 'logo=https://bigbluebutton.org/wp-content/themes/bigbluebutton/library/images/bigbluebutton-logo.png';
exports.enableScreensharing = 'userdata-bbb_enable_screen_sharing=false';
exports.enableVideo = 'userdata-bbb_enable_video=false';
exports.autoShareWebcam = 'userdata-bbb_auto_share_webcam=true';
exports.multiUserPenOnly = 'userdata-bbb_multi_user_pen_only=true';
exports.presenterTools = 'userdata-bbb_presenter_tools=["pencil", "hand"]';
exports.multiUserTools = 'userdata-bbb_multi_user_tools=["pencil", "hand"]';
const cssCode = `${e.presentationTitle}{display: none;}`;
exports.customStyle = `userdata-bbb_custom_style=${cssCode}`;
exports.customStyleUrl = 'userdata-bbb_custom_style_url=https://develop.bigbluebutton.org/css-test-file.css';
exports.autoSwapLayout = 'userdata-bbb_auto_swap_layout=true';
exports.hidePresentation = 'userdata-bbb_hide_presentation=true';
exports.outsideToggleSelfVoice = 'userdata-bbb_outside_toggle_self_voice=true';
exports.outsideToggleRecording = 'userdata-bbb_outside_toggle_recording=true';
exports.showPublicChatOnLogin = 'userdata-bbb_show_public_chat_on_login=false';
exports.forceRestorePresentationOnNewEvents = 'userdata-bbb_force_restore_presentation_on_new_events=true';
exports.bannerText = 'bannerText=some text';
const color = 'FFFF00'
exports.color = color;
exports.bannerColor = `bannerColor=%23${color}`;
exports.recordMeeting = 'record=true';
exports.skipVideoPreview = 'userdata-bbb_skip_video_preview=true';
exports.skipVideoPreviewOnFirstJoin = 'userdata-bbb_skip_video_preview_on_first_join=true';
exports.mirrorOwnWebcam = 'userdata-bbb_mirror_own_webcam=true';
exports.showParticipantsOnLogin = 'userdata-bbb_show_participants_on_login=false';

// Shortcuts
exports.shortcuts = 'userdata-bbb_shortcuts=[$]';
exports.initialShortcuts = [{
  param: 'openOptions',
  key: 'O'
}, {
  param: 'toggleUserList',
  key: 'U'
}, {
  param: 'togglePublicChat',
  key: 'P'
}, {
  param: 'openActions',
  key: 'A'
}, {
  param: 'joinAudio',
  key: 'J'
}];
exports.laterShortcuts = [{
  param: 'toggleMute',
  key: 'M'
}, {
  param: 'leaveAudio',
  key: 'L'
}, {
  param: 'hidePrivateChat',
  key: 'H'
}, {
  param: 'closePrivateChat',
  key: 'G'
}];
