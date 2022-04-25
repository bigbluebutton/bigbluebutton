import { Meteor } from 'meteor/meteor';
import publishQuestionQuizTypedVote from './methods/publishQuestionQuizTypedVote';
import publishQuestionQuizVote from './methods/publishQuestionQuizVote';
import publishQuestionQuiz from './methods/publishQuestionQuiz';
import startQuestionQuiz from './methods/startQuestionQuiz';
import stopQuestionQuiz from './methods/stopQuestionQuiz';

Meteor.methods({
  publishQuestionQuizVote,
  publishQuestionQuizTypedVote,
  publishQuestionQuiz,
  startQuestionQuiz,
  stopQuestionQuiz,
});
