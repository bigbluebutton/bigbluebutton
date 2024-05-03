import React from 'react';
import Styled from './styles';
import Icon from '/imports/ui/components/common/icon/component';
import UserListService from '/imports/ui/components/user-list/service';
import { StreamUser } from '../../../types';

interface UserAvatarVideoProps {
  user: Partial<StreamUser>;
  // eslint-disable-next-line react/require-default-props
  voiceUser?: {
    muted?: boolean;
    listenOnly?: boolean;
    talking?: boolean;
    joined?: boolean;
  };
  squeezed: boolean;
  unhealthyStream: boolean;
}

const UserAvatarVideo: React.FC<UserAvatarVideoProps> = (props) => {
  const {
    user, unhealthyStream, squeezed, voiceUser = {},
  } = props;
  const {
    name = '', color, avatar, role, emoji,
  } = user;
  let {
    presenter, clientType,
  } = user;

  const talking = voiceUser?.talking || false;

  const ROLE_MODERATOR = window.meetingClientSettings.public.user.role_moderator;

  const handleUserIcon = () => {
    if (emoji !== 'none') {
      // @ts-expect-error -> Untyped component.
      return <Icon iconName={UserListService.normalizeEmojiName(emoji)} />;
    }
    return name.toLowerCase().slice(0, 2);
  };

  // hide icons when squeezed
  if (squeezed) {
    presenter = false;
    clientType = '';
  }

  return (
    <Styled.UserAvatarStyled
      moderator={role === ROLE_MODERATOR}
      presenter={presenter}
      dialIn={clientType === 'dial-in-user'}
      color={color}
      emoji={emoji !== 'none'}
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
