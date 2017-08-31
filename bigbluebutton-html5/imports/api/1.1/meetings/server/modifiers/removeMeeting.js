import { check } from 'meteor/check';
import Meetings from '/imports/api/1.1/meetings';
import Logger from '/imports/startup/server/logger';

import clearUsers from '/imports/api/1.1/users/server/modifiers/clearUsers';
import clearChats from '/imports/api/1.1/chat/server/modifiers/clearChats';
import clearShapes from '/imports/api/1.1/shapes/server/modifiers/clearShapes';
import clearSlides from '/imports/api/1.1/slides/server/modifiers/clearSlides';
import clearPolls from '/imports/api/1.1/polls/server/modifiers/clearPolls';
import clearCursor from '/imports/api/1.1/cursor/server/modifiers/clearCursor';
import clearCaptions from '/imports/api/1.1/captions/server/modifiers/clearCaptions';
import clearPresentations from '/imports/api/1.1/presentations/server/modifiers/clearPresentations';

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
      clearCaptions(meetingId);
      clearChats(meetingId);
      clearCursor(meetingId);
      clearPresentations(meetingId);
      clearPolls(meetingId);
      clearShapes(meetingId);
      clearSlides(meetingId);
      clearUsers(meetingId);

      return Logger.info(`Removed meeting id=${meetingId}`);
    }
  };

  return Meetings.remove(selector, cb);
}
