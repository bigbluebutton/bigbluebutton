import React, { useContext } from 'react';
import UserMessages from './component';
import { ChatContext } from '/imports/ui/components/components-data/chat-context/context';
import { GroupChatContext } from '/imports/ui/components/components-data/group-chat-context/context';
import { UsersContext } from '/imports/ui/components/components-data/users-context/context';
import Service from '/imports/ui/components/user-list/service';
import Auth from '/imports/ui/services/auth';
import { withTracker } from 'meteor/react-meteor-data';
import Storage from '/imports/ui/services/storage/session';
import ChatList from './chat-list/component';

const CLOSED_CHAT_LIST_KEY = 'closedChatList';

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const chatList = urlParams.get('chatList');

const UserMessagesContainer = () => {
  const usingChatContext = useContext(ChatContext);
  const usingUsersContext = useContext(UsersContext);
  const usingGroupChatContext = useContext(GroupChatContext);
  const { chats: groupChatsMessages } = usingChatContext;
  const { users } = usingUsersContext;
  const { groupChat: groupChats } = usingGroupChatContext;
  const activeChats = Service.getActiveChats({ groupChatsMessages, groupChats, users:users[Auth.meetingID] });
  const { roving } = Service;

  return <UserMessages {...{ activeChats, roving }} />;
};

const Container = withTracker(() => {
  // Here just to add reactivity to this component.
  // We need to rerender this component whenever this
  // Storage variable changes.
  Storage.getItem(CLOSED_CHAT_LIST_KEY);
  return {};
})(UserMessagesContainer);


const blank = () => (
  <>
    {
      // console.log("Teste chat item list", chatList)
      (
        chatList === 'graphql'
        || chatList === 'both'
        || !chatList
      ) ? <ChatList />
        : null
    }
    <br />
    {
      (
        chatList === 'meteor'
        || chatList === 'both'
      ) ? <Container />
        : null
    }
  </>
);
export default blank;
