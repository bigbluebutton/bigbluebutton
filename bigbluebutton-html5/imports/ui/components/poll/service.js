import Auth from '/imports/ui/services/auth';
import { CurrentPoll } from '/imports/api/polls';
import { escapeHtml } from '/imports/utils/string-utils';
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
const pollTypes = {
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

const pollAnswerIds = {
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

const getPollResultsText = (isDefaultPoll, answers, numRespondents, intl) => {
  let responded = 0;
  let resultString = '';
  let optionsString = '';

  answers.map((item) => {
    responded += item.numVotes;
    return item;
  }).forEach((item) => {
    const numResponded = responded === numRespondents ? numRespondents : responded;
    const pct = Math.round((item.numVotes / numResponded) * 100);
    const pctBars = '|'.repeat((pct * MAX_POLL_RESULT_BARS) / 100);
    const pctFotmatted = `${Number.isNaN(pct) ? 0 : pct}%`;
    if (isDefaultPoll) {
      const translatedKey = pollAnswerIds[item.key.toLowerCase()]
        ? intl.formatMessage(pollAnswerIds[item.key.toLowerCase()])
        : item.key;
      resultString += `${translatedKey}: ${item.numVotes || 0} |${pctBars} ${pctFotmatted}\n`;
    } else {
      resultString += `${item.id + 1}: ${item.numVotes || 0} |${pctBars} ${pctFotmatted}\n`;
      optionsString += `${item.id + 1}: ${item.key}\n`;
    }
  });

  return { resultString, optionsString };
};

const isDefaultPoll = (pollType) => pollType !== pollTypes.Custom
  && pollType !== pollTypes.Response;

const getPollResultString = (pollResultData, intl) => {
  const formatBoldBlack = (s) => s.bold().fontcolor('black');

  const sanitize = (value) => escapeHtml(value);

  const { answers, numRespondents, questionType } = pollResultData;
  const ísDefault = isDefaultPoll(questionType);
  let {
    resultString,
    optionsString,
  } = getPollResultsText(ísDefault, answers, numRespondents, intl);
  resultString = sanitize(resultString);
  optionsString = sanitize(optionsString);

  let pollText = formatBoldBlack(resultString);
  if (!ísDefault) {
    pollText += formatBoldBlack(`<br/><br/>${intl.formatMessage(intlMessages.legendTitle)}<br/>`);
    pollText += optionsString;
  }

  const pollQuestion = pollResultData.questionText;
  if (pollQuestion.trim() !== '') {
    const sanitizedPollQuestion = sanitize(pollQuestion.split('<br#>').join(' '));

    pollText = `${formatBoldBlack(intl.formatMessage(intlMessages.pollQuestionTitle))}<br/>${sanitizedPollQuestion}<br/><br/>${pollText}`;
  }

  return pollText;
};

const matchYesNoPoll = (yesValue, noValue, contentString) => {
  const ynPollString = `(${yesValue}\\s*\\/\\s*${noValue})|(${noValue}\\s*\\/\\s*${yesValue})`;
  const ynOptionsRegex = new RegExp(ynPollString, 'gi');
  const ynPoll = contentString.replace(/\n/g, '').match(ynOptionsRegex) || [];
  return ynPoll;
};

const matchYesNoAbstentionPoll = (yesValue, noValue, abstentionValue, contentString) => {
  const ynaPollString = `(${yesValue}\\s*\\/\\s*${noValue}\\s*\\/\\s*${abstentionValue})|(${yesValue}\\s*\\/\\s*${abstentionValue}\\s*\\/\\s*${noValue})|(${abstentionValue}\\s*\\/\\s*${yesValue}\\s*\\/\\s*${noValue})|(${abstentionValue}\\s*\\/\\s*${noValue}\\s*\\/\\s*${yesValue})|(${noValue}\\s*\\/\\s*${yesValue}\\s*\\/\\s*${abstentionValue})|(${noValue}\\s*\\/\\s*${abstentionValue}\\s*\\/\\s*${yesValue})`;
  const ynaOptionsRegex = new RegExp(ynaPollString, 'gi');
  const ynaPoll = contentString.replace(/\n/g, '').match(ynaOptionsRegex) || [];
  return ynaPoll;
};

const matchTrueFalsePoll = (trueValue, falseValue, contentString) => {
  const tfPollString = `(${trueValue}\\s*\\/\\s*${falseValue})|(${falseValue}\\s*\\/\\s*${trueValue})`;
  const tgOptionsRegex = new RegExp(tfPollString, 'gi');
  const tfPoll = contentString.match(tgOptionsRegex) || [];
  return tfPoll;
};

const checkPollType = (
  type,
  optList,
  yesValue,
  noValue,
  abstentionValue,
  trueValue,
  falseValue,
) => {
  let _type = type;
  let pollString = '';
  let defaultMatch = null;
  let isDefault = null;

  switch (_type) {
    case pollTypes.Letter:
      pollString = optList.map((x) => x.val.toUpperCase()).sort().join('');
      defaultMatch = pollString.match(/^(ABCDEFG)|(ABCDEF)|(ABCDE)|(ABCD)|(ABC)|(AB)$/gi);
      isDefault = defaultMatch && pollString.length === defaultMatch[0].length;
      _type = isDefault ? `${_type}${defaultMatch[0].length}` : pollTypes.Custom;
      break;
    case pollTypes.TrueFalse:
      pollString = optList.map((x) => x.val).join('/');
      defaultMatch = matchTrueFalsePoll(trueValue, falseValue, pollString);
      isDefault = defaultMatch.length > 0 && pollString.length === defaultMatch[0].length;
      if (!isDefault) _type = pollTypes.Custom;
      break;
    case pollTypes.YesNoAbstention:
      pollString = optList.map((x) => x.val).join('/');
      defaultMatch = matchYesNoAbstentionPoll(yesValue, noValue, abstentionValue, pollString);
      isDefault = defaultMatch.length > 0 && pollString.length === defaultMatch[0].length;
      if (!isDefault) {
        // also try to match only yes/no
        defaultMatch = matchYesNoPoll(yesValue, noValue, pollString);
        isDefault = defaultMatch.length > 0 && pollString.length === defaultMatch[0].length;
        _type = isDefault ? pollTypes.YesNo : _type = pollTypes.Custom;
      }
      break;
    default:
      break;
  }
  return _type;
};

export default {
  pollTypes,
  currentPoll: () => CurrentPoll.findOne({ meetingId: Auth.meetingID }),
  pollAnswerIds,
  POLL_AVATAR_COLOR,
  isDefaultPoll,
  getPollResultString,
  matchYesNoPoll,
  matchYesNoAbstentionPoll,
  matchTrueFalsePoll,
  checkPollType,
};
