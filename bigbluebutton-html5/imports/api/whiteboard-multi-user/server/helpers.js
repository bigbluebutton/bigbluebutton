import Users from '/imports/api/users';
import WhiteboardMultiUser from '/imports/api/whiteboard-multi-user/';

const getMultiUser = (meetingId, whiteboardId) => {
  const data = WhiteboardMultiUser.findOne(
    {
      meetingId,
      whiteboardId,
    }, { fields: { multiUser: 1 } },
  );

  if (!data || !data.multiUser || !Array.isArray(data.multiUser)) return [];

  return data.multiUser;
};

const getUsers = (meetingId) => {
  const data = Users.find(
    { meetingId },
    { fields: { userId: 1 } },
  ).fetch();

  if (!data) return [];

  return data.map(user => user.userId);
};

export {
  getMultiUser,
  getUsers,
};
