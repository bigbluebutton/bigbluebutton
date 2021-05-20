import Users from '/imports/api/users';
import Auth from '/imports/ui/services/auth';
import Polls from '/imports/api/polls';
import caseInsensitiveReducer from '/imports/utils/caseInsensitiveReducer';

const POLL_AVATAR_COLOR = '#3B48A9';
const MAX_POLL_RESULT_BARS = 20;

// 'YN' = Yes,No
// 'YNA' = Yes,No,Abstention
// 'TF' = True,False
// 'A-2' = A,B
// 'A-3' = A,B,C
// 'A-4' = A,B,C,D
// 'A-5' = A,B,C,D,E
const pollTypes = ['YN', 'YNA', 'TF', 'A-2', 'A-3', 'A-4', 'A-5', 'custom'];

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

const getPollResultString = (isDefaultPoll, answers, numRespondents) => {
  let responded = 0;
  let resultString = '';
  let optionsString = '';

  answers.map((item) => {
    responded += item.numVotes;
    return item;
  }).reduce(caseInsensitiveReducer, []).map((item) => {
    const numResponded = responded === numRespondents ? numRespondents : responded;
    const pct = Math.round(item.numVotes / numResponded * 100);
    const pctBars = "|".repeat(pct * MAX_POLL_RESULT_BARS / 100);
    const pctFotmatted = `${Number.isNaN(pct) ? 0 : pct}%`;
    if (isDefaultPoll) {
      resultString += `${item.key}: ${item.numVotes || 0} |${pctBars} ${pctFotmatted}\n`;
    } else {
      resultString += `${item.id+1}: ${item.numVotes || 0} |${pctBars} ${pctFotmatted}\n`;
      optionsString += `${item.id+1}: ${item.key}\n`;
    }
  });

  return { resultString, optionsString };
}

export default {
  amIPresenter: () => Users.findOne(
    { userId: Auth.userID },
    { fields: { presenter: 1 } },
  ).presenter,
  pollTypes,
  currentPoll: () => Polls.findOne({ meetingId: Auth.meetingID }),
  pollAnswerIds,
  POLL_AVATAR_COLOR,
  isDefaultPoll: (pollType) => { return pollType !== 'custom' && pollType !== 'R-'},
  getPollResultString: getPollResultString,
};
