import React from 'react';
import {
  IS_TYPING_PUBLIC_SUBSCRIPTION,
  IS_TYPING_PRIVATE_SUBSCRIPTION,
} from './queries';
import {
  defineMessages,
  FormattedMessage,
  useIntl,
  IntlShape,
} from 'react-intl';
import { User } from '/imports/ui/Types/user';
import Styled from './styles';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import { layoutSelect } from '../../../layout/context';
import { Layout } from '../../../layout/layoutTypes';
import useChat from '/imports/ui/core/hooks/useChat';
import useMeeting from '/imports/ui/core/hooks/useMeeting';
import { Chat } from '/imports/ui/Types/chat';
import { GraphqlDataHookSubscriptionResponse } from '/imports/ui/Types/hook';
import useDeduplicatedSubscription from '/imports/ui/core/hooks/useDeduplicatedSubscription';
import logger from '/imports/startup/client/logger';
import connectionStatus from '/imports/ui/core/graphql/singletons/connectionStatus';

const DEBUG_CONSOLE = false;

interface TypingIndicatorProps {
  typingUsers: Array<User>,
  intl: IntlShape,
}

const messages = defineMessages({
  severalPeople: {
    id: 'app.chat.multi.typing',
    description: 'displayed when 4 or more users are typing',
  },
});

const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  typingUsers,
  intl,
}) => {
  const { length } = typingUsers;
  const isSingleTyper = length === 1;
  const isCoupleTyper = length === 2;
  const isMultiTypers = length > 2;

  let element = null;

  if (isSingleTyper) {
    const name = typingUsers[0]?.name;

    element = (
      <FormattedMessage
        id="app.chat.one.typing"
        description="label used when one user is typing"
        values={{
          userName:
  <Styled.SingleTyper>
    {`${name}`}
    &nbsp;
  </Styled.SingleTyper>,
        }}
      />
    );
  }

  if (isCoupleTyper) {
    const name = typingUsers[0]?.name;
    const name2 = typingUsers[1]?.name;

    element = (
      <FormattedMessage
        id="app.chat.two.typing"
        description="label used when two users are typing"
        values={{
          userName1:
  <Styled.CoupleTyper>
    {`${name}`}
    &nbsp;
  </Styled.CoupleTyper>,
          userName2:
  <Styled.CoupleTyper>
    &nbsp;
    {`${name2}`}
    &nbsp;
  </Styled.CoupleTyper>,
        }}
      />
    );
  }

  if (isMultiTypers) {
    element = (
      <span>
        {`${intl.formatMessage(messages.severalPeople)}`}
      </span>
    );
  }

  return (
    <Styled.TypingIndicatorWrapper>
      <Styled.TypingIndicator data-test="typingIndicator">{element}</Styled.TypingIndicator>
    </Styled.TypingIndicatorWrapper>
  );
};

const TypingIndicatorContainer: React.FC = () => {
  const idChatOpen: string = layoutSelect((i: Layout) => i.idChatOpen);
  const intl = useIntl();
  const { data: currentUser } = useCurrentUser((user: Partial<User>) => {
    return {
      userId: user?.userId,
      isModerator: user?.isModerator,
      locked: user?.locked,
      userLockSettings: user?.userLockSettings,
    };
  });
  // eslint-disable-next-line no-unused-expressions, no-console
  DEBUG_CONSOLE && console.log('TypingIndicatorContainer:currentUser', currentUser);
  const { data: chat } = useChat((c) => {
    return {
      participant: c?.participant,
      chatId: c?.chatId,
      public: c?.public,
    };
  }, idChatOpen) as GraphqlDataHookSubscriptionResponse<Chat>;

  const { data: meeting } = useMeeting((m) => ({
    lockSettings: m?.lockSettings,
  }));

  const isLocked = currentUser?.locked || currentUser?.userLockSettings?.disablePublicChat;
  const isModerator = currentUser?.isModerator;
  const isPublicChat = chat?.public;
  const disablePublicChat = meeting?.lockSettings?.disablePublicChat
    || currentUser?.userLockSettings?.disablePublicChat;
  const disablePrivateChat = meeting?.lockSettings?.disablePrivateChat;

  let locked = false;

  if (!isModerator) {
    if (isPublicChat) {
      locked = (isLocked && disablePublicChat) || false;
    } else {
      locked = (isLocked && disablePrivateChat && !chat?.participant?.isModerator) || false;
    }
  }

  const CHAT_CONFIG = window.meetingClientSettings.public.chat;
  const PUBLIC_GROUP_CHAT_KEY = CHAT_CONFIG.public_group_id;
  const TYPING_INDICATOR_ENABLED = CHAT_CONFIG.typingIndicator.enabled;

  // eslint-disable-next-line no-unused-expressions, no-console
  DEBUG_CONSOLE && console.log('TypingIndicatorContainer:chat', chat);
  const typingQuery = idChatOpen === PUBLIC_GROUP_CHAT_KEY ? IS_TYPING_PUBLIC_SUBSCRIPTION
    : IS_TYPING_PRIVATE_SUBSCRIPTION;
  const {
    data: typingUsersData,
    error: typingUsersError,
  } = useDeduplicatedSubscription(typingQuery, {
    variables: {
      chatId: idChatOpen,
    },
  });
  // eslint-disable-next-line no-unused-expressions, no-console
  DEBUG_CONSOLE && console.log('TypingIndicatorContainer:typingUsersData', typingUsersData);

  if (typingUsersError) {
    connectionStatus.setSubscriptionFailed(true);
    logger.error(
      {
        logCode: 'subscription_Failed',
        extraInfo: {
          error: typingUsersError,
        },
      },
      'Subscription failed to load',
    );
    return null;
  }

  const publicTypingUsers = typingUsersData?.user_typing_public || [];
  const privateTypingUsers = typingUsersData?.user_typing_private || [];

  const typingUsers = privateTypingUsers.concat(publicTypingUsers);

  const typingUsersArray = typingUsers
    .filter((user: { user: object; userId: string; }) => user?.user && user?.userId !== currentUser?.userId)
    .map((user: { user: object; }) => user.user);

  if (locked || !TYPING_INDICATOR_ENABLED || !typingUsers) return null;

  return (
    <TypingIndicator
      typingUsers={typingUsersArray}
      intl={intl}
    />
  );
};

export default TypingIndicatorContainer;
