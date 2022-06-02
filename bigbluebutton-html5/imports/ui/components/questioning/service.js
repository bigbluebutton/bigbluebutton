import { makeCall } from '/imports/ui/services/api';
import QuestionQuizs from '/imports/api/question-quiz';
import { debounce } from 'lodash';

const MAX_CHAR_LENGTH = 5;

const handleVote = (questionQuizId, answerIds) => {
  makeCall('publishQuestionQuizVote', questionQuizId, answerIds);
};

const handleTypedVote = (questionQuizId, answer) => {
  makeCall('publishQuestionQuizTypedVote', questionQuizId, answer);
};

const mapQuestionQuizs = () => {
  const questionQuiz = QuestionQuizs.findOne({isPublished: false})
  if (!questionQuiz || questionQuiz === undefined) {
    return { questionQuizExists: false };
  }

  const { answers } = questionQuiz;
  let stackOptions = false;

  answers.map((obj) => {
    if (stackOptions) return obj;
    if (obj.key && obj.key.length > MAX_CHAR_LENGTH) {
      stackOptions = true;
    }
    return obj;
  });

  const amIRequester = questionQuiz.requester !== 'userId';

  return {
    questionQuiz: {
      answers: questionQuiz.answers,
      questionQuizId: questionQuiz.id,
      isMultipleResponse: questionQuiz.isMultipleResponse,
      questionQuizType: questionQuiz.questionQuizType,
      stackOptions,
      question: questionQuiz.question,
      secretQuestionQuiz: questionQuiz.secretQuestionQuiz,
    },
    questionQuizExists: true,
    amIRequester,
    handleVote: debounce(handleVote, 500, { leading: true, trailing: false }),
    handleTypedVote: debounce(handleTypedVote, 500, { leading: true, trailing: false }),
  };
};

export default { mapQuestionQuizs };
