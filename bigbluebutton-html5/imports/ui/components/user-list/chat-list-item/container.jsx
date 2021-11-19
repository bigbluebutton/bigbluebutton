import React from 'react';
import ChatListItem from './component';
import { layoutSelect, layoutSelectInput, layoutDispatch } from '../../layout/context';

const ChatListItemContainer = (props) => {
  const sidebarContent = layoutSelectInput((i) => i.sidebarContent);
  const idChatOpen = layoutSelect((i) => i.idChatOpen);
  const layoutContextDispatch = layoutDispatch();

  const { sidebarContentPanel } = sidebarContent;
  const sidebarContentIsOpen = sidebarContent.isOpen;

  return (
    <ChatListItem
      {...{
        sidebarContentIsOpen,
        sidebarContentPanel,
        layoutContextDispatch,
        idChatOpen,
        ...props,
      }}
    />
  );
};

export default ChatListItemContainer;
