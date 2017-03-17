import Deskshare from '/imports/api/deskshare';
import Meetings from '/imports/api/meetings';
import modifyDeskshareStatus from '../modifiers/modifyDeskshareStatus';

export default function incomingDeskshareEvent(arg) {
  const payload = arg.payload;
  const meetingId = payload.meeting_id;
  const voiceBridge = Meetings.findOne({ meetingId: payload.meeting_id }).voiceConf;

  const deskShareInfo = {
    vw: payload.vw,
    vh: payload.vh,
    voiceBridge: voiceBridge, // payload.voice_bridge
    broadcasting: payload.broadcasting,
  };
  modifyDeskshareStatus(meetingId, deskShareInfo);
}
