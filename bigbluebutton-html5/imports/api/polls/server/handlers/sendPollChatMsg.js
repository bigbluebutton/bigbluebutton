import addSystemMsg from '../../../group-chat-msg/server/modifiers/addSystemMsg';
import caseInsensitiveReducer from '/imports/utils/caseInsensitiveReducer';

export default function sendPollChatMsg({ body }, meetingId) {
  const { poll } = body;

  const CHAT_CONFIG = Meteor.settings.public.chat;
  const PUBLIC_GROUP_CHAT_ID = CHAT_CONFIG.public_group_id;
  const PUBLIC_CHAT_SYSTEM_ID = CHAT_CONFIG.system_userid;
  const CHAT_POLL_RESULTS_MESSAGE = CHAT_CONFIG.system_messages_keys.chat_poll_result;
  const SYSTEM_CHAT_TYPE = CHAT_CONFIG.type_system;

  const pollResultData = poll;
  const answers = pollResultData.answers.reduce(caseInsensitiveReducer, []);

  const extra = {
    type: 'poll',
    pollResultData: {
      ...pollResultData,
      answers,
    },
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

  return addSystemMsg(meetingId, PUBLIC_GROUP_CHAT_ID, payload);
}
