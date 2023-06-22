import Logger from '/imports/startup/server/logger';
import Users from '/imports/api/users';
import sendAwayStatusChatMsg from '../methods/sendAwayStatusChatMsg';

export default async function changeAway(meetingId, userId, away) {
  const selector = {
    meetingId,
    userId,
  };

  const modifier = {
    $set: {
      away,
      awayTime: away ? (new Date()).getTime() : 0,
    },
  };

  try {
    // must be called before modifying the users collection, because it
    // needs to be consulted in order to know the previous emoji
    sendAwayStatusChatMsg(meetingId, userId, away);

    const numberAffected = await Users.updateAsync(selector, modifier);
    if (numberAffected) {
      Logger.info(`Assigned away=${away} user id=${userId} meeting=${meetingId}`);
    }
  } catch (err) {
    Logger.error(`Assigning away user: ${err}`);
  }
}
