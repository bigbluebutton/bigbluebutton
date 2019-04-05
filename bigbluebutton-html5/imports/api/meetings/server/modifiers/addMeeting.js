import flat from 'flat';
import {
  check,
  Match,
} from 'meteor/check';
import Meetings from '/imports/api/meetings';
import Logger from '/imports/startup/server/logger';

export default function addMeeting(meeting) {
  const meetingId = meeting.meetingProp.intId;

  check(meetingId, String);
  check(meeting, {
    breakoutProps: {
      sequence: Number,
      freeJoin: Boolean,
      breakoutRooms: Array,
      parentId: String,
    },
    meetingProp: {
      intId: String,
      extId: String,
      isBreakout: Boolean,
      name: String,
    },
    usersProp: {
      webcamsOnlyForModerator: Boolean,
      guestPolicy: String,
      maxUsers: Number,
    },
    durationProps: {
      createdTime: Number,
      duration: Number,
      createdDate: String,
      maxInactivityTimeoutMinutes: Number,
      warnMinutesBeforeMax: Number,
      meetingExpireIfNoUserJoinedInMinutes: Number,
      meetingExpireWhenLastUserLeftInMinutes: Number,
      userInactivityInspectTimerInMinutes: Number,
      userInactivityThresholdInMinutes: Number,
      userActivitySignResponseDelayInMinutes: Number,
      timeRemaining: Number,
    },
    welcomeProp: {
      welcomeMsg: String,
      modOnlyMessage: String,
      welcomeMsgTemplate: String,
    },
    recordProp: Match.ObjectIncluding({
      allowStartStopRecording: Boolean,
      autoStartRecording: Boolean,
      record: Boolean,
    }),
    password: {
      viewerPass: String,
      moderatorPass: String,
    },
    voiceProp: {
      voiceConf: String,
      dialNumber: String,
      telVoice: String,
      muteOnStart: Boolean,
    },
    screenshareProps: {
      red5ScreenshareIp: String,
      red5ScreenshareApp: String,
      screenshareConf: String,
    },
    metadataProp: Object,
  });

  const newMeeting = meeting;

  const selector = {
    meetingId,
  };

  const lockSettingsProp = {
    disableCam: false,
    disableMic: false,
    disablePrivChat: false,
    disablePubChat: false,
    lockOnJoin: true,
    lockOnJoinConfigurable: false,
    lockedLayout: false,
    setBy: 'temp',
  };

  const meetingEnded = false;

  newMeeting.welcomeProp.welcomeMsg = newMeeting.welcomeProp.welcomeMsg.replace(
    'href="event:',
    'href="',
  );

  const insertBlankTarget = (s, i) => `${s.substr(0, i)} target="_blank"${s.substr(i)}`;
  const linkWithoutTarget = new RegExp('<a href="(.*?)">', 'g');
  linkWithoutTarget.test(newMeeting.welcomeProp.welcomeMsg);

  if (linkWithoutTarget.lastIndex > 0) {
    newMeeting.welcomeProp.welcomeMsg = insertBlankTarget(
      newMeeting.welcomeProp.welcomeMsg,
      linkWithoutTarget.lastIndex - 1,
    );
  }

  const modifier = {
    $set: Object.assign({
      meetingId,
      meetingEnded,
      lockSettingsProp,
    }, flat(newMeeting, {
      safe: true,
    })),
  };

  const cb = (err, numChanged) => {
    if (err) {
      Logger.error(`Adding meeting to collection: ${err}`);
      return;
    }

    const {
      insertedId,
    } = numChanged;

    if (insertedId) {
      Logger.info(`Added meeting id=${meetingId}`);
    }

    if (numChanged) {
      Logger.info(`Upserted meeting id=${meetingId}`);
    }
  };

  return Meetings.upsert(selector, modifier, cb);
}
