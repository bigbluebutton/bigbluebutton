import addSystemMsg from '../../../group-chat-msg/server/modifiers/addSystemMsg';

export default function sendQuestionQuizChatMsg({ body }, meetingId) {
  const { questionQuiz } = body;

  const CHAT_CONFIG = Meteor.settings.public.chat;
  const PUBLIC_GROUP_CHAT_ID = CHAT_CONFIG.public_group_id;
  const PUBLIC_CHAT_SYSTEM_ID = CHAT_CONFIG.system_userid;
  const CHAT_QUESTION_QUIZ_RESULTS_MESSAGE = CHAT_CONFIG.
  system_messages_keys.chat_quiz_result;
  const SYSTEM_CHAT_TYPE = CHAT_CONFIG.type_system;

  const questionQuizResultData = questionQuiz;
  const extra = {
    type: 'questionQuiz',
    questionQuizResultData,
  };

  const payload = {
    id: `${SYSTEM_CHAT_TYPE}-${CHAT_QUESTION_QUIZ_RESULTS_MESSAGE}`,
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
