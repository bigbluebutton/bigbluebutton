import Shapes from '/imports/api/1.1/shapes';

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
