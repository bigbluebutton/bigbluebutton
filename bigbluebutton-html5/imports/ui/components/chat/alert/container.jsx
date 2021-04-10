import React, { memo, useContext } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Settings from '/imports/ui/services/settings';
import ChatAlert from './component';
import Auth from '/imports/ui/services/auth';
import { NLayoutContext } from '../../layout/context/context';
import { PANELS } from '../../layout/enums';
import { UsersContext } from '/imports/ui/components/components-data/users-context/context';

const ChatAlertContainer = (props) => {
  const newLayoutContext = useContext(NLayoutContext);
  const { newLayoutContextState, newLayoutContextDispatch } = newLayoutContext;
  const { sidebarContentPanel, idChatOpen } = newLayoutContextState;
  let idChat = idChatOpen;
  if (sidebarContentPanel !== PANELS.CHAT) idChat = '';

  const usingUsersContext = useContext(UsersContext);
  const { users } = usingUsersContext;
  const currentUser = users[Auth.userID];
  const { authTokenValidatedTime } = currentUser;
  return idChatOpen !== null
    && (
      <ChatAlert
        {...{ newLayoutContextDispatch, ...props }}
        joinTimestamp={authTokenValidatedTime}
        idChatOpen={idChat}
      />
    );
};

export default withTracker(() => {
  const AppSettings = Settings.application;
  const activeChats = [];
  // UserListService.getActiveChats();

  return {
    audioAlertDisabled: !AppSettings.chatAudioAlerts,
    pushAlertDisabled: !AppSettings.chatPushAlerts,
    activeChats,
    publicUserId: Meteor.settings.public.chat.public_group_id,
  };
})(memo(ChatAlertContainer));
