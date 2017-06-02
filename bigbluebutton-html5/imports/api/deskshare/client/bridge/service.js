import Meetings from '/imports/api/meetings';

const getConferenceBridge = () => {
  const Meeting = Meetings.findOne();
  return Meeting.voiceConf;
};

export {
  getConferenceBridge,
};
