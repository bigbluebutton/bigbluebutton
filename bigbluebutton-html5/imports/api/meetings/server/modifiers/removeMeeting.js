import Meetings from '/imports/api/meetings';
import Logger from '/imports/startup/server/logger';

import clearUsers from '/imports/api/users/server/modifiers/clearUsers';
import clearChats from '/imports/api/chat/server/modifiers/clearChats';
import clearBreakouts from '/imports/api/breakouts/server/modifiers/clearBreakouts';
import clearAnnotations from '/imports/api/annotations/server/modifiers/clearAnnotations';
import clearSlides from '/imports/api/slides/server/modifiers/clearSlides';
import clearPolls from '/imports/api/polls/server/modifiers/clearPolls';
import clearCursor from '/imports/api/cursor/server/modifiers/clearCursor';
import clearCaptions from '/imports/api/captions/server/modifiers/clearCaptions';
import clearPresentations from '/imports/api/presentations/server/modifiers/clearPresentations';
import clearVoiceUsers from '/imports/api/voice-users/server/modifiers/clearVoiceUsers';

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
