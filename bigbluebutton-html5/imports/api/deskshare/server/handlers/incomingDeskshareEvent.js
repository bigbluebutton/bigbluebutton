import Deskshare from '/imports/api/deskshare';
import Meetings from '/imports/api/meetings';
import modifyDeskshareStatus from '../modifiers/modifyDeskshareStatus';

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
  modifyDeskshareStatus(meetingId, deskShareInfo);
}
