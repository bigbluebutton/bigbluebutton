import { Meteor } from 'meteor/meteor';
import clearPublicChatHistory from './methods/clearPublicChatHistory';
import startUserTyping from './methods/startUserTyping';
import stopUserTyping from './methods/stopUserTyping';
import chatMessageBeforeJoinCounter from './methods/chatMessageBeforeJoinCounter';
import fetchMessagePerPage from './methods/fetchMessagePerPage';

Meteor.methods({
  fetchMessagePerPage,
  chatMessageBeforeJoinCounter,
  clearPublicChatHistory,
  startUserTyping,
  stopUserTyping,
});
