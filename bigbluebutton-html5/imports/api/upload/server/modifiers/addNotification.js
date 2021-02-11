import flat from 'flat';
import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import { GroupChatMsg } from '/imports/api/group-chat-msg';

const CHAT = Meteor.settings.public.chat;
const SYSTEM_ID = CHAT.type_system;
const CHAT_ID = 'MAIN-PUBLIC-GROUP-CHAT';

export default function addUploadedFileMsg(meetingId, userId, uploadId, source, filename) {
  check(meetingId, String);
  check(userId, String);
  check(uploadId, String);
  check(source, String);
  check(filename, String);

  const now = Date.now();

  const upload = {
    uploadId,
    source,
    filename,
  };

  const selector = {
    meetingId,
    chatId: CHAT_ID,
    id: `upload-msg-${now}`,
  };

  const modifier = {
    $set: {
      meetingId,
      chatId: CHAT_ID,
      message: '',
      upload,
      sender: SYSTEM_ID,
      timestamp: now,
    },
  };
  
  try {
    const { insertedId, numberAffected } =  GroupChatMsg.upsert(selector, modifier);

    if (insertedId) {
      Logger.info(`Added group-chat-msg uploaded file meetingId=${meetingId}`);
    } else if (numberAffected){
      Logger.info(`Upserted group-chat-msg uploaded file meetingId=${meetingId}`);
    }
  } catch (err) {
      Logger.error(`Adding group-chat-msg uploaded file to collection: ${err}`);
  }
}
