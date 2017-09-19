import Deskshare from '/imports/api/1.1/deskshare';
import Meetings from '/imports/api/1.1/meetings';
import Logger from '/imports/startup/server/logger';
import Users from '/imports/api/1.1/users';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

export default function modifyDeskshareStatus(meetingId, deskshareInfo) {
  check(meetingId, String);
  const presenter = Users.findOne({ meetingId, 'user.presenter': true });
  check(presenter, Object);
  check(presenter.user.userid, String);
  const startedById = presenter.user.userid;

  Deskshare.upsert({ meetingId }, { $set: {
    broadcasting: deskshareInfo.broadcasting,
    timestamp: 'now',
    vw: deskshareInfo.vw,
    vh: deskshareInfo.vh,
    voiceBridge: deskshareInfo.voiceBridge,
    startedBy: startedById,
  } });
}

