import { makeCall } from '/imports/ui/services/api';

export const moveUser = (
  userId: string,
  fromBreakoutId: string | undefined,
  toBreakoutId: string | undefined,
) => makeCall('moveUser', fromBreakoutId, toBreakoutId, userId);

export default {
  moveUser,
};
