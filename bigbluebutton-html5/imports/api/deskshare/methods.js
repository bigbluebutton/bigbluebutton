import { Deskshare } from '/imports/api/deskshare/deskshare';

export function handleDeskShareChange(meetingId, deskshareInfo) {
  console.error(`__${meetingId}__deskshareInfo= + ${JSON.stringify(deskshareInfo)}`);
  const presenter = Meteor.Users.findOne({ meetingId: meetingId, 'user.presenter':  true }).user.userid;
  Deskshare.upsert({ meetingId: meetingId }, { $set: {
    broadcasting: deskshareInfo.broadcasting,
    timestamp: 'now',
    vw: deskshareInfo.vw,
    vh: deskshareInfo.vh,
    voice_bridge: deskshareInfo.voice_bridge,
    startedBy: presenter,
  }, });
}

export function clearDeskshareCollection(meetingId) {
  if (meetingId != null) {
    Deskshare.remove({ meetingId: meetingId }, function () {
      Meteor.log.info(`cleared Deskshare Collection (meetingId: ${this.meetingId}!)`);
    });
  } else {
    Deskshare.remove({}, function () {
      Meteor.log.info(`cleared Deskshare Collection (all meetings)!`);
    });
  }
}

function handleIncomingDeskshareMessage(arg) {
  const payload = arg.payload;
  const voiceBridge = Meteor.Meetings.findOne({meetingId: payload.meetingId}).voiceConf;
  const thisMeetingId = payload.meetingId
  const deskShareInfo = {
    vw: payload.vw,
    vh: payload.vh,
    voice_bridge: vb, // payload.voice_bridge
    broadcasting: payload.broadcasting,
  };
  handleDeskShareChange(thisMeetingId, deskShareInfo);
}

emitter.on('desk_share_notify_viewers_rtmp', function (arg) {
  handleIncomingDeskshareMessage(arg);
  return arg.callback();
});

emitter.on('desk_share_notify_a_single_viewer', function (arg) {
  if (arg.payload.requester_id === 'nodeJSapp') {
    handleIncomingDeskshareMessage(arg);
  }
  return arg.callback();
});
