import flat from 'flat';
import { check } from 'meteor/check';
import Meetings from '/imports/api/meetings';
import Logger from '/imports/startup/server/logger';

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
      muteOnStart: Boolean,
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

    const { insertedId } = numChanged;
    if (insertedId) {
      Logger.info(`Added meeting id=${meetingId}`);
    }

    if (numChanged) {
      Logger.info(`Upserted meeting id=${meetingId}`);
    }
  };

  return Meetings.upsert(selector, modifier, cb);
}
