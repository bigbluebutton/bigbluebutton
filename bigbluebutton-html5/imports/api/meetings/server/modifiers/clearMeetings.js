import Meetings from '/imports/api/chat';
import Logger from '/imports/startup/server/logger';
import removeMeeting from './removeMeeting';

import clearUsers from '/imports/api/users/server/modifiers/clearUsers';
import clearChats from '/imports/api/chat/server/modifiers/clearChats';
import clearBreakouts from '/imports/api/breakouts/server/modifiers/clearBreakouts';
import clearShapes from '/imports/api/shapes/server/modifiers/clearShapes';
import clearSlides from '/imports/api/slides/server/modifiers/clearSlides';
import clearPolls from '/imports/api/polls/server/modifiers/clearPolls';
import clearCursor from '/imports/api/cursor/server/modifiers/clearCursor';
import clearCaptions from '/imports/api/captions/server/modifiers/clearCaptions';
import clearPresentations from '/imports/api/presentations/server/modifiers/clearPresentations';

export default function clearMeetings() {
  return Meetings.remove({}, (err) => {
    clearCaptions();
    clearChats();
    clearCursor();
    clearPresentations();
    clearBreakouts();
    clearPolls();
    clearShapes();
    clearSlides();
    clearUsers();

    return Logger.info('Cleared Meetings (all)');
  });
}
