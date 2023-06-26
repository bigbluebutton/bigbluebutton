import Users from '/imports/api/users';
import Logger from '/imports/startup/server/logger';

export default function clearUsersEmoji(meetingId) {
  const selector = {};

  if (meetingId) {
    selector.meetingId = meetingId;
  }

  try {
    const numberAffected = Users.update(selector, {
      $set: {
        emojiTime: (new Date()).getTime(),
        emoji: 'none',
        awayTime: 0,
        away: false,
        raiseHandTime: 0,
        raiseHand: false,
      },
    }, { multi: true });

    if (numberAffected) {
      if (meetingId) {
        Logger.info(`Removed users emoji status (${meetingId})`);
      } else {
        Logger.info('Removed users emoji status (all)');
      }
    } else {
      Logger.warn('Removing users emoji status nonaffected');
    }
  } catch (err) {
    Logger.error(`Removing users emoji stautus: ${err}`);
  }
}
