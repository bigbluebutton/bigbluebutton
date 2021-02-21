import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import Users from '/imports/api/users';
import stopWatchingExternalVideoSystemCall from '/imports/api/external-videos/server/methods/stopWatchingExternalVideoSystemCall';
import { extractCredentials } from '/imports/api/common/server/helpers';

export default function stopWatchingExternalVideo() {
  const { meetingId, requesterUserId } = extractCredentials(this.userId);

  try {
    check(meetingId, String);
    check(requesterUserId, String);

    const user = Users.findOne({ meetingId, userId: requesterUserId });

    if (user && user.presenter) {
      // proceed and publish the event
      stopWatchingExternalVideoSystemCall({ meetingId, requesterUserId });
    }
  } catch (error) {
    Logger.error(`Error on stop sharing an external video for meeting=${meetingId} ${error}`);
  }
}
