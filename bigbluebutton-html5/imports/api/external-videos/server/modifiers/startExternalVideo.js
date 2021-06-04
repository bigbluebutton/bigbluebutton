import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import { ExternalVideoMeetings } from '/imports/api/meetings';

export default function startExternalVideo(meetingId, userId, externalVideoUrl) {
  check(externalVideoUrl, String);
  check(meetingId, String);

  const selector = { meetingId };
  const modifier = { $set: { externalVideoUrl } };

  try {
    ExternalVideoMeetings.update(selector, modifier);
    Logger.info(`User id=${userId} sharing an external video: ${externalVideoUrl} for meeting ${meetingId}`);
  } catch (err) {
    Logger.error(`Error on setting shared external video start in Meetings collection: ${err}`);
  }
}
