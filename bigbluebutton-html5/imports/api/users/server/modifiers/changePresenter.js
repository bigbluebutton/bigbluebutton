import Logger from '/imports/startup/server/logger';
import Users from '/imports/api/users';
import Meetings from '/imports/api/meetings';
import stopWatchingExternalVideo from '/imports/api/external-videos/server/methods/stopWatchingExternalVideo';

export default function changePresenter(presenter, userId, meetingId, changedBy) {
  const selector = {
    meetingId,
    userId,
  };

  const modifier = {
    $set: {
      presenter,
    },
  };

  try {
    const meeting = Meetings.findOne({ meetingId });
    if (meeting && meeting.externalVideoUrl) {
      Logger.info(`ChangePresenter:There is external video being shared. Stopping it due to presenter change, ${meeting.externalVideoUrl}`);
      stopWatchingExternalVideo({ meetingId, requesterUserId: userId });
    }

    const numberAffected = Users.update(selector, modifier);

    if (numberAffected) {
      Logger.info(`Changed presenter=${presenter} id=${userId} meeting=${meetingId}`
        + `${changedBy ? ` changedBy=${changedBy}` : ''}`);
    }
  } catch (err) {
    Logger.error(`Changed user role: ${err}`);
  }
}
