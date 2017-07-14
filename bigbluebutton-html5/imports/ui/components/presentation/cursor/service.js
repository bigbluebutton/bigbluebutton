import Cursor from '/imports/api/cursor';

const getCurrentCursor = () => Cursor.findOne({});

export default {
  getCurrentCursor,
};
