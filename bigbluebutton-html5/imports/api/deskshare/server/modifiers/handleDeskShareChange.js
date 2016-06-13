import Deskshare from '/imports/api/deskshare';
import { logger } from '/imports/startup/server/logger';
import { inReplyToHTML5Client } from '/imports/api/common/server/helpers';

export function handleDeskShareChange(meetingId, deskshareInfo) {
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
