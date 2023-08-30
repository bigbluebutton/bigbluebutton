import React from 'react';
import Styled from '../styles';
import { GuestWaitingUser } from '../queries';
import { useIntl } from 'react-intl';
import renderGuestUserItem from './guestUserItem';

const ALLOW_STATUS = 'ALLOW';
const DENY_STATUS = 'DENY';

const renderPendingUsers = (
  message: string,
  usersArray: Array<GuestWaitingUser>,
  action: (users: Array<GuestWaitingUser>, status: string) => void,
  privateMessageVisible: (id: string) => string,
  setPrivateGuestLobbyMessage: (msg: string, userId: string) => void,
  privateGuestLobbyMessage: (userId: string) => string,
  isGuestLobbyMessageEnabled: boolean,
) => {
  if (!usersArray.length) return null;
  return (
    <Styled.PendingUsers>
      <Styled.MainTitle>{message}</Styled.MainTitle>
      <Styled.UsersWrapper>
        <Styled.Users>
          {usersArray.map((user, idx) => renderGuestUserItem(
            user.user.name ?? '',
            user.user.color ?? '',
            () => action([user.user], ALLOW_STATUS),
            () => action([user.user], DENY_STATUS),
            user.user.role ?? '',
            idx + 1,
            user.user.userId ?? '',
            user.user.avatar ?? '',
            () => privateMessageVisible(`privateMessage-${user.user.userId}`),
            (msg: string) => setPrivateGuestLobbyMessage(msg, user.user.userId),
            privateGuestLobbyMessage(user.user.userId),
            isGuestLobbyMessageEnabled,
          ))}
        </Styled.Users>
      </Styled.UsersWrapper>
    </Styled.PendingUsers>
  );
};

export default renderPendingUsers;
