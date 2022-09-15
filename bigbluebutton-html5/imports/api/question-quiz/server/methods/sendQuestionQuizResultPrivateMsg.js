import Logger from '/imports/startup/server/logger';
import { extractCredentials } from '/imports/api/common/server/helpers';
import { check } from 'meteor/check';
import handleSendPrivateChatToUsersForPublishedQuestionQuiz from '../handlers/sendQuestionQuizPrivateChatMsg'
import QuestionQuizs from '/imports/api/question-quiz';

export default function sendQuestionQuizResultPrivateMsg(messageLabels, isQuestionQuizPublished) {
  try {
    const { meetingId, requesterUserId } = extractCredentials(this.userId);
    check(isQuestionQuizPublished, Boolean)
    check(messageLabels, Object)
    check(meetingId, String);
    check(requesterUserId, String);
    const questionQuiz = QuestionQuizs.findOne({ meetingId, isPublished: false });

    //--send private chat message containig question results
    const {answers, question, responses, users} = questionQuiz
    const userResponses = responses ? responses : []
    users.forEach((userId) => userResponses.push({
      userId,
      answerIds: []
    }))
    handleSendPrivateChatToUsersForPublishedQuestionQuiz(this.userId, question,
        userResponses, answers, messageLabels, isQuestionQuizPublished)
  } catch (err) {
    Logger.error(`Exception while invoking method sendQuestionQuizResultPrivateMsg ${err.stack}`);
  }
}
