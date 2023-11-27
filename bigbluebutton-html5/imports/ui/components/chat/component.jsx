import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import injectWbResizeEvent from '/imports/ui/components/presentation/resize-wrapper/component';
import withShortcutHelper from '/imports/ui/components/shortcut-help/service';
import { Meteor } from 'meteor/meteor';
import ChatLogger from '/imports/ui/components/chat/chat-logger/ChatLogger';
import Styled from './styles';
import MessageFormContainer from '/imports/ui/components/chat/chat-graphql/chat-message-form/component';
import ChatList from '/imports/ui/components/chat/chat-graphql/chat-message-list/component';
import { UserSentMessageCollection } from './service';
import Auth from '/imports/ui/services/auth';
import browserInfo from '/imports/utils/browserInfo';
import ChatHeader from './chat-graphql/chat-header/component';

const CHAT_CONFIG = Meteor.settings.public.chat;
const PUBLIC_CHAT_ID = CHAT_CONFIG.public_id;
const ELEMENT_ID = 'chat-messages';

const Chat = (props) => {
  const {
    chatID,
    title,
    messages,
    partnerIsLoggedOut,
    isChatLocked,
    actions,
    isMeteorConnected,
    lastReadMessageTime,
    hasUnreadMessages,
    scrollPosition,
    amIModerator,
    timeWindowsValues,
    dispatch,
    count,
    syncing,
    syncedPercent,
    lastTimeWindowValuesBuild,
    width,
  } = props;

  const userSentMessage = UserSentMessageCollection.findOne({ userId: Auth.userID, sent: true });
  const { isChrome } = browserInfo;

  const isPublicChat = chatID === PUBLIC_CHAT_ID;
  ChatLogger.debug('ChatComponent::render', props);
  return (
    <Styled.Chat
      isChrome={isChrome}
      data-test={isPublicChat ? 'publicChat' : 'privateChat'}
    >
      <ChatHeader />
      <ChatList
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

Chat.propTypes = propTypes;
