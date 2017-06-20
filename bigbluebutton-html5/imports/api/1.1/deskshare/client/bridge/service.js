import Meetings from '/imports/api/1.1/meetings';

const getConferenceBridge = () => {
  const Meeting = Meetings.findOne();
  return Meeting.voiceConf;
};

export {
  getConferenceBridge,
};
