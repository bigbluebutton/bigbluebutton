import Shapes from '/imports/api/2.0/shapes';

const getCurrentShapes = (whiteboardId) => {
  if (!whiteboardId) {
    return null;
  }

  return Shapes.find({
    whiteboardId,
  }).fetch();
};

export default {
  getCurrentShapes,
};
