import Cursor from '/imports/ui/components/cursor/service';
import Users from '/imports/api/users';

const getCurrentCursor = (cursorId) => {
  const cursor = Cursor.findOne({ _id: cursorId });
  if (cursor) {
    const { userId } = cursor;
    const user = Users.findOne({ userId }, { fields: { name: 1, presenter: 1, userId: 1, role: 1 } });
    if (user) {
      cursor.userName = user.name;
      cursor.userId = user.userId;
      cursor.role = user.role;
      cursor.presenter = user.presenter;
      return cursor;
    }
  }
  return false;
};

export default {
  getCurrentCursor,
};
