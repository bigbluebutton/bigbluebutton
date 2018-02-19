import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import { Meteor } from 'meteor/meteor';
import RedisPubSub from '/imports/startup/server/redis';
import Meetings from '/imports/api/meetings';

export default function toggleRecording(credentials) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const { meetingId, requesterUserId, requesterToken } = credentials;

  check(meetingId, String);
  check(requesterUserId, String);
  check(requesterToken, String);

  const EVENT_NAME = 'SetRecordingStatusCmdMsg';

  let meetingRecorded;
  let allowedToRecord;

  const meetingObject = Meetings.findOne({ meetingId });

  if (meetingObject != null) {
    meetingTitle = meetingObject.meetingProp.name;

    let {
      allowStartStopRecording,
      recording,
      record
    } = meetingObject.recordProp;

    meetingRecorded = recording;
    allowedToRecord = record && allowStartStopRecording;
  }


  const payload = {
    recording: !meetingRecorded,
    setBy: requesterUserId
  };

  if (allowedToRecord) {
    Logger.info(`Setting the record parameter to ${!meetingRecorded} for ${meetingId} by ${requesterUserId}`);
    return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
  }

}
