import React from 'react';
import Styled from './styles';
import Icon from '/imports/ui/components/common/icon/icon-ts/component';
import UserListService from '/imports/ui/components/user-list/service';

interface UserAvatarVideoProps {
  presenter: boolean;
  clientType: string;
  name: string;
  color: string;
  avatar: string;
  isModerator: boolean;
  emoji: string;
  unhealthyStream: boolean;
  squeezed: boolean;
  talking: boolean;
}

const UserAvatarVideo: React.FC<UserAvatarVideoProps> = ({
  unhealthyStream,
  squeezed,
  talking,
  presenter,
  clientType,
  name,
  color,
  avatar,
  isModerator,
  emoji,
}) => {
  const handleUserIcon = () => {
    if (emoji !== 'none') {
      return <Icon iconName={UserListService.normalizeEmojiName(emoji)} />;
    }
    return name.toLowerCase().slice(0, 2);
  };

  return (
    <Styled.UserAvatarStyled
      moderator={isModerator}
      presenter={presenter && !squeezed}
      dialIn={(clientType === 'dial-in-user') && !squeezed}
      color={color}
      emoji={emoji !== 'none'}
      avatar={avatar}
      unhealthyStream={unhealthyStream}
      talking={talking}
      whiteboardAccess={false}
    >
      {handleUserIcon()}
    </Styled.UserAvatarStyled>
  );
};

export default UserAvatarVideo;
