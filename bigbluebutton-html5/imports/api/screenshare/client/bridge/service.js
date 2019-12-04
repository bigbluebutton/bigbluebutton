import Meetings from '/imports/api/meetings';

const getConferenceBridge = () => Meetings.findOne().voiceProp.voiceConf;

export default {
  getConferenceBridge,
};
