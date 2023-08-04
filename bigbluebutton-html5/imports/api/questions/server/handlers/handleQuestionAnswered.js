import { check } from 'meteor/check';
import updateQuestion from '/imports/api/questions/server/modifiers/updateQuestionAnswered';
import Questions from '/imports/api/questions';
import addSystemMsg from '../../../group-chat-msg/server/modifiers/addSystemMsg';

export default function handleQuestionAnswered({ body }, meetingId) {
  const { questionId, answerText } = body;

  const CHAT_CONFIG = Meteor.settings.public.chat;
  const PUBLIC_GROUP_CHAT_ID = CHAT_CONFIG.public_group_id;
  const PUBLIC_CHAT_SYSTEM_ID = CHAT_CONFIG.system_userid;
  const CHAT_QUESTION_MESSAGE = CHAT_CONFIG.system_messages_keys.chat_question_message;
  const SYSTEM_CHAT_TYPE = CHAT_CONFIG.type_system;

  check(meetingId, String);
  check(questionId, String);
  check(answerText, String);

  updateQuestion(meetingId, questionId, answerText);

  const question = Questions.findOne({
    meetingId,
    questionId,
  }, {
    fields: {
      userName: 1,
      text: 1,
    }
  });

  const questionWithAnswer = {
    askerName: question.userName,
    text: question.text,
    answerText,
  };

  const extra = {
    type: 'question',
    question: questionWithAnswer,
  };

  const payload = {
    id: `${SYSTEM_CHAT_TYPE}-${CHAT_QUESTION_MESSAGE}`,
    timestamp: Date.now(),
    correlationId: `${PUBLIC_CHAT_SYSTEM_ID}-${Date.now()}`,
    sender: {
      id: PUBLIC_CHAT_SYSTEM_ID,
      name: '',
    },
    message: '',
    extra,
  };

  addSystemMsg(meetingId, PUBLIC_GROUP_CHAT_ID, payload);
}
