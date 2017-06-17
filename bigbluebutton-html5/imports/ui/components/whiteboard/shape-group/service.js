import Shapes from '/imports/api/shapes';

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
