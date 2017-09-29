import Cursor from '/imports/api/2.0/cursor';
import Users from '/imports/api/2.0/users';

const getCurrentCursor = (cursorId) => {
  const cursor = Cursor.findOne({ _id: cursorId });
  if (cursor) {
    const { userId } = cursor;
    const user = Users.findOne({ userId });
    if (user) {
      cursor.userName = user.name;
      return cursor;
    }
  }
  return false;
};

export default {
  getCurrentCursor,
};
