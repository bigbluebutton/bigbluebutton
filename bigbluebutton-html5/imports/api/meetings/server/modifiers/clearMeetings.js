import Meetings from '/imports/api/chat';
import Logger from '/imports/startup/server/logger';
import removeMeeting from './removeMeeting';

import { clearUsersCollection } from '/imports/api/users/server/modifiers/clearUsersCollection';
import clearChats from '/imports/api/chat/server/modifiers/clearChats';
import { clearShapesCollection } from '/imports/api/shapes/server/modifiers/clearShapesCollection';
import { clearSlidesCollection } from '/imports/api/slides/server/modifiers/clearSlidesCollection';
import { clearPollCollection } from '/imports/api/polls/server/modifiers/clearPollCollection';
import { clearCursorCollection } from '/imports/api/cursor/server/modifiers/clearCursorCollection';
import { clearCaptionsCollection }
  from '/imports/api/captions/server/modifiers/clearCaptionsCollection';
import { clearPresentationsCollection }
  from '/imports/api/presentations/server/modifiers/clearPresentationsCollection';

export default function clearMeetings() {
  return Meetings.remove({}, (err) => {
    clearCaptionsCollection();
    clearChats();
    clearCursorCollection();
    clearPollCollection();
    clearPresentationsCollection();
    clearShapesCollection();
    clearSlidesCollection();
    clearUsersCollection();

    return Logger.info('Cleared Meetings (all)');
  });
};
