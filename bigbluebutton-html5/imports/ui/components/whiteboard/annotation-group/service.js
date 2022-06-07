import { Annotations, UnsentAnnotations } from '/imports/ui/components/whiteboard/service';

const getCurrentAnnotationsInfo = (whiteboardId) => {
  if (!whiteboardId) {
    return null;
  }

  return Annotations.find(
    {
      whiteboardId,
    },
    {
      sort: { position: 1 },
      fields: { status: 1, _id: 1, annotationType: 1 },
    },
  ).fetch();
};

const getUnsetAnnotations = (whiteboardId) => {
  if (!whiteboardId) {
    return null;
  }

  return UnsentAnnotations.find(
    {
      whiteboardId,
    },
    {
      sort: { position: 1 },
      fields: { status: 1, _id: 1, annotationType: 1 },
    },
  ).fetch();
};

export default {
  getCurrentAnnotationsInfo,
  getUnsetAnnotations,
};
