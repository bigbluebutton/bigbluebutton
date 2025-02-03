import React from 'react';
import Styled from '../styles';
import { GuestWaitingUser } from '../queries';
import renderGuestUserItem from './guestUserItem';

const ALLOW_STATUS = 'ALLOW';
const DENY_STATUS = 'DENY';

const renderPendingUsers = (
  message: string,
  usersArray: Array<GuestWaitingUser>,
  action: (users: Array<GuestWaitingUser>, status: string) => void,
  privateMessageVisible: (id: string) => void,
  setPrivateGuestLobbyMessage: (msg: string, userId: string) => void,
  privateGuestLobbyMessage: (userId: string) => string | null,
  isGuestLobbyMessageEnabled: boolean,
) => {
  if (!usersArray.length) return null;
  return (
    <Styled.PendingUsers>
      <Styled.MainTitle>{message}</Styled.MainTitle>
      <Styled.UsersWrapper>
        <Styled.Users role="list">
          {usersArray.map((user, idx) => renderGuestUserItem(
            user.user.name ?? '',
            user.user.color ?? '',
            () => action([user], ALLOW_STATUS),
            () => action([user], DENY_STATUS),
            user.user.role ?? '',
            idx + 1,
            user.user.userId ?? '',
            user.user.avatar ?? '',
            () => privateMessageVisible(`privateMessage-${user.user.userId}`),
            (msg: string) => setPrivateGuestLobbyMessage(msg, user?.user?.userId ?? ''),
            privateGuestLobbyMessage(user?.user?.userId ?? '') ?? '',
            isGuestLobbyMessageEnabled,
          ))}

        </Styled.Users>
      </Styled.UsersWrapper>
    </Styled.PendingUsers>
  );
};

export default renderPendingUsers;
