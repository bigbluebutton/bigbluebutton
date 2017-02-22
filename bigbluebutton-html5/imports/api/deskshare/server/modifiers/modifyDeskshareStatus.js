import Deskshare from '/imports/api/deskshare';
import Meetings from '/imports/api/meetings';
import Logger from '/imports/startup/server/logger';
import Users from '/imports/api/users';

export function modifyDeskshareStatus(meetingId, deskshareInfo) {
  console.log("Inside handleDeskShareChange");
  logger.info(`__${meetingId}__deskshareInfo= + ${JSON.stringify(deskshareInfo)}`);
  const presenter = Users.findOne({ meetingId: meetingId, 'user.presenter':  true }).user.userid;
  Deskshare.upsert({ meetingId: meetingId }, { $set: {
    broadcasting: deskshareInfo.broadcasting,
    timestamp: 'now',
    vw: deskshareInfo.vw,
    vh: deskshareInfo.vh,
    voiceBridge: deskshareInfo.voiceBridge,
    startedBy: presenter,
  }, });
}
