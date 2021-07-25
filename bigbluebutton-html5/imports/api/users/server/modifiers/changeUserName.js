import Logger from '/imports/startup/server/logger';
import updateName from '/imports/api/users-persistent-data/server/modifiers/updateName';
import Users from '/imports/api/users';

export default function changeUserName(newUserName, userId, meetingId) {
  const selector = {
    meetingId,
    userId,
  };

  const modifier = {
    $set: {
      name: newUserName,
      sortName: newUserName.trim().toLowerCase(),
    },
  };

  try {
    const numberAffected = Users.update(selector, modifier);

    if (numberAffected) {
      updateName(userId, meetingId, newUserName);
      Logger.info(`Changed user name=${newUserName} id=${userId} meeting=${meetingId}`);
    }
  } catch (err) {
    Logger.error(`Error changing user name: ${err}`);
  }
}
