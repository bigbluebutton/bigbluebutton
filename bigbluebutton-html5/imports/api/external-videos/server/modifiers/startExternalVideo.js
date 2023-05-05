import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import { ExternalVideoMeetings } from '/imports/api/meetings';

export default function startExternalVideo(meetingId, userId, externalVideoUrl) {
  try {
    check(meetingId, String);
    check(userId, String);
    check(externalVideoUrl, String);

    const selector = { meetingId };
    const modifier = { $set: { externalVideoUrl } };

    Logger.info(`User id=${userId} sharing an external video: ${externalVideoUrl} for meeting ${meetingId}`);
    ExternalVideoMeetings.update(selector, modifier);
  } catch (err) {
    Logger.error(`Error on setting shared external video start in Meetings collection: ${err}`);
  }
}
