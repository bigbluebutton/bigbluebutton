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

export default {
  currentUser: () => Users.findOne({ userId: Auth.userID }),
  pollTypes,
  stopPoll: () => makeCall('stopPoll', Auth.userId),
  publishPoll: () => makeCall('publishPoll'),
  currentPoll: () => Polls.findOne({ meetingId: Auth.meetingID }),
  getUser: userId => Users.findOne({ userId }),
};
