import Shapes from '/imports/api/shapes';

const getCurrentShapes = (whiteboardId) => {

  if (!whiteboardId) {
    return null;
  }

  return Shapes.find({
    whiteboardId: whiteboardId,
  }).fetch();
};

export default {
  getCurrentShapes,
};
