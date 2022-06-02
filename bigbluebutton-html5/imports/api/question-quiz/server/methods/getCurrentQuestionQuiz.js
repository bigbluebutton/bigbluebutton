import QuestionQuizs from '/imports/api/question-quiz';
import Logger from '/imports/startup/server/logger';
import { extractCredentials } from '/imports/api/common/server/helpers';
import { check } from 'meteor/check';

export default function getCurrentQuestionQuiz() {
  try {
    const {meetingId} = extractCredentials(this.userId);

    check(meetingId, String);

    const questionQuiz = QuestionQuizs.findOne({meetingId}, { sort: { 'createdAt' : -1 }}) // TODO--send questionQuizid from client
    if (!questionQuiz) {
      // Logger.info(`No questionQuiz found in meetingId: ${meetingId}`);
      return false;
    }
    Logger.info(`QuestionQuiz found in meetingId: ${meetingId}`);
    return questionQuiz;
  } catch (err) {
    Logger.error(`Exception while getting questionQuiz: ${err.stack}`);
  }
}