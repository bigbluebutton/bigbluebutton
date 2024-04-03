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
    return { val: option };
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
};
