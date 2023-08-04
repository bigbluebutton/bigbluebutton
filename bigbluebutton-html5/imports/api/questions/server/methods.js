import { Meteor } from 'meteor/meteor';
import createQuestion from './methods/createQuestion';
import approveQuestion from './methods/approveQuestion';
import deleteQuestion from './methods/deleteQuestion';
import setQuestionAnswered from './methods/setQuestionAnswered';
import sendUpvote from './methods/sendUpvote';
import toggleAutoApproveQuestions from './methods/toggleAutoApproveQuestions';

Meteor.methods({
  createQuestion,
  approveQuestion,
  deleteQuestion,
  setQuestionAnswered,
  sendUpvote,
  toggleAutoApproveQuestions,
});
