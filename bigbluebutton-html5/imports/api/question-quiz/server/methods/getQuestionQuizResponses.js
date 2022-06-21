import QuestionQuizs from '/imports/api/question-quiz';
import Logger from '/imports/startup/server/logger';
import { extractCredentials } from '/imports/api/common/server/helpers';

export default function getQuestionQuizResponses(id) {
  try {
    const {meetingId} = extractCredentials(this.userId);
    const questionQuiz = QuestionQuizs.findOne({meetingId, id})
    if (!questionQuiz) {
      return false;
    }
    return questionQuiz.responses;
  } catch (err) {
    Logger.info(`No Question Quiz found in meeting: ${meetingId},  ${err.stack}`);
  }
}