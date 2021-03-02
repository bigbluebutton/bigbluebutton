import React, { useContext } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { Session } from 'meteor/session';
import ChatListItem from './component';
import { NLayoutContext } from '../../layout/context/context';

const ChatListItemContainer = (props) => {
  const newLayoutContext = useContext(NLayoutContext);
  const { newLayoutContextState, newLayoutContextDispatch } = newLayoutContext;
  const { sidebarContentPanel, idChatOpen } = newLayoutContextState;
  return <ChatListItem {...{ sidebarContentPanel, newLayoutContextDispatch, idChatOpen, ...props }} />;
};

export default withTracker(() => ({
  activeChatId: Session.get('idChatOpen'),
}))(ChatListItemContainer);
