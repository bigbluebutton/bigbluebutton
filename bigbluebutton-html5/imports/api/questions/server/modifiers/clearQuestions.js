import Questions from '/imports/api/questions';
import Logger from '/imports/startup/server/logger';

export default function clearQuestions(meetingId) {
  const selector = {};

  if (meetingId) {
    selector.meetingId = meetingId;
  }

  try {
    const numberAffected = Questions.remove(selector);

    if (numberAffected) {
      if (meetingId) {
        Logger.info(`Removed Questions (${meetingId})`);
      } else {
        Logger.info('Removed Questions (all)');
      }
    } else {
      Logger.warn('Removing Questions nonaffected');
    }
  } catch (err) {
    Logger.error(`Removing Questions: ${err}`);
  }
}
