import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import { ExternalVideoMeetings } from '/imports/api/meetings';

export default async function stopExternalVideo(userId, meetingId) {
  try {
    check(meetingId, String);
    check(userId, String);

    const selector = { meetingId };
    const modifier = { $set: { externalVideoUrl: null } };

    Logger.info(`External video stop sharing was initiated by:[${userId}] for meeting ${meetingId}`);
    await ExternalVideoMeetings.updateAsync(selector, modifier);
  } catch (err) {
    Logger.error(`Error on setting shared external video stop in Meetings collection: ${err}`);
  }
}
