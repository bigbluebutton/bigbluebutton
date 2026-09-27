import React from 'react';
import Styled from './styles';
import { User, VideoItem } from '/imports/ui/components/video-provider/types';
import useWhoIsUnmuted from '/imports/ui/core/hooks/useWhoIsUnmuted';

interface UserStatusProps {
  user: Partial<User>;
  stream: VideoItem;
  voiceUser?: {
    listenOnly: boolean;
    joined: boolean;
    deafened?: boolean;
  };
}

const UserStatus: React.FC<UserStatusProps> = (props) => {
  const { voiceUser, user, stream } = props;
  const data = { ...user, ...stream };
  const { data: unmuted } = useWhoIsUnmuted(stream.userId);

  const listenOnly = voiceUser?.listenOnly;
  const muted = !unmuted;
  const deafened = voiceUser?.deafened;
  const voiceUserJoined = voiceUser?.joined && !deafened;
  const emoji = data?.reactionEmoji;
  const away = data?.away;

  return (
    <div data-test="webcamUserStatus">
      {away && <span>⏰</span>}
      {(emoji && emoji !== 'none' && !away) && <span>{emoji}</span>}

      {voiceUserJoined && (
        <>
          {(muted && !listenOnly) && <Styled.Muted iconName="unmute_filled" />}
          {listenOnly && <Styled.Voice iconName="listen" />}
          {!muted && <Styled.Voice iconName="unmute" />}
        </>
      )}
    </div>
  );
};

export default UserStatus;
