import Meetings from '/imports/api/meetings';

export function handleIncomingDeskshareMessage(arg) {
  const payload = arg.payload;
  const voiceBridge = Meetings.findOne({ meetingId: payload.meetingId }).voiceConf;
  const thisMeetingId = payload.meetingId;
  const deskShareInfo = {
    vw: payload.vw,
    vh: payload.vh,
    voice_bridge: voiceBridge, // payload.voice_bridge
    broadcasting: payload.broadcasting,
  };
  handleDeskShareChange(thisMeetingId, deskShareInfo);
}
