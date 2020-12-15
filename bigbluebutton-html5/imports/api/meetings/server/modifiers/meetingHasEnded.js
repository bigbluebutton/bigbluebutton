import Meetings from '/imports/api/meetings';
import Logger from '/imports/startup/server/logger';

import { removeAnnotationsStreamer } from '/imports/api/annotations/server/streamer';
import { removeCursorStreamer } from '/imports/api/cursor/server/streamer';

import clearUsers from '/imports/api/users/server/modifiers/clearUsers';
import clearUsersSettings from '/imports/api/users-settings/server/modifiers/clearUsersSettings';
import clearGroupChat from '/imports/api/group-chat/server/modifiers/clearGroupChat';
import clearBreakouts from '/imports/api/breakouts/server/modifiers/clearBreakouts';
import clearAnnotations from '/imports/api/annotations/server/modifiers/clearAnnotations';
import clearSlides from '/imports/api/slides/server/modifiers/clearSlides';
import clearPolls from '/imports/api/polls/server/modifiers/clearPolls';
import clearCaptions from '/imports/api/captions/server/modifiers/clearCaptions';
import clearPresentationPods from '/imports/api/presentation-pods/server/modifiers/clearPresentationPods';
import clearVoiceUsers from '/imports/api/voice-users/server/modifiers/clearVoiceUsers';
import clearUserInfo from '/imports/api/users-infos/server/modifiers/clearUserInfo';
import clearNote from '/imports/api/note/server/modifiers/clearNote';
import clearNetworkInformation from '/imports/api/network-information/server/modifiers/clearNetworkInformation';
import clearLocalSettings from '/imports/api/local-settings/server/modifiers/clearLocalSettings';
import clearRecordMeeting from './clearRecordMeeting';
import clearVoiceCallStates from '/imports/api/voice-call-states/server/modifiers/clearVoiceCallStates';
import clearVideoStreams from '/imports/api/video-streams/server/modifiers/clearVideoStreams';
import BannedUsers from '/imports/api/users/server/store/bannedUsers';
import Metrics from '/imports/startup/server/metrics';

export default function meetingHasEnded(meetingId) {
  removeAnnotationsStreamer(meetingId);
  removeCursorStreamer(meetingId);

  return Meetings.remove({ meetingId }, () => {
    clearCaptions(meetingId);
    clearGroupChat(meetingId);
    clearPresentationPods(meetingId);
    clearBreakouts(meetingId);
    clearPolls(meetingId);
    clearAnnotations(meetingId);
    clearSlides(meetingId);
    clearUsers(meetingId);
    clearUsersSettings(meetingId);
    clearVoiceUsers(meetingId);
    clearUserInfo(meetingId);
    clearNote(meetingId);
    clearNetworkInformation(meetingId);
    clearLocalSettings(meetingId);
    clearRecordMeeting(meetingId);
    clearVoiceCallStates(meetingId);
    clearVideoStreams(meetingId);
    BannedUsers.delete(meetingId);
    Metrics.removeMeeting(meetingId);

    Logger.info(`Cleared Meetings with id ${meetingId}`);
  });
}
