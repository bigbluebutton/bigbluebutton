import flat from 'flat';
import { check } from 'meteor/check';
import Meetings from '/imports/api/2.0/meetings';
import Logger from '/imports/startup/server/logger';
import initializeCursor from '/imports/api/1.1/cursor/server/modifiers/initializeCursor';

export default function addMeeting(meeting) {
  const meetingId = meeting.meetingProp.intId;

  check(meetingId, String);
  check(meeting, {
    breakoutProps: {
      sequence: Number,
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
    },
    welcomeProp: {
      welcomeMsg: String,
      modOnlyMessage: String,
      welcomeMsgTemplate: String,
    },
    recordProp: {
      allowStartStopRecording: Boolean,
      autoStartRecording: Boolean,
      record: Boolean,
    },
    password: {
      viewerPass: String,
      moderatorPass: String,
    },
    voiceProp: {
      voiceConf: String,
      dialNumber: String,
      telVoice: String,
    },
    screenshareProps: {
      red5ScreenshareIp: String,
      red5ScreenshareApp: String,
      screenshareConf: String,
    },
    metadataProp: Object,
  });

  const selector = {
    meetingId,
  };

  const modifier = {
    $set: Object.assign(
      { meetingId },
      flat(meeting, { safe: true }),
    ),
  };

  const cb = (err, numChanged) => {
    if (err) {
      Logger.error(`Adding meeting to collection: ${err}`);
      return;
    }

    initializeCursor(meetingId);

    const { insertedId } = numChanged;
    if (insertedId) {
      Logger.info(`Added meeting2x id=${meetingId}`);
    }

    if (numChanged) {
      Logger.info(`Upserted meeting2x id=${meetingId}`);
    }
  };

  return Meetings.upsert(selector, modifier, cb);
}
