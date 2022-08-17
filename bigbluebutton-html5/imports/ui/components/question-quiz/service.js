import Auth from '/imports/ui/services/auth';
import { CurrentQuestionQuiz } from '/imports/api/question-quiz';
import caseInsensitiveReducer from '/imports/utils/caseInsensitiveReducer';
import { defineMessages } from 'react-intl';
import {
  questioningsuccessDarkColorCode,
} from '/imports/ui/stylesheets/styled-components/palette';

const QUIZ_AVATAR_COLOR = questioningsuccessDarkColorCode;
const MAX_POLL_RESULT_BARS = 20;
const QUIZ_SETTINGS = Meteor.settings.public.questionQuiz;
const CORRECT_OPTION_SYMBOL = QUIZ_SETTINGS.correct_option_symbol

const questionQuizTypes = {
  YesNo: 'YN',
  YesNoAbstention: 'YNA',
  TrueFalse: 'TF',
  Letter: 'A-',
  A2: 'A-2',
  A3: 'A-3',
  A4: 'A-4',
  A5: 'A-5',
  Custom: 'CUSTOM',
  Response: 'R-',
};

const questionQuizAnswerIds = {
  a: {
    id: 'app.poll.answer.a',
    description: 'label for poll answer A',
  },
  b: {
    id: 'app.poll.answer.b',
    description: 'label for poll answer B',
  },
  c: {
    id: 'app.poll.answer.c',
    description: 'label for poll answer C',
  },
  d: {
    id: 'app.poll.answer.d',
    description: 'label for poll answer D',
  },
  e: {
    id: 'app.poll.answer.e',
    description: 'label for poll answer E',
  },
};

const intlMessages = defineMessages({
  legendTitle: {
    id: 'app.questionQuiz.options.label',
    description: 'heading for chat quiz legend',
  },
  questionQuizQuestionTitle: {
    id: 'app.questionQuiz.question.label',
    description: 'title displayed before quiz question',
  },
  questionQuizStatsVotesLabel: {
    id: 'app.poll.liveResult.responsesTitle',
    description: 'Quiz stats votes title label.',
  },
  questionQuizCorrectLabel: {
    id: 'app.questionQuiz.correctOptionLabel',
    description: 'Quiz results correct lable',
  },
  questioningLabel: {
    id: 'app.questionQuiz.questionQuizPaneTitle',
    description: 'Quiz haeder title',
  },
  
});

const isCorrectOption = (opt) => {
  const trimmedOption = opt.trim();
  const trimmedOptLength = trimmedOption.length
  const correctOptSymLength = CORRECT_OPTION_SYMBOL.length
  return (
    trimmedOptLength > correctOptSymLength &&
    trimmedOption.substring(trimmedOptLength -
    correctOptSymLength) === CORRECT_OPTION_SYMBOL
  )
}

const getQuestionQuizResultsText = (isDefaultQuestionQuiz, answers, numRespondents, intl) => {
  const correctOptionStyles = 
  `color:${questioningsuccessDarkColorCode};font-weight:bold;padding:0;margin:0`
  const correctOptionVoteStyles = 
  `color:${questioningsuccessDarkColorCode};font-weight:bold;padding:0;margin:0`
  const IncorrectOptionVoteStyles = 
  `color:black;font-weight:bold;padding:0;margin:0`
  let responded = 0;
  let resultString = '';
  let optionsString = '';

  answers.map((item) => {
    responded += item.numVotes;
    return item;
  }).reduce(caseInsensitiveReducer, []).forEach((item) => {
    const numResponded = responded === numRespondents ? numRespondents : responded;
    const pct = Math.round((item.numVotes / numResponded) * 100);
    const pctBars = '|'.repeat((pct * MAX_POLL_RESULT_BARS) / 100);
    const pctFotmatted = `${Number.isNaN(pct) ? 0 : pct}%`;
    const isCorrectOpt = isCorrectOption(item.key)
    if (isDefaultQuestionQuiz) {
      const translatedKey = questionQuizAnswerIds[item.key.toLowerCase()]
        ? intl.formatMessage(questionQuizAnswerIds[item.key.toLowerCase()])
        : item.key;
      resultString += isCorrectOpt ? `<p style=${correctOptionVoteStyles}>${translatedKey}: ${item.numVotes || 0} |${pctBars} ${pctFotmatted}</p>` : 
      `<p style=${IncorrectOptionVoteStyles}>${translatedKey}: ${item.numVotes || 0} |${pctBars} ${pctFotmatted}</p>\n`;
    } else {
      resultString += isCorrectOpt ? `<span style=${correctOptionVoteStyles}>${item.id + 1}: ${item.numVotes || 0} |${pctBars} ${pctFotmatted}</span>\n`:
      `<span style=${IncorrectOptionVoteStyles}>${item.id + 1}: ${item.numVotes || 0} |${pctBars} ${pctFotmatted}</span>\n`;
      optionsString += isCorrectOpt ? 
      `<span style=${correctOptionStyles}>${item.id + 1}:${item.key.trim()
        .substring(0, item.key.length - CORRECT_OPTION_SYMBOL.length)} (${intl.
          formatMessage(intlMessages.questionQuizCorrectLabel)})\n</span>`
      : `${item.id + 1}: ${item.key}\n`;
    }
  });

  return { resultString, optionsString };
};

const isDefaultQuestionQuiz = (questionQuizType) => questionQuizType !== questionQuizTypes.Custom
  && questionQuizType !== questionQuizTypes.Response;

const getQuestionQuizResultString = (questionQuizResultData, intl) => {
  const formatBoldBlack = (s) => s.bold().fontcolor('black');

  // Sanitize. See: https://gist.github.com/sagewall/47164de600df05fb0f6f44d48a09c0bd
  const sanitize = (value) => {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(value));
    return div.innerHTML;
  };

  const { answers, numRespondents, questionType } = questionQuizResultData;
  const ísDefault = isDefaultQuestionQuiz(questionType);
  let {
    resultString,
    optionsString,
  } = getQuestionQuizResultsText(ísDefault, answers, numRespondents, intl);
  // resultString = sanitize(resultString);
  // optionsString = sanitize(optionsString);

  let questionQuizText = resultString;
  if (!ísDefault) {
    questionQuizText += formatBoldBlack(`\n${intl.formatMessage(intlMessages.legendTitle)}<br/>`);
    questionQuizText += optionsString;
  }

  const questionQuizQuestion = questionQuizResultData.questionText;
  if (questionQuizQuestion.trim() !== '') {
    const sanitizedQuestionQuizQuestion = sanitize(questionQuizQuestion.split('<br#>').join(' '));

    questionQuizText = `${formatBoldBlack(intl.formatMessage(intlMessages.questioningLabel) + " " + intl.formatMessage(intlMessages.questionQuizQuestionTitle))}<br/>${sanitizedQuestionQuizQuestion}<br/><br/>${formatBoldBlack(intl.formatMessage(intlMessages.questionQuizStatsVotesLabel))}<br/>${questionQuizText}`;
  }

  return questionQuizText;
};

const matchYesNoQuestionQuiz = (yesValue, noValue, contentString) => {
  const ynQuestionQuizString = `(${yesValue}\\s*\\/\\s*${noValue})|(${noValue}\\s*\\/\\s*${yesValue})`;
  const ynOptionsRegex = new RegExp(ynQuestionQuizString, 'gi');
  const ynQuestionQuiz = contentString.replace(/\n/g, '').match(ynOptionsRegex) || [];
  return ynQuestionQuiz;
};

const matchYesNoAbstentionQuestionQuiz = (yesValue, noValue, abstentionValue, contentString) => {
  const ynaQuestionQuizString = `(${yesValue}\\s*\\/\\s*${noValue}\\s*\\/\\s*${abstentionValue})|(${yesValue}\\s*\\/\\s*${abstentionValue}\\s*\\/\\s*${noValue})|(${abstentionValue}\\s*\\/\\s*${yesValue}\\s*\\/\\s*${noValue})|(${abstentionValue}\\s*\\/\\s*${noValue}\\s*\\/\\s*${yesValue})|(${noValue}\\s*\\/\\s*${yesValue}\\s*\\/\\s*${abstentionValue})|(${noValue}\\s*\\/\\s*${abstentionValue}\\s*\\/\\s*${yesValue})`;
  const ynaOptionsRegex = new RegExp(ynaQuestionQuizString, 'gi');
  const ynaQuestionQuiz = contentString.replace(/\n/g, '').match(ynaOptionsRegex) || [];
  return ynaQuestionQuiz;
};

const matchTrueFalseQuestionQuiz = (trueValue, falseValue, contentString) => {
  const tfQuestionQuizString = `(${trueValue}\\s*\\/\\s*${falseValue})|(${falseValue}\\s*\\/\\s*${trueValue})`;
  const tgOptionsRegex = new RegExp(tfQuestionQuizString, 'gi');
  const tfQuestionQuiz = contentString.match(tgOptionsRegex) || [];
  return tfQuestionQuiz;
};

const checkQuestionQuizType = (
  type,
  optList,
  yesValue,
  noValue,
  abstentionValue,
  trueValue,
  falseValue,
) => {
  let _type = type;
  let questionQuizString = '';
  let defaultMatch = null;
  let isDefault = null;

  switch (_type) {
    case questionQuizTypes.Letter:
      questionQuizString = optList.map((x) => x.val.toUpperCase()).sort().join('');
      defaultMatch = questionQuizString.match(/^(ABCDEFG)|(ABCDEF)|(ABCDE)|(ABCD)|(ABC)|(AB)$/gi);
      isDefault = defaultMatch && questionQuizString.length === defaultMatch[0].length;
      _type = isDefault ? `${_type}${defaultMatch[0].length}` : questionQuizTypes.Custom;
      break;
    case questionQuizTypes.TrueFalse:
      questionQuizString = optList.map((x) => x.val).join('/');
      defaultMatch = matchTrueFalseQuestionQuiz(trueValue, falseValue, questionQuizString);
      isDefault = defaultMatch.length > 0 && questionQuizString.length === defaultMatch[0].length;
      if (!isDefault) _type = questionQuizTypes.Custom;
      break;
    case questionQuizTypes.YesNoAbstention:
      questionQuizString = optList.map((x) => x.val).join('/');
      defaultMatch = matchYesNoAbstentionQuestionQuiz
      (yesValue, noValue, abstentionValue, questionQuizString);
      isDefault = defaultMatch.length > 0 && questionQuizString.length === defaultMatch[0].length;
      if (!isDefault) {
        // also try to match only yes/no
        defaultMatch = matchYesNoQuestionQuiz(yesValue, noValue, questionQuizString);
        isDefault = defaultMatch.length > 0 && questionQuizString.length === defaultMatch[0].length;
        _type = isDefault ? questionQuizTypes.YesNo : _type = questionQuizTypes.Custom;
      }
      break;
    default:
      break;
  }
  return _type;
};

export default {
  questionQuizTypes,
  currentQuestionQuiz: () => CurrentQuestionQuiz.findOne({ meetingId: Auth.meetingID, isPublished: false }),
  questionQuizAnswerIds,
  QUIZ_AVATAR_COLOR,
  isDefaultQuestionQuiz,
  getQuestionQuizResultString,
  matchYesNoQuestionQuiz,
  matchYesNoAbstentionQuestionQuiz,
  matchTrueFalseQuestionQuiz,
  checkQuestionQuizType,
  isCorrectOption,
  CORRECT_OPTION_SYMBOL
};
