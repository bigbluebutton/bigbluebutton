import { defineMessages } from 'react-intl';
import { escapeHtml } from '/imports/utils/string-utils';

const POLL_AVATAR_COLOR = '#3B48A9';
const MAX_POLL_RESULT_BARS = 10;
const MAX_POLL_RESULT_KEY_LENGTH = 30;
const POLL_BAR_CHAR = '\u220E';

interface PollResultData {
  id: string;
  answers: {
    id: number;
    key: string;
    numVotes: number;
  }[];
  numRespondents: number;
  numResponders: number;
  questionText: string;
  questionType: string;
  type: string;
  whiteboardId: string;
}

interface Intl {
  formatMessage: (descriptor: { id: string; description: string }) => string;
}

export const pollTypes = {
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

export const pollTypesKeys = {
  yes: 'Yes',
  no: 'No',
  abstention: 'Abstention',
  true: 'True',
  false: 'False',
  A: 'A',
  B: 'B',
  C: 'C',
  D: 'D',
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

const getUsedLabels = (listOfAnswers: PollResultData['answers'], possibleLabels: string[]) => listOfAnswers.map(
  (answer) => {
    if (answer.key.length >= 2) {
      const formattedLabel = answer.key.slice(0, 2).toUpperCase();
      if (possibleLabels.includes(formattedLabel)) {
        return formattedLabel;
      }
    }
    return undefined;
  },
);

const getFormattedAnswerValue = (answerText: string) => {
  // In generatePossibleLabels there is a check to see if the
  // answer's length is greater than 2
  const newText = answerText.slice(2).trim();
  return newText;
};

const generateAlphabetList = () => Array.from(Array(26))
  .map((_, i) => i + 65).map((x) => String.fromCharCode(x));

const generatePossibleLabels = (alphabetCharacters: string[]) => {
  // Remove the Letter from the beginning and the following sign, if any, like so:
  // "A- the answer is" -> Remove "A-" -> "the answer is"
  const listOfForbiddenSignsToStart = ['.', ':', '-'];

  const possibleLabels = [];
  for (let i = 0; i < alphabetCharacters.length; i += 1) {
    for (let j = 0; j < listOfForbiddenSignsToStart.length; j += 1) {
      possibleLabels.push(alphabetCharacters[i] + listOfForbiddenSignsToStart[j]);
    }
  }
  return possibleLabels;
};

const truncate = (text: string, length: number) => {
  let resultText = text;
  if (resultText.length < length) {
    const diff = length - resultText.length;
    const padding = ' '.repeat(diff);
    resultText += padding;
  } else if (resultText.length > length) {
    resultText = `${resultText.substring(0, MAX_POLL_RESULT_KEY_LENGTH - 3)}...`;
  }
  return resultText;
};

const getPollResultsText = (isDefaultPoll: boolean, answers: PollResultData['answers'], numRespondents: number, intl: Intl) => {
  let responded = 0;
  let resultString = '';
  let optionsString = '';

  const alphabetCharacters = generateAlphabetList();
  const possibleLabels = generatePossibleLabels(alphabetCharacters);

  // We need to guarantee that the labels are in the correct order, and that all options have label
  const pollAnswerMatchLabeledFormat = getUsedLabels(answers, possibleLabels);
  const isPollAnswerMatchFormat = !isDefaultPoll
    ? pollAnswerMatchLabeledFormat.reduce(
      (acc, label, index) => acc && !!label && label[0] === alphabetCharacters[index][0], true,
    )
    : false;

  let longestKeyLength = answers.reduce(
    (acc, item) => (item.key.length > acc ? item.key.length : acc), 0,
  );
  longestKeyLength = Math.min(longestKeyLength, MAX_POLL_RESULT_KEY_LENGTH);

  answers.map((item) => {
    responded += item.numVotes;
    return item;
  }).forEach((item, index) => {
    const numResponded = responded === numRespondents ? numRespondents : responded;
    const pct = Math.round((item.numVotes / (numResponded || 1)) * 100);
    const pctBars = POLL_BAR_CHAR.repeat((pct * MAX_POLL_RESULT_BARS) / 100);
    const pctFotmatted = `${Number.isNaN(pct) ? 0 : pct}%`;
    if (isDefaultPoll) {
      let translatedKey = pollAnswerIds[item.key.toLowerCase() as keyof typeof pollAnswerIds]
        ? intl.formatMessage(pollAnswerIds[item.key.toLowerCase() as keyof typeof pollAnswerIds])
        : item.key;
      translatedKey = truncate(translatedKey, longestKeyLength);
      resultString += `${translatedKey}: ${item.numVotes || 0} ${pctBars}${POLL_BAR_CHAR} ${pctFotmatted}\n`;
    } else {
      if (isPollAnswerMatchFormat) {
        resultString += `${pollAnswerMatchLabeledFormat[index]?.[0]}`;
        const formattedAnswerValue = getFormattedAnswerValue(item.key);
        optionsString += `${pollAnswerMatchLabeledFormat[index]?.[0]}: ${formattedAnswerValue}\n`;
      } else {
        let { key } = item;
        key = truncate(key, longestKeyLength);
        resultString += key;
      }
      resultString += `: ${item.numVotes || 0} ${pctBars}${POLL_BAR_CHAR} ${pctFotmatted}\n`;
    }
  });

  return { resultString, optionsString };
};

const getPollResultString = (pollResultData: PollResultData, intl: Intl) => {
  const formatBoldBlack = (s: string) => s.bold().fontcolor('black');

  const sanitize = (value: string) => escapeHtml(value);

  const { answers, numRespondents, questionType } = pollResultData;
  const isDefault = isDefaultPoll(questionType);
  let {
    resultString,
    optionsString,
  } = getPollResultsText(isDefault, answers, numRespondents, intl);
  resultString = sanitize(resultString);
  optionsString = sanitize(optionsString);

  let pollText = formatBoldBlack(resultString);
  if (optionsString !== '') {
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

export const validateInput = (input: string) => {
  let i = input;
  while (/^\s/.test(i)) i = i.substring(1);
  return i;
};

export const getSplittedQuestionAndOptions = (questionAndOptions: string[] | string) => {
  const inputList = Array.isArray(questionAndOptions)
    ? questionAndOptions
    : questionAndOptions.split('\n').filter((val: string) => val !== '');
  const splittedQuestion = inputList.length > 0 ? inputList[0] : questionAndOptions;
  const optList = inputList.slice(1);

  const optionsList = optList.map((val) => {
    const option = validateInput(val);
    // @ts-ignore
    return { key: pollTypesKeys[option] ?? option, val: option };
  });

  return {
    splittedQuestion,
    optionsList,
  };
};

export const removeEmptyLineSpaces = (input: string) => {
  const filteredInput = input.split('\n').filter((val) => val.trim() !== '');
  return filteredInput;
};

export const isDefaultPoll = (pollType: string) => pollType !== pollTypes.Response;

const matchYesNoPoll = (yesValue: string, noValue: string, contentString: string) => {
  const ynPollString = `(${yesValue}\\s*\\/\\s*${noValue})|(${noValue}\\s*\\/\\s*${yesValue})`;
  const ynOptionsRegex = new RegExp(ynPollString, 'gi');
  const ynPoll = contentString.replace(/\n/g, '').match(ynOptionsRegex) || [];
  return ynPoll;
};

const matchYesNoAbstentionPoll = (yesValue:string, noValue:string, abstentionValue:string, contentString:string) => {
  /* eslint max-len: [off] */
  const ynaPollString = `(${yesValue}\\s*\\/\\s*${noValue}\\s*\\/\\s*${abstentionValue})|(${yesValue}\\s*\\/\\s*${abstentionValue}\\s*\\/\\s*${noValue})|(${abstentionValue}\\s*\\/\\s*${yesValue}\\s*\\/\\s*${noValue})|(${abstentionValue}\\s*\\/\\s*${noValue}\\s*\\/\\s*${yesValue})|(${noValue}\\s*\\/\\s*${yesValue}\\s*\\/\\s*${abstentionValue})|(${noValue}\\s*\\/\\s*${abstentionValue}\\s*\\/\\s*${yesValue})`;
  const ynaOptionsRegex = new RegExp(ynaPollString, 'gi');
  const ynaPoll = contentString.replace(/\n/g, '').match(ynaOptionsRegex) || [];
  return ynaPoll;
};

const matchTrueFalsePoll = (trueValue:string, falseValue:string, contentString:string) => {
  const tfPollString = `(${trueValue}\\s*\\/\\s*${falseValue})|(${falseValue}\\s*\\/\\s*${trueValue})`;
  const tgOptionsRegex = new RegExp(tfPollString, 'gi');
  const tfPoll = contentString.match(tgOptionsRegex) || [];
  return tfPoll;
};

export const checkPollType = (
  type: string | null,
  optList: { val: string }[],
  yesValue: string,
  noValue: string,
  abstentionValue: string,
  trueValue: string,
  falseValue: string,
) => {
  /* eslint no-underscore-dangle: "off" */
  let _type = type;
  let pollString = '';
  let defaultMatch: RegExpMatchArray | [] | null = null;
  let isDefault = null;

  switch (_type) {
    case pollTypes.Letter:
      pollString = optList.map((x) => x.val.toUpperCase()).sort().join('');
      defaultMatch = pollString.match(/^(ABCDEF)|(ABCDE)|(ABCD)|(ABC)|(AB)$/gi);
      isDefault = defaultMatch && pollString.length === defaultMatch[0].length;
      _type = isDefault && Array.isArray(defaultMatch) ? `${_type}${defaultMatch[0].length}` : pollTypes.Custom;
      break;
    case pollTypes.TrueFalse:
      pollString = optList.map((x) => x.val).join('/');
      defaultMatch = matchTrueFalsePoll(trueValue, falseValue, pollString);
      isDefault = defaultMatch.length > 0 && pollString.length === (defaultMatch[0]?.length);
      if (!isDefault) _type = pollTypes.Custom;
      break;
    case pollTypes.YesNoAbstention:
      pollString = optList.map((x) => x.val).join('/');
      defaultMatch = matchYesNoAbstentionPoll(yesValue, noValue, abstentionValue, pollString);
      isDefault = Array.isArray(defaultMatch) && defaultMatch.length > 0 && pollString.length === defaultMatch[0]?.length;
      if (!isDefault) {
        // also try to match only yes/no
        defaultMatch = matchYesNoPoll(yesValue, noValue, pollString);
        isDefault = defaultMatch.length > 0 && pollString.length === defaultMatch[0]?.length;
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
  validateInput,
  getSplittedQuestionAndOptions,
  removeEmptyLineSpaces,
  isDefaultPoll,
  pollAnswerIds,
  POLL_AVATAR_COLOR,
  getPollResultString,
  matchYesNoPoll,
  matchYesNoAbstentionPoll,
  matchTrueFalsePoll,
  checkPollType,
  POLL_BAR_CHAR,
};
