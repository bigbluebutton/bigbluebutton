import Auth from '/imports/ui/services/auth';
import { CurrentQuestionQuiz } from '/imports/api/question-quiz';
import caseInsensitiveReducer from '/imports/utils/caseInsensitiveReducer';
import { defineMessages } from 'react-intl';

const POLL_AVATAR_COLOR = '#3B48A9';
const MAX_POLL_RESULT_BARS = 20;

// 'YN' = Yes,No
// 'YNA' = Yes,No,Abstention
// 'TF' = True,False
// 'A-2' = A,B
// 'A-3' = A,B,C
// 'A-4' = A,B,C,D
// 'A-5' = A,B,C,D,E
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
  true: {
    id: 'app.poll.answer.true',
    description: 'label for poll answer True',
  },
  false: {
    id: 'app.poll.answer.false',
    description: 'label for poll answer False',
  },
  yes: {
    id: 'app.poll.answer.yes',
    description: 'label for poll answer Yes',
  },
  no: {
    id: 'app.poll.answer.no',
    description: 'label for poll answer No',
  },
  abstention: {
    id: 'app.poll.answer.abstention',
    description: 'label for poll answer Abstention',
  },
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
    id: 'app.polling.pollingTitle',
    description: 'heading for chat poll legend',
  },
  pollQuestionTitle: {
    id: 'app.polling.pollQuestionTitle',
    description: 'title displayed before poll question',
  },
});

const getQuestionQuizResultsText = (isDefaultQuestionQuiz, answers, numRespondents, intl) => {
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
    if (isDefaultQuestionQuiz) {
      const translatedKey = questionQuizAnswerIds[item.key.toLowerCase()]
        ? intl.formatMessage(questionQuizAnswerIds[item.key.toLowerCase()])
        : item.key;
      resultString += `${translatedKey}: ${item.numVotes || 0} |${pctBars} ${pctFotmatted}\n`;
    } else {
      resultString += `${item.id + 1}: ${item.numVotes || 0} |${pctBars} ${pctFotmatted}\n`;
      optionsString += `${item.id + 1}: ${item.key}\n`;
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
  resultString = sanitize(resultString);
  optionsString = sanitize(optionsString);

  let questionQuizText = formatBoldBlack(resultString);
  if (!ísDefault) {
    questionQuizText += formatBoldBlack(`<br/><br/>${intl.formatMessage(intlMessages.legendTitle)}<br/>`);
    questionQuizText += optionsString;
  }

  const questionQuizQuestion = questionQuizResultData.questionText;
  if (questionQuizQuestion.trim() !== '') {
    const sanitizedQuestionQuizQuestion = sanitize(questionQuizQuestion.split('<br#>').join(' '));

    questionQuizText = `${formatBoldBlack(intl.formatMessage(intlMessages.questionQuizQuestionTitle))}<br/>${sanitizedQuestionQuizQuestion}<br/><br/>${questionQuizText}`;
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
  currentQuestionQuiz: () => {console.log("all quizes", CurrentQuestionQuiz.find({}));return CurrentQuestionQuiz.findOne({ meetingId: Auth.meetingID })},
  questionQuizAnswerIds,
  POLL_AVATAR_COLOR,
  isDefaultQuestionQuiz,
  getQuestionQuizResultString,
  matchYesNoQuestionQuiz,
  matchYesNoAbstentionQuestionQuiz,
  matchTrueFalseQuestionQuiz,
  checkQuestionQuizType,
};
