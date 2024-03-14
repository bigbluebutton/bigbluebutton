import Logger from '/imports/startup/server/logger';
import updateRole from '/imports/api/users-persistent-data/server/modifiers/updateRole';
import Users from '/imports/api/users';

export default async function changeRole(role, userId, meetingId, changedBy) {
  const selector = {
    meetingId,
    userId,
  };

  const modifier = {
    $set: {
      role,
    },
  };

  try {
    const numberAffected = await Users.updateAsync(selector, modifier);

    if (numberAffected) {
      await updateRole(userId, meetingId, role);
      Logger.info(`Changed user role=${role} id=${userId} meeting=${meetingId}`
        + `${changedBy ? ` changedBy=${changedBy}` : ''}`);
    }
  } catch (err) {
    Logger.error(`Changed user role: ${err}`);
  }
}
