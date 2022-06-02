const QUIZ_SETTINGS = Meteor.settings.public.questionQuiz;
const CORRECT_OPTION_SYMBOL = QUIZ_SETTINGS.correct_option_symbol;

const isCorrectOption = (opt) => {
  const trimmedOption = opt.trim();
  const trimmedOptLength = trimmedOption.length
  const correctOptSymLength = CORRECT_OPTION_SYMBOL.length
  return (
    (trimmedOptLength > correctOptSymLength &&
    trimmedOption.substring(trimmedOptLength -
    correctOptSymLength) === CORRECT_OPTION_SYMBOL) || 
    (opt.isCorrect)
  )
}

const checkCorrectAnswers = (answers) => {
  answers.forEach((opt, i) => {
    const questionQuizAnswer = answers[i]
    questionQuizAnswer.isCorrect = false;
    if(isCorrectOption(opt.key)){
      questionQuizAnswer.key = questionQuizAnswer.key.substring(0, questionQuizAnswer.key.length - CORRECT_OPTION_SYMBOL.length)
      questionQuizAnswer.isCorrect = true;
    }
  })
  return answers;
}

export default {
    checkCorrectAnswers
}