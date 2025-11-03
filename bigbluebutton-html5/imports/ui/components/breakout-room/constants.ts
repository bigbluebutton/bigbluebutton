import { PANELS } from '/imports/ui/components/layout/enums';

export const BREAKOUTS_APP_KEY = PANELS.BREAKOUT;
export const BREAKOUTS_ICON = 'rooms';
export const BREAKOUTS_NOTIFICATION_EVENT = `${BREAKOUTS_APP_KEY}_NOTIFICATION_EVENT`;
export const BREAKOUTS_LABEL = {
  id: 'app.createBreakoutRoom.title',
  description: 'breakout title',
};
export const BREAKOUTS_UNASSIGNED_LABEL = {
  id: 'app.breakoutRoom.inProgressLabel',
  description: 'user is not assigned to a room and breakouts are enabled',
};

export default {
  BREAKOUTS_APP_KEY,
  BREAKOUTS_ICON,
  BREAKOUTS_LABEL,
  BREAKOUTS_UNASSIGNED_LABEL,
};
