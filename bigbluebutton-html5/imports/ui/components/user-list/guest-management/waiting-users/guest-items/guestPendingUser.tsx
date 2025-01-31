import React from 'react';
import { IntlShape } from 'react-intl';
import Styled from '../styles';
import { GuestWaitingUser } from '../queries';
import GuestUserItem from './guestUserItem';

const ALLOW_STATUS = 'ALLOW';
const DENY_STATUS = 'DENY';

const renderPendingUsers = (
  usersArray: Array<GuestWaitingUser>,
  action: (users: Array<GuestWaitingUser>, status: string) => void,
  setPrivateGuestLobbyMessage: (msg: string, userId: string) => void,
  privateGuestLobbyMessage: (userId: string) => string | null,
  isGuestLobbyMessageEnabled: boolean,
  intl: IntlShape,
) => {
  if (!usersArray.length) return null;
  return (
    <Styled.PendingUsers>
      <Styled.UsersWrapper>
        <Styled.Users>
          {usersArray.map((user, idx) => (
            <GuestUserItem
              name={user.user.name ?? ''}
              color={user.user.color ?? ''}
              handleAccept={() => action([user], ALLOW_STATUS)}
              handleDeny={() => action([user], DENY_STATUS)}
              role={user.user.role ?? ''}
              sequence={idx + 1}
              userId={user.user.userId ?? ''}
              avatar={user.user.avatar ?? ''}
              setPrivateGuestLobbyMessage={(msg: string) => setPrivateGuestLobbyMessage(msg, user?.user?.userId ?? '')}
              privateGuestLobbyMessage={privateGuestLobbyMessage(user?.user?.userId ?? '') ?? ''}
              isGuestLobbyMessageEnabled={isGuestLobbyMessageEnabled}
              intl={intl}
            />
          ))}
        </Styled.Users>
      </Styled.UsersWrapper>
    </Styled.PendingUsers>
  );
};

export default renderPendingUsers;
