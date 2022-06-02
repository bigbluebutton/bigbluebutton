import React from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import Users from '/imports/api/users';
import Auth from '/imports/ui/services/auth';
import QuestionQuizingService from './service';
import QuestionQuizService from '/imports/ui/components/question-quiz/service';
import QuestioningComponent from './component';
import { isQuestioningEnabled } from '/imports/ui/services/features';

const propTypes = {
  questionQuizExists: PropTypes.bool.isRequired,
};

const QuestioningContainer = ({ questionQuizExists, ...props }) => {
  const currentUser = Users.findOne({ userId: Auth.userID }, { fields: { presenter: 1 } });
  const showQuestioning = questionQuizExists && !currentUser.presenter && isQuestioningEnabled();
  if (showQuestioning) {
    return (
      <QuestioningComponent {...props} />
    );
  }
  return null;
};

QuestioningContainer.propTypes = propTypes;

export default withTracker(() => {
  const {
    questionQuizExists, handleVote, questionQuiz, handleTypedVote,
  } = QuestionQuizingService.mapQuestionQuizs();
  const { questionQuizTypes } = QuestionQuizService;

  if (questionQuiz && questionQuiz?.questionQuizType) {
    const isResponse = questionQuiz.questionQuizType === questionQuizTypes.Custom;
    Meteor.subscribe('questionQuizs', isResponse);
  }

  return ({
    questionQuizExists,
    handleVote,
    handleTypedVote,
    questionQuiz,
    questionQuizAnswerIds: QuestionQuizService.questionQuizAnswerIds,
    questionQuizTypes,
    isDefaultQuestionQuiz: QuestionQuizService.isDefaultQuestionQuiz,
    isMeteorConnected: Meteor.status().connected,
  });
})(QuestioningContainer);
