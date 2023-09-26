import React from 'react';
import Styled from './styles';

interface UserStatusProps {
  listenOnly: boolean;
  muted: boolean;
  joined: boolean;
}

const UserStatus: React.FC<UserStatusProps> = ({ listenOnly, muted, joined }) => (
  <>
    {(muted && !listenOnly) && <Styled.Muted iconName="unmute_filled" />}
    {listenOnly && <Styled.Voice iconName="listen" />}
    {(joined && !muted) && <Styled.Voice iconName="unmute" />}
  </>
);

export default UserStatus;
