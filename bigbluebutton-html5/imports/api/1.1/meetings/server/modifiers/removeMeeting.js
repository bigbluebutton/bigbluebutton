import Meetings from '/imports/api/2.0/meetings';
import Logger from '/imports/startup/server/logger';

import clearUsers from '/imports/api/2.0/users/server/modifiers/clearUsers';
import clearChats from '/imports/api/2.0/chat/server/modifiers/clearChats';
import clearBreakouts from '/imports/api/2.0/breakouts/server/modifiers/clearBreakouts';
import clearAnnotations from '/imports/api/2.0/annotations/server/modifiers/clearAnnotations';
import clearSlides from '/imports/api/2.0/slides/server/modifiers/clearSlides';
import clearPolls from '/imports/api/2.0/polls/server/modifiers/clearPolls';
import clearCursor from '/imports/api/2.0/cursor/server/modifiers/clearCursor';
import clearCaptions from '/imports/api/2.0/captions/server/modifiers/clearCaptions';
import clearPresentations from '/imports/api/2.0/presentations/server/modifiers/clearPresentations';
import clearVoiceUsers from '/imports/api/2.0/voice-users/server/modifiers/clearVoiceUsers';

export default function removeMeeting(meetingId) {
  return Meetings.remove({ meetingId }, () => {
    clearCaptions(meetingId);
    clearChats(meetingId);
    clearCursor(meetingId);
    clearPresentations(meetingId);
    clearBreakouts(meetingId);
    clearPolls(meetingId);
    clearAnnotations(meetingId);
    clearSlides(meetingId);
    clearUsers(meetingId);
    clearVoiceUsers(meetingId);

    return Logger.info(`Cleared Meetings with id ${meetingId}`);
  });
}
