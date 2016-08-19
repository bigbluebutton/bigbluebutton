import Deskshare from '/imports/api/deskshare';
import { logger } from '/imports/startup/server/logger';
import { inReplyToHTML5Client } from '/imports/api/common/server/helpers';
import { eventEmitter } from '/imports/startup/server';
import Meetings from '/imports/api/meetings';
import Users from '/imports/api/users';

export function handleIncomingDeskshareMessage(arg) {
  console.log("Inside handleIncomingDeskshareMessage");
  console.log(JSON.stringify(arg));
  //console.log(`payload.voice_bridge: ${arg.payload.voice_bridge}`);
  const payload = arg.payload;
  const meetingId = payload.meeting_id;
  const voiceBridge = Meetings.findOne({ meetingId: payload.meeting_id }).voiceConf;
  console.log(`payload.meeting_id: ${payload.meeting_id}`);

  const deskShareInfo = {
    vw: payload.vw,
    vh: payload.vh,
    voiceBridge: voiceBridge, // payload.voice_bridge
    broadcasting: payload.broadcasting,
  };
  handleDeskShareChange(meetingId, deskShareInfo);
}

export function handleDeskShareChange(meetingId, deskshareInfo) {
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

eventEmitter.on('desk_share_notify_viewers_rtmp', function (arg) {
  console.log("Inside desk_share_notify_viewers_rtmp");
  handleIncomingDeskshareMessage(arg);
  return arg.callback();
});

eventEmitter.on('desk_share_notify_a_single_viewer', function (arg) {
  console.log("inside desk_share_notify_a_single_viewer");
  if (inReplyToHTML5Client(arg)) {
    console.log("inReplyToHTML5Client");
    handleIncomingDeskshareMessage(arg);
  }
  return arg.callback();
});

