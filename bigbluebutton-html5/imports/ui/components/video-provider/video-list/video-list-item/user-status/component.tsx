import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import Styled from './styles';
import { User, VideoItem } from '/imports/ui/components/video-provider/types';
import useWhoIsUnmuted from '/imports/ui/core/hooks/useWhoIsUnmuted';

const intlMessages = defineMessages({
  microphoneOpen: {
    id: 'app.userList.menu.microphoneOpen',
    description: 'Label for when a user microphone is open',
  },
  microphoneClosed: {
    id: 'app.userList.menu.microphoneClosed',
    description: 'Label for when a user microphone is closed',
  },
  listenOnly: {
    id: 'app.userList.menu.listenOnly',
    description: 'Label for a listen only user',
  },
});

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
  const intl = useIntl();
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
          {(muted && !listenOnly) && (
            <Styled.Muted
              iconName="unmute_filled"
              ariaLabel={intl.formatMessage(intlMessages.microphoneClosed)}
            />
          )}
          {listenOnly && (
            <Styled.Voice
              iconName="listen"
              ariaLabel={intl.formatMessage(intlMessages.listenOnly)}
            />
          )}
          {(!muted && !listenOnly) && (
            <Styled.Voice
              iconName="unmute"
              ariaLabel={intl.formatMessage(intlMessages.microphoneOpen)}
            />
          )}
        </>
      )}
    </div>
  );
};

export default UserStatus;
