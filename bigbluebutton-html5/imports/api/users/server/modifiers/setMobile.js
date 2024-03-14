import Logger from '/imports/startup/server/logger';
import Users from '/imports/api/users';

export default async function setMobile(meetingId, userId) {
  const selector = {
    meetingId,
    userId,
  };

  const modifier = {
    $set: {
      mobile: true,
    },
  };

  try {
    const numberAffected = await Users.updateAsync(selector, modifier);

    if (numberAffected) {
      Logger.info(`Assigned mobile user id=${userId} meeting=${meetingId}`);
    }
  } catch (err) {
    Logger.error(`Assigning mobile user: ${err}`);
  }
}
