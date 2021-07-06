import addSystemMsg from '../../../group-chat-msg/server/modifiers/addSystemMsg';
import Polls from '/imports/api/polls';
import removePoll from '../modifiers/removePoll';
import Logger from '/imports/startup/server/logger';

export default function sendPollChatMsg({ body }, meetingId) {
  const { poll } = body;

  const CHAT_CONFIG = Meteor.settings.public.chat;
  const PUBLIC_GROUP_CHAT_ID = CHAT_CONFIG.public_group_id;
  const PUBLIC_CHAT_SYSTEM_ID = CHAT_CONFIG.system_userid;
  const CHAT_POLL_RESULTS_MESSAGE = CHAT_CONFIG.system_messages_keys.chat_poll_result;
  const SYSTEM_CHAT_TYPE = CHAT_CONFIG.type_system;

  const pollData = Polls.findOne({ meetingId });

  if (!pollData) {
    Logger.error(`Attempted to send chat message of inexisting poll for meetingId: ${meetingId}`);
    return false;
  }

  const pollResultData = poll;
  pollResultData.pollType = pollData.pollType;
  const extra = {
    type: 'poll',
    pollResultData,
  };

  const payload = {
    id: `${SYSTEM_CHAT_TYPE}-${CHAT_POLL_RESULTS_MESSAGE}`,
    timestamp: Date.now(),
    correlationId: `${PUBLIC_CHAT_SYSTEM_ID}-${Date.now()}`,
    sender: {
      id: PUBLIC_CHAT_SYSTEM_ID,
      name: '',
    },
    message: '',
    extra,
  };

  removePoll(meetingId, pollData.id);
  return addSystemMsg(meetingId, PUBLIC_GROUP_CHAT_ID, payload);
}
