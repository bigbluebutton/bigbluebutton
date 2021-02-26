import React, { memo } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Settings from '/imports/ui/services/settings';
import ChatAlert from './component';
import Auth from '/imports/ui/services/auth';
import Users from '/imports/api/users';
import NewLayoutContext from '../../layout/context/context';
import { PANELS } from '../../layout/enums';

const ChatAlertContainer = (props) => {
  const { newLayoutContextState, idChatOpen, ...rest } = props;
  const { sidebarContentPanel } = newLayoutContextState;
  let idChat = idChatOpen;
  if (sidebarContentPanel !== PANELS.CHAT) idChat = '';
  return <ChatAlert {...rest} idChatOpen={idChat} />;
};

export default withTracker(() => {
  const AppSettings = Settings.application;
  const activeChats = [];
  // UserListService.getActiveChats();
  const { loginTime } = Users.findOne({ userId: Auth.userID }, { fields: { loginTime: 1 } });

  const idChatOpen = Session.get('idChatOpen');

  return {
    audioAlertDisabled: !AppSettings.chatAudioAlerts,
    pushAlertDisabled: !AppSettings.chatPushAlerts,
    activeChats,
    publicUserId: Meteor.settings.public.chat.public_group_id,
    joinTimestamp: loginTime,
    idChatOpen,
  };
})(memo(NewLayoutContext.withConsumer(ChatAlertContainer)));
