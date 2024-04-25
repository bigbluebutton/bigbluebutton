import Meetings from '/imports/api/meetings';
import Logger from '/imports/startup/server/logger';

import { removeExternalVideoStreamer } from '/imports/api/external-videos/server/streamer';

import clearUsers from '/imports/api/users/server/modifiers/clearUsers';
import clearPads from '/imports/api/pads/server/modifiers/clearPads';
import clearVoiceUsers from '/imports/api/voice-users/server/modifiers/clearVoiceUsers';
import clearScreenshare from '/imports/api/screenshare/server/modifiers/clearScreenshare';
import clearTimer from '/imports/api/timer/server/modifiers/clearTimer';
import clearMeetingTimeRemaining from '/imports/api/meetings/server/modifiers/clearMeetingTimeRemaining';
import clearVideoStreams from '/imports/api/video-streams/server/modifiers/clearVideoStreams';
import Metrics from '/imports/startup/server/metrics';

export default async function meetingHasEnded(meetingId) {
  if (!process.env.BBB_HTML5_ROLE || process.env.BBB_HTML5_ROLE === 'frontend') {
    removeExternalVideoStreamer(meetingId);
  }

  await Meetings.removeAsync({ meetingId });
  await Promise.all([
    clearPads(meetingId),
    clearUsers(meetingId),
    clearVoiceUsers(meetingId),
    clearTimer(meetingId),
    clearMeetingTimeRemaining(meetingId),
    clearVideoStreams(meetingId),
    clearScreenshare(meetingId),
  ]);
  await Metrics.removeMeeting(meetingId);
  return Logger.info(`Cleared Meetings with id ${meetingId}`);
}
