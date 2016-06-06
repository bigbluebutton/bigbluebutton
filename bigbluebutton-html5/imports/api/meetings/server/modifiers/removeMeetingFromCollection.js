import { clearUsersCollection } from '/imports/api/users/server/modifiers/clearUsersCollection';
import { clearChatCollection } from '/imports/api/chat/server/modifiers/clearChatCollection';
import { clearShapesCollection } from '/imports/api/shapes/server/modifiers/clearShapesCollection';
import { clearSlidesCollection } from '/imports/api/slides/server/modifiers/clearSlidesCollection';
import { clearPresentationsCollection } from '/imports/api/presentations/server/modifiers/clearPresentationsCollection';
import {clearMeetingsCollection} from '/imports/api/meetings/server/modifiers/clearMeetingsCollection';
import { clearPollCollection } from '/imports/api/polls/server/modifiers/clearPollCollection';
import { clearCursorCollection } from '/imports/api/cursor/server/modifiers/clearCursorCollection';
import Meetings from '/imports/api/meetings';
import { logger } from '/imports/startup/server/logger';

//clean up upon a meeting's end
export function removeMeetingFromCollection(meetingId, callback) {
  if (Meetings.findOne({
    meetingId: meetingId,
  }) != null) {
    logger.info(`end of meeting ${meetingId}. Clear the meeting data from all collections`);

    // delete all users in the meeting
    clearUsersCollection(meetingId);

    // delete all slides in the meeting
    clearSlidesCollection(meetingId);

    // delete all shapes in the meeting
    clearShapesCollection(meetingId);

    // delete all presentations in the meeting
    clearPresentationsCollection(meetingId);

    // delete all chat messages in the meeting
    clearChatCollection(meetingId);

    // delete the meeting
    clearMeetingsCollection(meetingId);

    // delete the cursor for the meeting
    clearCursorCollection(meetingId);

    //delete the polls for the meeting
    clearPollCollection(meetingId);
    return callback();
  } else {
    let funct = function (localCallback) {
      logger.error(`Error! There was no such meeting ${meetingId}`);
      return localCallback();
    };

    return funct(callback);
  }
};
