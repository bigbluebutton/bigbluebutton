import { GroupChatMsg } from '/imports/api/group-chat-msg';
import Logger from '/imports/startup/server/logger';
import addGroupChatMsg from '/imports/api/group-chat-msg/server/modifiers/addGroupChatMsg';

export default function clearGroupChatMsg(meetingId, chatId) {
  const CHAT_CONFIG = Meteor.settings.public.chat;
  const PUBLIC_CHAT_SYSTEM_ID = CHAT_CONFIG.system_userid;
  const PUBLIC_GROUP_CHAT_ID = CHAT_CONFIG.public_group_id;
  const CHAT_CLEAR_MESSAGE = CHAT_CONFIG.system_messages_keys.chat_clear;

  if (chatId) {
    try {
      const numberAffected = GroupChatMsg.remove({ meetingId, chatId });

      if (numberAffected) {
        Logger.info(`Cleared GroupChatMsg (${meetingId}, ${chatId})`);
        const clearMsg = {
          color: '0',
          timestamp: Date.now(),
          correlationId: `${PUBLIC_CHAT_SYSTEM_ID}-${Date.now()}`,
          sender: {
            id: PUBLIC_CHAT_SYSTEM_ID,
            name: '',
          },
          message: CHAT_CLEAR_MESSAGE,
        };
        addGroupChatMsg(meetingId, PUBLIC_GROUP_CHAT_ID, clearMsg);
      }
    } catch (err) {
      Logger.error(`Error on clearing GroupChat (${meetingId}, ${chatId}). ${err}`);
    }
    return true;
  }

  if (meetingId) {
    try {
      const numberAffected = GroupChatMsg.remove({ meetingId });

      if (numberAffected) {
        Logger.info(`Cleared GroupChatMsg (${meetingId})`);
      }
    } catch (err) {
      Logger.error(`Error on clearing GroupChatMsg (${meetingId}). ${err}`);
    }
  } else {
    try {
      const numberAffected = GroupChatMsg.remove({ chatId: { $eq: PUBLIC_GROUP_CHAT_ID } });

      if (numberAffected) {
        Logger.info('Cleared GroupChatMsg (all)');
      }
    } catch (err) {
      Logger.error(`Error on clearing GroupChatMsg (all). ${err}`);
    }
  }
}
