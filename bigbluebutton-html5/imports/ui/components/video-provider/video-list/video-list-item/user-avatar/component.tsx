import React from 'react';
import Styled from './styles';
import { User, VideoItem } from '/imports/ui/components/video-provider/types';

interface UserAvatarVideoProps {
  user: Partial<User>;
  stream: VideoItem;
  // eslint-disable-next-line react/require-default-props
  voiceUser?: {
    talking?: boolean;
  };
  squeezed: boolean;
  unhealthyStream: boolean;
}

const UserAvatarVideo: React.FC<UserAvatarVideoProps> = (props) => {
  const {
    user, stream, unhealthyStream, squeezed, voiceUser = { talking: false },
  } = props;
  const data = { ...user, ...stream };
  const {
    name = '', color = '', avatar = '', isModerator,
  } = data;
  let {
    presenter = false, clientType,
  } = data;

  const { talking = false } = voiceUser;

  const handleUserIcon = () => {
    return <>{name.toLowerCase().slice(0, 2)}</>;
  };

  // hide icons when squeezed
  if (squeezed) {
    presenter = false;
    clientType = '';
  }

  return (
    <Styled.UserAvatarStyled
      moderator={isModerator}
      presenter={presenter}
      dialIn={clientType === 'dial-in-user'}
      color={color}
      emoji={false}
      avatar={avatar}
      unhealthyStream={unhealthyStream}
      talking={talking}
      whiteboardAccess={undefined}
    >
      {handleUserIcon()}
    </Styled.UserAvatarStyled>
  );
};

export default UserAvatarVideo;
