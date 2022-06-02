import Users from '/imports/api/users';
import QuestionQuizs from '/imports/api/question-quiz';
import Logger from '/imports/startup/server/logger';
import flat from 'flat';
import { check } from 'meteor/check';
import Service from '/imports/api/question-quiz/server/service'

export default function addQuestionQuiz(meetingId, requesterId, questionQuiz, questionQuizType, secretQuestionQuiz, question = '') {
  
  questionQuiz.answers = Service.checkCorrectAnswers(questionQuiz.answers)
  check(requesterId, String);
  check(meetingId, String);
  check(questionQuiz, {
    id: String,
    answers: [
      {
        id: Number,
        key: String,
        isCorrect: Boolean
      },
    ],
    isMultipleResponse: Boolean,
  });

  const userSelector = {
    meetingId,
    userId: { $ne: requesterId },
    clientType: { $ne: 'dial-in-user' },
  };

  const userIds = Users.find(userSelector, { fields: { userId: 1 } })
    .fetch()
    .map(user => user.userId);

  const selector = {
    meetingId,
    requester: requesterId,
    id: questionQuiz.id,
  };

  const modifier = Object.assign(
    { meetingId },
    { requester: requesterId },
    { users: userIds },
    {isPublished: false},
    {createdAt: new Date()},
    { question, questionQuizType, secretQuestionQuiz },
    flat(questionQuiz, { safe: true }),
  );


  try {
    const { insertedId } = QuestionQuizs.upsert(selector, modifier);

    if (insertedId) {
      Logger.info(`Added QuestionQuiz id=${questionQuiz.id}`);
    } else {
      Logger.info(`Upserted QuestionQuiz id=${questionQuiz.id}`);
    }
  } catch (err) {
    Logger.error(`Adding QuestionQuiz to collection: ${questionQuiz.id}`);
  }
}
