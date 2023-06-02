import React, { memo, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import injectWbResizeEvent from '/imports/ui/components/presentation/resize-wrapper/component';
import withShortcutHelper from '/imports/ui/components/shortcut-help/service';
import { Meteor } from 'meteor/meteor';
import ChatLogger from '/imports/ui/components/chat/chat-logger/ChatLogger';
import Styled from './styles';
import MessageFormContainer from './message-form/container';
import TimeWindowList from './time-window-list/container';
import ChatDropdownContainer from './chat-dropdown/container';
import { PANELS, ACTIONS } from '../layout/enums';
import { UserSentMessageCollection } from './service';
import Auth from '/imports/ui/services/auth';
import browserInfo from '/imports/utils/browserInfo';
import Header from '/imports/ui/components/common/control-header/component';
import { CLOSE_PRIVATE_CHAT_MUTATION } from '../user-list/user-list-content/user-messages/chat-list/queries';
import { useMutation, gql } from '@apollo/client';
import ChatHeader from './chat-graphql/chat-header/component';

const CHAT_CONFIG = Meteor.settings.public.chat;
const PUBLIC_CHAT_ID = CHAT_CONFIG.public_id;
const ELEMENT_ID = 'chat-messages';

const intlMessages = defineMessages({
  closeChatLabel: {
    id: 'app.chat.closeChatLabel',
    description: 'aria-label for closing chat button',
  },
  hideChatLabel: {
    id: 'app.chat.hideChatLabel',
    description: 'aria-label for hiding chat button',
  },
});

const Chat = (props) => {
  const {
    chatID,
    title,
    messages,
    partnerIsLoggedOut,
    isChatLocked,
    actions,
    intl,
    shortcuts,
    isMeteorConnected,
    lastReadMessageTime,
    hasUnreadMessages,
    scrollPosition,
    amIModerator,
    meetingIsBreakout,
    timeWindowsValues,
    dispatch,
    count,
    layoutContextDispatch,
    syncing,
    syncedPercent,
    lastTimeWindowValuesBuild,
    width,
  } = props;

  const [updateVisible] = useMutation(CLOSE_PRIVATE_CHAT_MUTATION);

  const handleClosePrivateChat = () => {
    updateVisible(({
        variables: {
            chatId: chatID
        },
    }))
    actions.handleClosePrivateChat(chatID);
  };

  const userSentMessage = UserSentMessageCollection.findOne({ userId: Auth.userID, sent: true });
  const { isChrome } = browserInfo;

  const HIDE_CHAT_AK = shortcuts.hideprivatechat;
  const CLOSE_CHAT_AK = shortcuts.closeprivatechat;
  const isPublicChat = chatID === PUBLIC_CHAT_ID;
  ChatLogger.debug('ChatComponent::render', props);
  return (
    <Styled.Chat
      isChrome={isChrome}
      data-test={isPublicChat ? 'publicChat' : 'privateChat'}
    >
      <ChatHeader />
      <TimeWindowList
        id={ELEMENT_ID}
        chatId={chatID}
        handleScrollUpdate={actions.handleScrollUpdate}
        {...{
          partnerIsLoggedOut,
          lastReadMessageTime,
          hasUnreadMessages,
          scrollPosition,
          messages,
          currentUserIsModerator: amIModerator,
          timeWindowsValues,
          dispatch,
          count,
          syncing,
          syncedPercent,
          lastTimeWindowValuesBuild,
          userSentMessage,
          width,
        }}
      />
      <MessageFormContainer
        title={title}
        chatId={chatID}
        chatTitle={title}
        chatAreaId={ELEMENT_ID}
        disabled={isChatLocked || !isMeteorConnected}
        connected={isMeteorConnected}
        locked={isChatLocked}
        partnerIsLoggedOut={partnerIsLoggedOut}
      />
    </Styled.Chat>
  );
};

export default memo(withShortcutHelper(injectWbResizeEvent(injectIntl(Chat)), ['hidePrivateChat', 'closePrivateChat']));

const propTypes = {
  chatID: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  shortcuts: PropTypes.objectOf(PropTypes.string),
  partnerIsLoggedOut: PropTypes.bool.isRequired,
  isChatLocked: PropTypes.bool.isRequired,
  isMeteorConnected: PropTypes.bool.isRequired,
  actions: PropTypes.shape({
    handleClosePrivateChat: PropTypes.func.isRequired,
  }).isRequired,
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
};

const defaultProps = {
  shortcuts: [],
};

Chat.propTypes = propTypes;
Chat.defaultProps = defaultProps;
