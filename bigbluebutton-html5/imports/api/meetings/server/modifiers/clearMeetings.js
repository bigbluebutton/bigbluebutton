import Meetings from '/imports/api/chat';
import Logger from '/imports/startup/server/logger';
import removeMeeting from './removeMeeting';

import { clearUsersCollection } from '/imports/api/users/server/modifiers/clearUsersCollection';
import clearChats from '/imports/api/chat/server/modifiers/clearChats';
import { clearShapesCollection } from '/imports/api/shapes/server/modifiers/clearShapesCollection';
import clearSlides from '/imports/api/slides/server/modifiers/clearSlides';
import clearPolls from '/imports/api/polls/server/modifiers/clearPolls';
import { clearCursorCollection } from '/imports/api/cursor/server/modifiers/clearCursorCollection';
import { clearCaptionsCollection }
  from '/imports/api/captions/server/modifiers/clearCaptionsCollection';
import clearPresentations from '/imports/api/presentations/server/modifiers/clearPresentations';

export default function clearMeetings() {
  return Meetings.remove({}, (err) => {
    clearCaptionsCollection();
    clearChats();
    clearCursorCollection();
    clearPresentations();
    clearPolls();
    clearShapesCollection();
    clearSlides();
    clearUsersCollection();

    return Logger.info('Cleared Meetings (all)');
  });
};
