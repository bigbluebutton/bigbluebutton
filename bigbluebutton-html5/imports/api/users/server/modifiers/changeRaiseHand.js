import Logger from '/imports/startup/server/logger';
import Users from '/imports/api/users';

export default async function changeRaiseHand(meetingId, userId, raiseHand) {
  const selector = {
    meetingId,
    userId,
  };

  const modifier = {
    $set: {
      raiseHand,
      raiseHandTime: raiseHand ? (new Date()).getTime() : 0,
    },
  };

  try {
    const numberAffected = await Users.updateAsync(selector, modifier);

    if (numberAffected) {
      Logger.info(`Assigned raiseHand=${raiseHand} user id=${userId} meeting=${meetingId}`);
    }
  } catch (err) {
    Logger.error(`Assigning raiseHand user: ${err}`);
  }
}
