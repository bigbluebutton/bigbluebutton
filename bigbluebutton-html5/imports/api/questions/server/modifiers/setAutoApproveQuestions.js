import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import { AutoApproveQuestionsMeetings } from '/imports/api/meetings';

export default function setAutoApproveQuestions(meetingId, autoApprove) {
  check(meetingId, String);
  check(autoApprove, Boolean);

  const selector = {
    meetingId,
  };

  const modifier = {
    $set: { autoApprove },
  };

  try {
    const { numberAffected } = AutoApproveQuestionsMeetings.upsert(selector, modifier);

    if (numberAffected) {
      Logger.verbose(`Changed auto approve questions meetingId=${meetingId} to autoApprove=${autoApprove}`);
    }
  } catch (err) {
    Logger.error(`Changing auto approve questions: ${err}`);
  }
}
