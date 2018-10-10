import Presentations from '/imports/api/presentations';
import PresentationUploadToken from '/imports/api/presentation-upload-token';
import Auth from '/imports/ui/services/auth';
import { makeCall } from '/imports/ui/services/api';
import _ from 'lodash';
import Polls from '/imports/api/polls';

import Users from '/imports/api/users';

import Meetings from '/imports/api/meetings';


//const currentUser = Users.findOne({ userId: Auth.userID });
//const currentPoll = Polls.findOne({ meetingId: currentUser.meetingId });





    let p = Polls.findOne({  });


export default {
  u: () => Users.findOne({ userId: Auth.userID }),
  p: () => Polls.findOne({ }),
};
