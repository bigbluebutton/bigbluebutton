import Logger from '/imports/startup/server/logger';
import Users from '/imports/api/users';
import { extractCredentials } from '/imports/api/common/server/helpers';
import ClientConnections from '/imports/startup/server/ClientConnections';
import { check } from 'meteor/check';
import UsersPersistentData from '/imports/api/users-persistent-data';

export default async function userLeftMeeting() { 
  // TODO-- spread the code to method/modifier/handler
  try {
    // so we don't update the db in a method
    const { meetingId, requesterUserId } = extractCredentials(this.userId);

    check(meetingId, String);
    check(requesterUserId, String);

    const selector = {
      meetingId,
      userId: requesterUserId,
    };

    const numberAffected = await Users.updateAsync(selector, { $set: { loggedOut: true } });

    if (numberAffected) {
      await UsersPersistentData.updateAsync(selector, { $set: { loggedOut: true } });
      Logger.info(`user left id=${requesterUserId} meeting=${meetingId}`);
      ClientConnections.removeClientConnection(this.userId, this.connection.id);
    }
  } catch (err) {
    Logger.error(`Exception while invoking method userLeftMeeting ${err.stack}`);
  }
}
