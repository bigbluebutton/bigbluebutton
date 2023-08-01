import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import { GroupChatMsg } from '/imports/api/group-chat-msg';

const CHAT = Meteor.settings.public.chat;
const SYSTEM_ID = CHAT.type_system;
const CHAT_ID = 'MAIN-PUBLIC-GROUP-CHAT';

export default function addQuestionMsg(meetingId, questionAskerName, questionText, answerText = '') {
  check(meetingId, String);
  check(questionText, String);
  check(questionAskerName, String);
  check(answerText, String);

  const now = Date.now();

  const extra = {
    type: 'question',
    askerName: questionAskerName,
    text: questionText,
    answerText,
  };

  const selector = {
    meetingId,
    chatId: CHAT_ID,
    id: `question-msg-${now}`,
  };

  const modifier = {
    $set: {
      meetingId,
      chatId: CHAT_ID,
      message: '',
      extra,
      sender: SYSTEM_ID,
      timestamp: now,
    },
  };

  try {
    const { numberAffected } = GroupChatMsg.upsert(selector, modifier);

    if (numberAffected) {
      Logger.verbose(`Added question's chat notification meetingId=${meetingId}`);
    }
  } catch (err) {
    Logger.error(`Adding question's chat notification: ${err}`);
  }
}
