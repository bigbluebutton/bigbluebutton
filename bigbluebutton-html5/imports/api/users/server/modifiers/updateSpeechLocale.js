import Logger from '/imports/startup/server/logger';
import Users from '/imports/api/users';

export default async function updateSpeechLocale(meetingId, userId, locale) {
  const selector = {
    meetingId,
    userId,
  };

  const modifier = {
    $set: {
      speechLocale: locale,
    },
  };

  try {
    const numberAffected = await Users.updateAsync(selector, modifier);

    if (numberAffected) {
      Logger.info(`Updated speech locale=${locale} userId=${userId} meetingId=${meetingId}`);
    }
  } catch (err) {
    Logger.error(`Updating speech locale: ${err}`);
  }
}
