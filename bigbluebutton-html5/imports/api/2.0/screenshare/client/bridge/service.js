import Screenshare from '/imports/api/2.0/screenshare';

const getConferenceBridge = () => Screenshare.findOne().broadcast.screenshareConf;

export default {
  getConferenceBridge,
};
