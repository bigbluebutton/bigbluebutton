import Deskshare from '/imports/api/deskshare/collection';
import { logger } from '/imports/startup/server/logger';

export function handleDeskShareChange(meetingId, deskshareInfo) {
  logger.info(`__${meetingId}__deskshareInfo= + ${JSON.stringify(deskshareInfo)}`);
  const presenter = Users.findOne({ meetingId: meetingId, 'user.presenter':  true }).user.userid;
  Deskshare.upsert({ meetingId: meetingId }, { $set: {
    broadcasting: deskshareInfo.broadcasting,
    timestamp: 'now',
    vw: deskshareInfo.vw,
    vh: deskshareInfo.vh,
    voice_bridge: deskshareInfo.voice_bridge,
    startedBy: presenter,
  }, });
}

// emitter.on('desk_share_notify_viewers_rtmp', function (arg) {
//   handleIncomingDeskshareMessage(arg);
//   return arg.callback();
// });
//
// emitter.on('desk_share_notify_a_single_viewer', function (arg) {
//   if (arg.payload.requester_id === 'nodeJSapp') {
//     handleIncomingDeskshareMessage(arg);
//   }
//   return arg.callback();
// });
  