import React, { useContext } from 'react';
import ChatListItem from './component';
import { NLayoutContext } from '../../layout/context/context';

const ChatListItemContainer = (props) => {
  const newLayoutContext = useContext(NLayoutContext);
  const { newLayoutContextState, newLayoutContextDispatch } = newLayoutContext;
  const { input, idChatOpen } = newLayoutContextState;
  const { sidebarContent } = input;
  const { sidebarContentPanel } = sidebarContent;
  const sidebarContentIsOpen = sidebarContent.isOpen;

  return (
    <ChatListItem
      {...{
        sidebarContentIsOpen,
        sidebarContentPanel,
        newLayoutContextDispatch,
        idChatOpen,
        ...props,
      }}
    />
  );
};

export default ChatListItemContainer;
