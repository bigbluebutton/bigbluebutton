import Annotations from '/imports/api/2.0/annotations';

const getCurrentAnnotations = (whiteboardId) => {
  if (!whiteboardId) {
    return null;
  }

  return Annotations.find({
    whiteboardId,
  }).fetch();
};

export default {
  getCurrentAnnotations,
};
