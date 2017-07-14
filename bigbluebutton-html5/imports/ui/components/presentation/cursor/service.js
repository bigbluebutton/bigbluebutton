import Cursor from '/imports/api/2.0/cursor';

const getCurrentCursor = () => Cursor.findOne({});

export default {
  getCurrentCursor,
};
