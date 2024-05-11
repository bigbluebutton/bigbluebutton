import React from 'react';
import Styled from './styles';
import { StreamUser } from '../../../types';

interface UserStatusProps {
  user: Partial<StreamUser>;
  voiceUser: {
    muted: boolean;
    listenOnly: boolean;
    talking: boolean;
    joined: boolean;
  };
}

const UserStatus: React.FC<UserStatusProps> = (props) => {
  const { voiceUser, user } = props;

  const listenOnly = voiceUser?.listenOnly;
  const muted = voiceUser?.muted;
  const voiceUserJoined = voiceUser?.joined;
  const emoji = user?.reaction?.reactionEmoji;
  const raiseHand = user?.raiseHand;
  const away = user?.away;
  return (
    <div>
      {away && !raiseHand && '⏰'}
      {raiseHand && '✋'}
      {(emoji && emoji !== 'none' && !raiseHand && !away) && emoji}
      {(muted && !listenOnly) && <Styled.Muted iconName="unmute_filled" />}
      {listenOnly && <Styled.Voice iconName="listen" /> }
      {(voiceUserJoined && !muted) && <Styled.Voice iconName="unmute" />}
    </div>
  );
};

export default UserStatus;
