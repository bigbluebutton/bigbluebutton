import Meetings from '/imports/api/1.1/chat';
import Logger from '/imports/startup/server/logger';
import removeMeeting from './removeMeeting';

import clearUsers from '/imports/api/1.1/users/server/modifiers/clearUsers';
import clearChats from '/imports/api/1.1/chat/server/modifiers/clearChats';
import clearBreakouts from '/imports/api/1.1/breakouts/server/modifiers/clearBreakouts';
import clearShapes from '/imports/api/1.1/shapes/server/modifiers/clearShapes';
import clearSlides from '/imports/api/1.1/slides/server/modifiers/clearSlides';
import clearPolls from '/imports/api/1.1/polls/server/modifiers/clearPolls';
import clearCursor from '/imports/api/1.1/cursor/server/modifiers/clearCursor';
import clearCaptions from '/imports/api/1.1/captions/server/modifiers/clearCaptions';
import clearPresentations from '/imports/api/1.1/presentations/server/modifiers/clearPresentations';

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
