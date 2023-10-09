import Presentations from '/imports/api/presentations';

const getCurrentPresentation = (podId) => Presentations.findOne({
  podId,
  current: true,
});

export default {
  getCurrentPresentation,
};
