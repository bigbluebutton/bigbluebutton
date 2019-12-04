import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { Session } from 'meteor/session';
import ChatListItem from './component';

const ChatListItemContainer = props => <ChatListItem {...props} />;

export default withTracker(() => ({
  activeChatId: Session.get('idChatOpen'),
  chatPanelOpen: Session.get('openPanel') === 'chat',
}))(ChatListItemContainer);
