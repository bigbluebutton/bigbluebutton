import React, { useContext } from 'react';
import UserMessages from './component';
import { ChatContext } from '/imports/ui/components/components-data/chat-context/context';
import { GroupChatContext } from '/imports/ui/components/components-data/group-chat-context/context';
import { UsersContext } from '/imports/ui/components/components-data/users-context/context';
import Service from '/imports/ui/components/user-list/service';
import Auth from '/imports/ui/services/auth';
import { withTracker } from 'meteor/react-meteor-data';
import Storage from '/imports/ui/services/storage/session';
import { layoutSelectInput, layoutDispatch } from '/imports/ui/components/layout/context';
import { SMALL_VIEWPORT_BREAKPOINT } from '/imports/ui/components/layout/enums';

const CLOSED_CHAT_LIST_KEY = 'closedChatList';

const UserMessagesContainer = ({compact}) => {
  const usingChatContext = useContext(ChatContext);
  const usingUsersContext = useContext(UsersContext);
  const usingGroupChatContext = useContext(GroupChatContext);
  const { chats: groupChatsMessages } = usingChatContext;
  const { users } = usingUsersContext;
  const { groupChat: groupChats } = usingGroupChatContext;
  const activeChats = Service.getActiveChats({ groupChatsMessages, groupChats, users:users[Auth.meetingID] });
  const { roving } = Service;
  const layoutContextDispatch = layoutDispatch();
  const { width: browserWidth } = layoutSelectInput((i) => i.browser);
  const isMobile = browserWidth <= SMALL_VIEWPORT_BREAKPOINT;

  return <UserMessages {...{ activeChats, roving, layoutContextDispatch, compact, isMobile }} />;
};

export default withTracker(() => {
  // Here just to add reactivity to this component.
  // We need to rerender this component whenever this
  // Storage variable changes.
  Storage.getItem(CLOSED_CHAT_LIST_KEY);
  return {};
})(UserMessagesContainer);
