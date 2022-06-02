import { Meteor } from 'meteor/meteor';

const collectionOptions = Meteor.isClient ? {
  connection: null,
} : {};

const QuestionQuizs = new Mongo.Collection('questionQuizs',collectionOptions);
export const CurrentQuestionQuiz = new Mongo.Collection('current-questionQuiz', { connection: null });

if (Meteor.isServer) {
  // We can have just one active questionQuiz per meeting
  // makes no sense to index it by anything other than meetingId

  QuestionQuizs._ensureIndex({ meetingId: 1 });
}

export default QuestionQuizs;
