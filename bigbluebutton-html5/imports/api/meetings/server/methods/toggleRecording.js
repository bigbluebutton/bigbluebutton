import Logger from '/imports/startup/server/logger';
import { Meteor } from 'meteor/meteor';
import RedisPubSub from '/imports/startup/server/redis';
import { RecordMeetings } from '/imports/api/meetings';
import Users from '/imports/api/users';
import { extractCredentials } from '/imports/api/common/server/helpers';
import { check } from 'meteor/check';

export default function toggleRecording() {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const ROLE_MODERATOR = Meteor.settings.public.user.role_moderator;
  const EVENT_NAME = 'SetRecordingStatusCmdMsg';

  try {
    const { meetingId, requesterUserId } = extractCredentials(this.userId);

    check(meetingId, String);
    check(requesterUserId, String);

    let meetingRecorded;
    let allowedToRecord;

    const recordObject = RecordMeetings.findOne({ meetingId });

    if (recordObject != null) {
      const {
        allowStartStopRecording,
        recording,
        record,
      } = recordObject;

      meetingRecorded = recording;
      allowedToRecord = record && allowStartStopRecording; // TODO-- remove some day
    }

    const payload = {
      recording: !meetingRecorded,
      setBy: requesterUserId,
    };

    const selector = {
      meetingId,
      userId: requesterUserId,
    };
    const user = Users.findOne(selector);

    if (allowedToRecord && !!user && user.role === ROLE_MODERATOR) {
      Logger.info(`Setting the record parameter to ${!meetingRecorded} for ${meetingId} by ${requesterUserId}`);
      RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
    }
  } catch (err) {
    Logger.error(`Exception while invoking method toggleRecording ${err.stack}`);
  }
}
