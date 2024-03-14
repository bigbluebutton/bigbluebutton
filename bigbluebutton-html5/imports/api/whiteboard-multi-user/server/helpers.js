import Users from '/imports/api/users';
import WhiteboardMultiUser from '/imports/api/whiteboard-multi-user/';

const getMultiUser = async (meetingId, whiteboardId) => {
  const data = await WhiteboardMultiUser.findOneAsync(
    {
      meetingId,
      whiteboardId,
    }, { fields: { multiUser: 1 } },
  );

  if (!data || !data.multiUser || !Array.isArray(data.multiUser)) return [];

  return data.multiUser;
};

const getUsers = async (meetingId) => {
  const data = await Users.find(
    { meetingId },
    { fields: { userId: 1 } },
  ).fetchAsync();

  if (!data) return [];

  return data.map(user => user.userId);
};

export {
  getMultiUser,
  getUsers,
};
