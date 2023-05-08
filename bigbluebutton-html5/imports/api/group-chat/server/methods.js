import { Meteor } from 'meteor/meteor';
import createGroupChat from './methods/createGroupChat';
import destroyGroupChat from './methods/destroyGroupChat';
import notifyGroupChatToOpen from './methods/notifyGroupChatToOpen';

Meteor.methods({
  createGroupChat,
  destroyGroupChat,
  notifyGroupChatToOpen,
});
