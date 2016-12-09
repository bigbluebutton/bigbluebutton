import { check } from 'meteor/check';
import Meetings from '/imports/api/meetings';
import Logger from '/imports/startup/server/logger';
import initializeCursor from '/imports/api/cursor/server/modifiers/initializeCursor';

export default function addMeeting(meeting) {
  const APP_CONFIG = Meteor.settings.public.app;
  const meetingId = meeting.meeting_id;

  check(meeting, Object);
  check(meetingId, String);

  const selector = {
    meetingId,
  };

  const modifier = {
    $set: {
      meetingId,
      meetingName: meeting.name,
      intendedForRecording: meeting.recorded,
      currentlyBeingRecorded: false,
      voiceConf: meeting.voice_conf,
      duration: meeting.duration,
      roomLockSettings: {
        disablePrivateChat: false,
        disableCam: false,
        disableMic: false,
        lockOnJoin: APP_CONFIG.lockOnJoin,
        lockedLayout: false,
        disablePublicChat: false,
        lockOnJoinConfigurable: false,
      },
    },
  };

  const cb = (err, numChanged) => {
    if (err) {
      return Logger.error(`Adding meeting to collection: ${err}`);
    }

    initializeCursor(meetingId);

    const { insertedId } = numChanged;
    if (insertedId) {
      return Logger.info(`Added meeting id=${meetingId}`);
    }

    if (numChanged) {
      return Logger.info(`Upserted meeting id=${meetingId}`);
    }
  };

  return Meetings.upsert(selector, modifier, cb);
};
