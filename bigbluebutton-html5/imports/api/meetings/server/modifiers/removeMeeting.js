import { check } from 'meteor/check';
import Meetings from '/imports/api/meetings';
import Logger from '/imports/startup/server/logger';

import { clearUsersCollection } from '/imports/api/users/server/modifiers/clearUsersCollection';
import clearChats from '/imports/api/chat/server/modifiers/clearChats';
import { clearShapesCollection } from '/imports/api/shapes/server/modifiers/clearShapesCollection';
import clearSlides from '/imports/api/slides/server/modifiers/clearSlides';
import clearPolls from '/imports/api/polls/server/modifiers/clearPolls';
import { clearCursorCollection } from '/imports/api/cursor/server/modifiers/clearCursorCollection';
import { clearCaptionsCollection }
  from '/imports/api/captions/server/modifiers/clearCaptionsCollection';
import clearPresentations from '/imports/api/presentations/server/modifiers/clearPresentations';

export default function removeMeeting(meetingId) {
  check(meetingId, String);

  const selector = {
    meetingId,
  };

  const cb = (err, numChanged) => {
    if (err) {
      return Logger.error(`Removing meeting from collection: ${err}`);
    }

    if (numChanged) {
      clearCaptionsCollection(meetingId);
      clearChats(meetingId);
      clearCursorCollection(meetingId);
      clearPresentations(meetingId);
      clearPolls(meetingId);
      clearShapesCollection(meetingId);
      clearSlides(meetingId);
      clearUsersCollection(meetingId);

      return Logger.info(`Removed meeting id=${meetingId}`);
    }
  };

  return Meetings.remove(selector, cb);
};
