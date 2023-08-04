import { AutoApproveQuestionsMeetings } from '/imports/api/meetings';
import Logger from '/imports/startup/server/logger';

export default function clearSendPresentationToEndopintsMeeting(meetingId) {
  const selector = {};

  if (meetingId) {
    selector.meetingId = meetingId;
  }

  try {
    const numberAffected = AutoApproveQuestionsMeetings.remove(selector);

    if (numberAffected) {
      if (meetingId) {
        Logger.info(`Removed AutoApproveQuestionsMeetings (${meetingId})`);
      } else {
        Logger.info('Removed AutoApproveQuestionsMeetings (all)');
      }
    } else {
      Logger.warn('Removing AutoApproveQuestionsMeetings nonaffected');
    }
  } catch (err) {
    Logger.error(`Removing AutoApproveQuestionsMeetings: ${err}`);
  }
}
