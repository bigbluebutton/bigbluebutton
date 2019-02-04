import { check } from 'meteor/check';
import addUserSetting from '/imports/api/users-settings/server/modifiers/addUserSetting';

export default function addUserSettings(credentials, meetingId, userId, settings) {
  check(meetingId, String);
  check(userId, String);
  check(settings, [Object]);

  const customData = settings.reduce((acc, data) => {
    const key = Object.keys(data).shift();

    const handledHTML5Parameters = [
      'html5recordingbot',
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
    if (!handledHTML5Parameters.includes(key)) {
      return acc;
    }

    let value = data[key];
    try {
      value = JSON.parse(value);
    } catch (e) {
      console.log('error', `Caught: ${e.message}`);
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
