import { Meteor } from 'meteor/meteor';

import Meetings from '/imports/api/meetings';
import Users from '/imports/api/users';
import addSystemMsg from '/imports/api/group-chat-msg/server/modifiers/addSystemMsg';

const ROLE_VIEWER = Meteor.settings.public.user.role_viewer;

const CHAT_CONFIG = Meteor.settings.public.chat;
const PUBLIC_GROUP_CHAT_ID = CHAT_CONFIG.public_group_id;
const CHAT_USER_STATUS_MESSAGE = CHAT_CONFIG.system_messages_keys.chat_status_message;
const SYSTEM_CHAT_TYPE = CHAT_CONFIG.type_system;

export default function sendStatusChatMsg(meetingId, userId, emoji) {
  const user = Users.findOne(
    { meetingId, userId },
    {
      fields: {
        name: 1,
        role: 1,
        locked: 1,
        emoji: 1,
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

  // Send message if previous emoji or actual emoji is 'away'
  let status;
  if (user.emoji === 'away') {
    status = 'notAway';
  } else if (emoji === 'away') {
    status = 'away';
  } else {
    return null;
  }

  const extra = {
    type: 'status',
    status,
  };

  const payload = {
    id: `${SYSTEM_CHAT_TYPE}-${CHAT_USER_STATUS_MESSAGE}`,
    timestamp: Date.now(),
    correlationId: `${userId}-${Date.now()}`,
    sender: {
      id: userId,
      name: user.name,
    },
    message: '',
    extra,
  };

  return addSystemMsg(meetingId, PUBLIC_GROUP_CHAT_ID, payload);
}
