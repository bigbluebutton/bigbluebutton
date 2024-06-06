import React from 'react';
import Styled from './styles';
import { StreamUser, VideoItem } from '../../../types';

interface UserStatusProps {
  user: Partial<StreamUser>;
  stream: VideoItem;
  voiceUser: {
    muted: boolean;
    listenOnly: boolean;
    joined: boolean;
  };
}

const UserStatus: React.FC<UserStatusProps> = (props) => {
  const { voiceUser, user, stream } = props;
  const data = { ...user, ...stream };

  const listenOnly = voiceUser?.listenOnly;
  const muted = voiceUser?.muted;
  const voiceUserJoined = voiceUser?.joined;
  const emoji = data?.reaction?.reactionEmoji;
  const raiseHand = data?.raiseHand;
  const away = data?.away;
  return (
    <div>
      {away && !raiseHand && <span>⏰</span>}
      {(emoji && emoji !== 'none' && !away) && <span>{emoji}</span>}
      {(muted && !listenOnly) && <Styled.Muted iconName="unmute_filled" />}
      {listenOnly && <Styled.Voice iconName="listen" /> }
      {(voiceUserJoined && !muted) && <Styled.Voice iconName="unmute" />}
    </div>
  );
};

export default UserStatus;
