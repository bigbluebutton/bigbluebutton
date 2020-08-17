import Logger from '/imports/startup/server/logger';
import Users from '/imports/api/users';
import Meetings from '/imports/api/meetings';
import { Slides } from '/imports/api/slides';
import stopWatchingExternalVideo from '/imports/api/external-videos/server/methods/stopWatchingExternalVideo';
import modifyWhiteboardAccess from '/imports/api/whiteboard-multi-user/server/modifiers/modifyWhiteboardAccess';

export default function changePresenter(presenter, userId, meetingId, changedBy) {
  const selector = {
    meetingId,
    userId,
  };

  const modifier = {
    $set: {
      presenter,
      whiteboardAccess: presenter,
    },
  };

  const cb = (err, numChanged) => {
    if (err) {
      return Logger.error(`Changed user role: ${err}`);
    }

    if (numChanged) {
      return Logger.info(`Changed presenter=${presenter} id=${userId} meeting=${meetingId}`
      + `${changedBy ? ` changedBy=${changedBy}` : ''}`);
    }

    return null;
  };

  const meeting = Meetings.findOne({ meetingId });
  if (meeting && meeting.externalVideoUrl) {
    Logger.info(`ChangePresenter:There is external video being shared. Stopping it due to presenter change, ${meeting.externalVideoUrl}`);
    stopWatchingExternalVideo({ meetingId, requesterUserId: userId });
  }

  const currentSlide = Slides.findOne({
    podId: 'DEFAULT_PRESENTATION_POD',
    meetingId,
    current: true,
  }, {
    fields: {
      id: 1,
    },
  });

  if (currentSlide) {
    modifyWhiteboardAccess(meetingId, currentSlide.id, false);
  }

  return Users.update(selector, modifier, cb);
}
