import Users from '/imports/api/users';
import Logger from '/imports/startup/server/logger';
import { extractCredentials } from '/imports/api/common/server/helpers';

export default function emitExternalVideoEvent(messageName, ...rest) {
  const { meetingId, requesterUserId: userId } = extractCredentials(this.userId);

  const user = Users.findOne({ userId, meetingId });

  if (user && user.presenter) {
    const streamerName = `external-videos-${meetingId}`;
    const streamer = Meteor.StreamerCentral.instances[streamerName];

    if (streamer) {
      streamer.emit(messageName, ...rest);
    } else {
      Logger.error(`External Video Streamer not found for meetingId: ${meetingId} userId: ${userId}`);
    }
  }
}
