import React from 'react';
import { Meteor } from 'meteor/meteor';
import { useSubscription } from '@apollo/client';
import {
  IS_TYPING_SUBSCRIPTION,
} from '../queries';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { User } from '/imports/ui/Types/user';
import Styled from './styles';

interface TypingIndicatorProps {
  typingUsers: Array<User>,
  indicatorEnabled: boolean,
  intl: object,
  error: string,
}

const messages = defineMessages({
  severalPeople: {
    id: 'app.chat.multi.typing',
    description: 'displayed when 4 or more users are typing',
  },
});

const CHAT_CONFIG = Meteor.settings.public.chat;
const TYPING_INDICATOR_ENABLED = CHAT_CONFIG.typingIndicator.enabled;

const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  typingUsers,
  indicatorEnabled,
  intl,
  error,
}) => {
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
      error={!!error}
      info={!error}
      spacer={!!element}
    >
      <Styled.TypingIndicator data-test="typingIndicator">{error || element}</Styled.TypingIndicator>
    </Styled.TypingIndicatorWrapper>
  );
};

const TypingIndicatorContainer: React.FC = ({ userId, isTypingTo, error }) => {
  const intl = useIntl();

  const {
    data: typingUsersData,
  } = useSubscription(IS_TYPING_SUBSCRIPTION, {
    variables: {
      chatId: isTypingTo,
    }
  });

  const typingUsers = typingUsersData?.user_typing_public || [];
  const typingUsersArray = typingUsers
    .filter(user => user?.userId !== userId)
    .map(user => user.user);

  return <TypingIndicator
    typingUsers={typingUsersArray}
    indicatorEnabled={TYPING_INDICATOR_ENABLED}
    intl={intl}
    error={error}
  />
};

export default TypingIndicatorContainer;
