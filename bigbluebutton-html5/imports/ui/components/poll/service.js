import { makeCall } from '/imports/ui/services/api';
import Users from '/imports/api/users';
import Auth from '/imports/ui/services/auth';
import Polls from '/imports/api/polls';

// 'YN' = Yes,No
// 'TF' = True,False
// 'A-2' = A,B
// 'A-3' = A,B,C
// 'A-4' = A,B,C,D
// 'A-5' = A,B,C,D,E
const pollTypes = ['YN', 'TF', 'A-2', 'A-3', 'A-4', 'A-5', 'custom'];

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

export default {
  amIPresenter: () => Users.findOne({ userId: Auth.userID }, { fields: { presenter: 1 } }).presenter,
  pollTypes,
  stopPoll: () => makeCall('stopPoll', Auth.userId),
  currentPoll: () => Polls.findOne({ meetingId: Auth.meetingID }),
  pollAnswerIds,
};
