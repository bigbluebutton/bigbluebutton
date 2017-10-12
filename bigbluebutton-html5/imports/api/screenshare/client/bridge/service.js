import Meetings from '/imports/api/meetings';

// TODO - we currently add "-SCREENSHARE" in the verto_extension.js library
// Therefore we only pass the voiceConf here, not the full screenshareConf
const getConferenceBridge = () => Meetings.findOne().voiceProp.voiceConf;

export default {
  getConferenceBridge,
};
