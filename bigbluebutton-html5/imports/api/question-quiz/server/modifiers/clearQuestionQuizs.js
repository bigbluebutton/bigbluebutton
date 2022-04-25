import QuestionQuizs from '/imports/api/question-quiz';
import Logger from '/imports/startup/server/logger';

export default function clearQuestionQuizs(meetingId) {
  if (meetingId) {
    try {
      const numberAffected = QuestionQuizs.remove({ meetingId });

      if (numberAffected) {
        Logger.info(`Cleared QuestionQuizs (${meetingId})`);
      }
    } catch (err) {
      Logger.info(`Error on clearing QuestionQuizs (${meetingId}). ${err}`);
    }
  } else {
    try {
      const numberAffected = QuestionQuizs.remove({});

      if (numberAffected) {
        Logger.info('Cleared QuestionQuizs (all)');
      }
    } catch (err) {
      Logger.info(`Error on clearing QuestionQuizs (all). ${err}`);
    }
  }
}
