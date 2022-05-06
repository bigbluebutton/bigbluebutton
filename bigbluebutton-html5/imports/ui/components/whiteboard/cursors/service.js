import Cursor from '/imports/ui/components/cursor/service';
import Users from '/imports/api/users';
import { publishCursorUpdate } from '/imports/ui/components/cursor/service';

const getCurrentCursors = (whiteboardId) => {
  const selector = { whiteboardId };
  const filter = {};
  const cursors = Cursor.find(selector, filter).fetch();
  //console.log('CURSORS!!!!!!!!! : ',cursors);
  return cursors.map(cursor => {
    const { userId } = cursor;
    const user = Users.findOne({ userId }, { fields: { name: 1, presenter: 1, userId: 1, role: 1 } });
    if (user) {
      cursor.userName = user.name;
      cursor.userId = user.userId;
      cursor.role = user.role;
      cursor.presenter = user.presenter;
      return cursor;
    }
  });
};

export default {
  getCurrentCursors,
  publishCursorUpdate,
};
