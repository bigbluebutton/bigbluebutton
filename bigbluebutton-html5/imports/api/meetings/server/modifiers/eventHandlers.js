import { eventEmitter } from '/imports/startup/server';
import { logger } from '/imports/startup/server/logger';
import Meetings from '/imports/api/meetings';
import { handleLockingMic } from '/imports/api/users/server/modifiers/handleLockingMic';
import { addMeetingToCollection } from './addMeetingToCollection';
import { removeMeetingFromCollection } from './removeMeetingFromCollection';

eventEmitter.on('meeting_ended_message', function (arg) {
  handleEndOfMeeting(arg);
});

eventEmitter.on('meeting_destroyed_event', function (arg) {
  handleEndOfMeeting(arg);
});

eventEmitter.on('recording_status_changed_message', function (arg) {
  const intendedForRecording = arg.payload.recorded;
  const currentlyBeingRecorded = arg.payload.recording;
  const meetingId = arg.payload.meeting_id;

  Meetings.update({
    meetingId: meetingId,
    intendedForRecording: intendedForRecording,
  }, {
    $set: {
      currentlyBeingRecorded: currentlyBeingRecorded,
    },
  });
  return arg.callback();
});

eventEmitter.on('new_permission_settings', function (arg) {
  const meetingId = arg.payload.meeting_id;
  const payload = arg.payload;
  const meetingObject = Meetings.findOne({
    meetingId: meetingId,
  });
  if (meetingObject != null && payload != null) {
    const oldSettings = meetingObject.roomLockSettings;
    const newSettings = payload.permissions;

    // if the disableMic setting was turned on
    if (oldSettings != null && !oldSettings.disableMic && newSettings.disableMic) {
      handleLockingMic(meetingId, newSettings);
    }

    const settingsObj = {
      disablePrivateChat: newSettings.disablePrivateChat,
      disableCam: newSettings.disableCam,
      disableMic: newSettings.disableMic,
      lockOnJoin: newSettings.lockOnJoin,
      lockedLayout: newSettings.lockedLayout,
      disablePublicChat: newSettings.disablePublicChat,
      lockOnJoinConfigurable: newSettings.lockOnJoinConfigurable,
    };

    // substitute with the new lock settings
    Meetings.update({
      meetingId: meetingId,
    }, {
      $set: {
        roomLockSettings: settingsObj,
      },
    });
  }

  return arg.callback();
});

eventEmitter.on('meeting_created_message', function (arg) {
  const meetingName = arg.payload.name;
  const intendedForRecording = arg.payload.recorded;
  const voiceConf = arg.payload.voice_conf;
  const duration = arg.payload.duration;
  const meetingId = arg.payload.meeting_id;
  return addMeetingToCollection(meetingId, meetingName, intendedForRecording,
    voiceConf, duration, arg.callback);
});

eventEmitter.on('get_all_meetings_reply', function (arg) {
  logger.info('Let\'s store some data for the running meetings so that when an' +
    ' HTML5 client joins everything is ready!');
  logger.info(JSON.stringify(arg.payload));
  const listOfMeetings = arg.payload.meetings;

  // Processing the meetings recursively with a callback to notify us,
  // ensuring that we update the meeting collection serially
  let processMeeting = function () {
    let meeting = listOfMeetings.pop();
    if (meeting != null) {
      return addMeetingToCollection(meeting.meetingID, meeting.meetingName,
        meeting.recorded, meeting.voiceBridge, meeting.duration, processMeeting);
    } else {
      return arg.callback(); // all meeting arrays (if any) have been processed
    }
  };

  return processMeeting();
});

export const handleEndOfMeeting = function (arg) {
  const meetingId = arg.payload.meeting_id;
  logger.info(`DESTROYING MEETING ${meetingId}`);
  return removeMeetingFromCollection(meetingId, arg.callback);
};
