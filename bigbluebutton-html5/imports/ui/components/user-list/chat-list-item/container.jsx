import React from 'react';
import ChatListItem from './component';
import { LayoutContextFunc } from '../../layout/context';

const ChatListItemContainer = (props) => {
  const { layoutContextSelector } = LayoutContextFunc;

  const sidebarContent = layoutContextSelector.selectInput((i) => i.sidebarContent);
  const idChatOpen = layoutContextSelector.select((i) => i.idChatOpen);
  const layoutContextDispatch = layoutContextSelector.layoutDispatch();

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
