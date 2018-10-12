import Meetings from '/imports/api/meetings';
import Logger from '/imports/startup/server/logger';

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


export default function removeMeeting(meetingId) {
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

    return Logger.info(`Cleared Meetings with id ${meetingId}`);
  });
}
