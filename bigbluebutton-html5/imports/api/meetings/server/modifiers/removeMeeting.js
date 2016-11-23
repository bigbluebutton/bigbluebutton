import { check } from 'meteor/check';
import Meetings from '/imports/api/meetings';
import Logger from '/imports/startup/server/logger';

import { clearUsersCollection } from '/imports/api/users/server/modifiers/clearUsersCollection';
import clearChats from '/imports/api/chat/server/modifiers/clearChats';
import clearShapes from '/imports/api/shapes/server/modifiers/clearShapes';
import clearSlides from '/imports/api/slides/server/modifiers/clearSlides';
import clearPolls from '/imports/api/polls/server/modifiers/clearPolls';
import clearCursor from '/imports/api/cursor/server/modifiers/clearCursor';
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
      clearCursor(meetingId);
      clearPresentations(meetingId);
      clearPolls(meetingId);
      clearShapes(meetingId);
      clearSlides(meetingId);
      clearUsersCollection(meetingId);

      return Logger.info(`Removed meeting id=${meetingId}`);
    }
  };

  return Meetings.remove(selector, cb);
};
