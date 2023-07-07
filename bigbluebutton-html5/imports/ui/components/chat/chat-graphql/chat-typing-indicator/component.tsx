import React from 'react';
import { Meteor } from 'meteor/meteor';
import { useSubscription } from '@apollo/client';
import {
  IS_TYPING_PUBLIC_SUBSCRIPTION,
  IS_TYPING_PRIVATE_SUBSCRIPTION,
} from './queries';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { User } from '/imports/ui/Types/user';
import Styled from './styles';
import { useCurrentUser } from '/imports/ui/core/hooks/useCurrentUser';
import { layoutSelect } from '../../../layout/context';
import { Layout } from '../../../layout/layoutTypes';
import useChat from '/imports/ui/core/hooks/useChat';
import { Chat } from '/imports/ui/Types/chat';
const DEBUG_CONSOLE = false;

const CHAT_CONFIG = Meteor.settings.public.chat;
const PUBLIC_CHAT_KEY = CHAT_CONFIG.public_id;
const PUBLIC_GROUP_CHAT_KEY = CHAT_CONFIG.public_group_id;
const TYPING_INDICATOR_ENABLED = CHAT_CONFIG.typingIndicator.enabled;

interface TypingIndicatorProps {
  typingUsers: Array<User>,
  indicatorEnabled: boolean,
}

const messages = defineMessages({
  severalPeople: {
    id: 'app.chat.multi.typing',
    description: 'displayed when 4 or more users are typing',
  },
});



const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  typingUsers,
  indicatorEnabled.
}) => {
  const intl = useIntl();

  if (!indicatorEnabled || !typingUsers) return null;

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
          0: <Styled.SingleTyper>
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
          0: <Styled.CoupleTyper>
            {`${name}`}
            &nbsp;
          </Styled.CoupleTyper>,
          1: <Styled.CoupleTyper>
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
    <Styled.TypingIndicatorWrapper
    >
      <Styled.TypingIndicator data-test="typingIndicator">{element}</Styled.TypingIndicator>
    </Styled.TypingIndicatorWrapper>
  );
};

const TypingIndicatorContainer: React.FC = () => {


  const idChatOpen: string = layoutSelect((i: Layout) => i.idChatOpen);
  const currentUser = useCurrentUser((user: Partial<User>) => {
    return {
      userId: user.userId,
    }
  });
  DEBUG_CONSOLE && console.log('TypingIndicatorContainer:currentUser', currentUser);
  const chat = useChat((c: Partial<Chat>) => {
    const participant = c?.participant ? {
      participant: {
        name: c?.participant?.name,
        isModerator: c?.participant?.isModerator,
        isOnline: c?.participant?.isOnline,
      }
    } : {};

    return {
      ...participant,
      chatId: c?.chatId,
      public: c?.public,
    };
  }, idChatOpen) as Partial<Chat>;
  DEBUG_CONSOLE && console.log('TypingIndicatorContainer:chat', chat);
  const typingQuery = idChatOpen === PUBLIC_GROUP_CHAT_KEY ? IS_TYPING_PUBLIC_SUBSCRIPTION : IS_TYPING_PRIVATE_SUBSCRIPTION;
  const {
    data: typingUsersData,
    error: typingUsersError,
  } = useSubscription(typingQuery, {
    variables: {
      chatId: idChatOpen,
    }
  });
  DEBUG_CONSOLE && console.log('TypingIndicatorContainer:typingUsersData', typingUsersData);

  if (typingUsersError) return <div>Error: {JSON.stringify(typingUsersError)}</div>
  const publicTypingUsers = typingUsersData?.user_typing_public || [];
  const privateTypingUsers = typingUsersData?.user_typing_private || [];

  const typingUsers = privateTypingUsers.concat(publicTypingUsers);

  const typingUsersArray = typingUsers
    .filter((user: { user: object; userId: string; }) => user?.user && user?.userId !== currentUser?.userId)
    .map((user: { user: object; }) => user.user);

  return <TypingIndicator
    typingUsers={typingUsersArray}
    indicatorEnabled={TYPING_INDICATOR_ENABLED}
  />
};

export default TypingIndicatorContainer;
