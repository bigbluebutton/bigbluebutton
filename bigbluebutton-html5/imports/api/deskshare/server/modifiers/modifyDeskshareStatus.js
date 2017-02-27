import Deskshare from '/imports/api/deskshare';
import Meetings from '/imports/api/meetings';
import Logger from '/imports/startup/server/logger';
import Users from '/imports/api/users';
import { Meteor } from 'meteor/meteor';
import { Match } from 'meteor/check';

export default function modifyDeskshareStatus(meetingId, deskshareInfo) {
  const presenter = Users.findOne({ meetingId: meetingId, 'user.presenter':  true });
  let startedById = null;

  if (Match.test(presenter, Object) && Match.test(presenter.user.userid, String)) {
    startedById = presenter.user.userid;
  } else {
    throw new Meteor.Error('not-allowed', `Deskshare presenter does not exist in this meeting`);
  }

  Deskshare.upsert({ meetingId: meetingId }, { $set: {
    broadcasting: deskshareInfo.broadcasting,
    timestamp: 'now',
    vw: deskshareInfo.vw,
    vh: deskshareInfo.vh,
    voiceBridge: deskshareInfo.voiceBridge,
    startedBy: startedById,
  }, });
}

