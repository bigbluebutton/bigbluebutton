import Meetings from '/imports/api/meetings';
import Logger from '/imports/startup/server/logger';

import { removeExternalVideoStreamer } from '/imports/api/external-videos/server/streamer';

import clearUsers from '/imports/api/users/server/modifiers/clearUsers';
import clearUsersSettings from '/imports/api/users-settings/server/modifiers/clearUsersSettings';
import clearBreakouts from '/imports/api/breakouts/server/modifiers/clearBreakouts';
import clearPads from '/imports/api/pads/server/modifiers/clearPads';
import clearVoiceUsers from '/imports/api/voice-users/server/modifiers/clearVoiceUsers';
import clearUserInfo from '/imports/api/users-infos/server/modifiers/clearUserInfo';
import clearScreenshare from '/imports/api/screenshare/server/modifiers/clearScreenshare';
import clearTimer from '/imports/api/timer/server/modifiers/clearTimer';
import clearMeetingTimeRemaining from '/imports/api/meetings/server/modifiers/clearMeetingTimeRemaining';
import clearVoiceCallStates from '/imports/api/voice-call-states/server/modifiers/clearVoiceCallStates';
import clearVideoStreams from '/imports/api/video-streams/server/modifiers/clearVideoStreams';
import clearAuthTokenValidation from '/imports/api/auth-token-validation/server/modifiers/clearAuthTokenValidation';
import clearReactions from '/imports/api/user-reaction/server/modifiers/clearReactions';

import clearWhiteboardMultiUser from '/imports/api/whiteboard-multi-user/server/modifiers/clearWhiteboardMultiUser';
import Metrics from '/imports/startup/server/metrics';

export default async function meetingHasEnded(meetingId) {
  if (!process.env.BBB_HTML5_ROLE || process.env.BBB_HTML5_ROLE === 'frontend') {
    removeExternalVideoStreamer(meetingId);
  }

  await Meetings.removeAsync({ meetingId });
  await Promise.all([
    clearPads(meetingId),
    clearBreakouts(meetingId),
    clearUsers(meetingId),
    clearUsersSettings(meetingId),
    clearVoiceUsers(meetingId),
    clearUserInfo(meetingId),
    clearTimer(meetingId),
    clearMeetingTimeRemaining(meetingId),
    clearVoiceCallStates(meetingId),
    clearVideoStreams(meetingId),
    clearAuthTokenValidation(meetingId),
    clearWhiteboardMultiUser(meetingId),
    clearScreenshare(meetingId),
    clearReactions(meetingId),
  ]);
  await Metrics.removeMeeting(meetingId);
  return Logger.info(`Cleared Meetings with id ${meetingId}`);
}
