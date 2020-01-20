import { check } from 'meteor/check';
import addGroupChat from '../modifiers/addGroupChat';
import { resyncResolver } from '/imports/api/common/server/helpers';
import { dependencies } from '/imports/startup/server/meteorSyncComfirmation';

export default function handleGroupChats({ body }, meetingId) {
  const { chats } = body;

  check(meetingId, String);
  check(chats, Array);

  const chatsAdded = [];

  chats.forEach((chat) => {
    chatsAdded.push(addGroupChat(meetingId, chat));
  });
  resyncResolver(meetingId, dependencies.GROUP_CHATS);
  return chatsAdded;
}
