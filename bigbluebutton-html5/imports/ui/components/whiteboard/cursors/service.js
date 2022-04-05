import Cursor from '/imports/ui/components/cursor/service';
import Users from '/imports/api/users';
import Presentations from '/imports/api/presentations';

const getCurrentCursor = (cursorId) => {
  const cursor = Cursor.findOne({ _id: cursorId });
  if (cursor) {
    const { userId } = cursor;
    const user = Users.findOne({ userId }, { fields: { name: 1 } });
    if (user) {
      cursor.userName = user.name;
      return cursor;
    }
  }
  return false;
};

const getCursorCur = () => {
    // console.log('GET cursors : ', Presentations.find().fetch().filter(s => s.x && s.y))
    return Presentations.find().fetch().filter(s => s.x && s.y);
};

export default {
  getCurrentCursor,
  getCursorCur,
};