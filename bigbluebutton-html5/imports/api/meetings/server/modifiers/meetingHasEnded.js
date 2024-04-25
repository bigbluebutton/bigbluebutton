import Meetings from '/imports/api/meetings';
import Logger from '/imports/startup/server/logger';

import clearMeetingTimeRemaining from '/imports/api/meetings/server/modifiers/clearMeetingTimeRemaining';
import clearVideoStreams from '/imports/api/video-streams/server/modifiers/clearVideoStreams';
import Metrics from '/imports/startup/server/metrics';

export default async function meetingHasEnded(meetingId) {
  await Meetings.removeAsync({ meetingId });
  await Promise.all([
    clearMeetingTimeRemaining(meetingId),
    clearVideoStreams(meetingId),
  ]);
  await Metrics.removeMeeting(meetingId);
  return Logger.info(`Cleared Meetings with id ${meetingId}`);
}
