import Meetings from '/imports/api/meetings';

export function handleIncomingDeskshareMessage(arg) {
  const payload = arg.payload;
  const voiceBridge = Meetings.findOne({ meetingId: payload.meetingId }).voiceConf;
  const thisMeetingId = payload.meetingId;
  const deskShareInfo = {
    vw: payload.vw,
    vh: payload.vh,
    voiceBridge: voiceBridge, // payload.voice_bridge
    broadcasting: payload.broadcasting,
  };
  handleDeskShareChange(thisMeetingId, deskShareInfo);
}
