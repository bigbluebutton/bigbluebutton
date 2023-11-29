import { Meteor } from 'meteor/meteor';

import Meetings from '/imports/api/meetings';
import Users from '/imports/api/users';

const ROLE_VIEWER = Meteor.settings.public.user.role_viewer;

export default function sendAwayStatusChatMsg(meetingId, userId) {
  const user = Users.findOne(
    { meetingId, userId },
    {
      fields: {
        name: 1,
        role: 1,
        locked: 1,
        away: 1,
      },
    },
  );

  if (!user) return null;

  // Check for viewer permissions
  if (user.role === ROLE_VIEWER && user.locked) {
    const meeting = Meetings.findOne(
      { meetingId },
      { fields: { 'lockSettingsProps.disablePublicChat': 1 } },
    );

    if (!meeting) return null;

    // Return if viewer has his public chat disabled
    const { lockSettingsProps } = meeting;
    if (lockSettingsProps && lockSettingsProps.disablePublicChat) {
      return null;
    }
  }
}
