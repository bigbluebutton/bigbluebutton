import React from 'react';
import ChatListItem from './component';
import { layoutSelect, layoutSelectInput, layoutDispatch } from '../../layout/context';
import Service from '/imports/ui/components/user-list/service';

const ChatListItemContainer = (props) => {
  const sidebarContent = layoutSelectInput((i) => i.sidebarContent);
  const idChatOpen = layoutSelect((i) => i.idChatOpen);
  const layoutContextDispatch = layoutDispatch();

  const { sidebarContentPanel } = sidebarContent;
  const sidebarContentIsOpen = sidebarContent.isOpen;

  const { isPublicChat } = Service;

  return (
    <ChatListItem
      {...{
        sidebarContentIsOpen,
        sidebarContentPanel,
        layoutContextDispatch,
        idChatOpen,
        isPublicChat,
        ...props,
      }}
    />
  );
};

export default ChatListItemContainer;
