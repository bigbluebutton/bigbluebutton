import Deskshare from '/imports/api/deskshare';
import Meetings from '/imports/api/meetings';
import Logger from '/imports/startup/server/logger';
import Users from '/imports/api/users';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

export default function modifyDeskshareStatus(meetingId, deskshareInfo) {
  check(meetingId, String);
  const presenter = Users.findOne({ meetingId, 'user.presenter':  true });
  check(presenter, Object);
  check(presenter.user.userid, String);
  const startedById = presenter.user.userid;

  Deskshare.upsert({ meetingId: meetingId }, { $set: {
    broadcasting: deskshareInfo.broadcasting,
    timestamp: 'now',
    vw: deskshareInfo.vw,
    vh: deskshareInfo.vh,
    voiceBridge: deskshareInfo.voiceBridge,
    startedBy: startedById,
  }, });
}

