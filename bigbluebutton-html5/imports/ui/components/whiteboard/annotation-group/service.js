import Annotations from '/imports/api/2.0/annotations';

const getCurrentAnnotationsInfo = (whiteboardId) => {
  if (!whiteboardId) {
    return null;
  }

  return Annotations.find(
    {
      whiteboardId,
      annotationType: { $ne: 'pencil_base' },
    },
    {
      sort: { position: 1 },
      fields: { status: 1, _id: 1, annotationType: 1 },
    },
  ).fetch();
};

export default {
  getCurrentAnnotationsInfo,
};
