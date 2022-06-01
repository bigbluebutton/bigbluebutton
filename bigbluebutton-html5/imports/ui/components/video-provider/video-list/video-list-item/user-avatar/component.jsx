import React from 'react';
import PropTypes from 'prop-types';
import Styled from './styles';
import Icon from '/imports/ui/components/common/icon/component';
import UserListService from '/imports/ui/components/user-list/service';

const UserAvatarVideo = (props) => {
  const { user, unhealthyStream, squeezed } = props;
  const {
    name, color, avatar, role, emoji,
  } = user;
  let {
    presenter, clientType,
  } = user;

  const ROLE_MODERATOR = Meteor.settings.public.user.role_moderator;

  const handleUserIcon = () => {
    if (emoji !== 'none') {
      return <Icon iconName={UserListService.normalizeEmojiName(emoji)} />;
    }
    return name.toLowerCase().slice(0, 2);
  };

  // hide icons when squeezed
  if (squeezed) {
    presenter = false;
    clientType = false;
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
    >
      {handleUserIcon()}
    </Styled.UserAvatarStyled>
  );
};

export default UserAvatarVideo;

UserAvatarVideo.propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
    avatar: PropTypes.string.isRequired,
    role: PropTypes.string.isRequired,
    emoji: PropTypes.string.isRequired,
    presenter: PropTypes.bool.isRequired,
    clientType: PropTypes.string.isRequired,
  }).isRequired,
  unhealthyStream: PropTypes.bool.isRequired,
  squeezed: PropTypes.bool.isRequired,
};
