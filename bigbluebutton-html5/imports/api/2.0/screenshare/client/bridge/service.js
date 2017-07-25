import Meetings from '/imports/api/2.0/meetings';

const getConferenceBridge = () => {
  // TODO - we currently add "-SCREENSHARE" in the verto_extension.js library
  // Therefore we only pass the voiceConf here, not the full screenshareConf
  return Meetings.findOne().voiceProp.voiceConf;
};

export default {
  getConferenceBridge,
};
