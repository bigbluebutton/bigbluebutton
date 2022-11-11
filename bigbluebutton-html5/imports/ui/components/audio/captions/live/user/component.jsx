import React from 'react';
import PropTypes from 'prop-types';
import UserAvatar from '/imports/ui/components/user-avatar/component';

const User = ({
  avatar,
  background,
  color,
  moderator,
  name,
}) => (
  <div
    style={{
      background,
      minHeight: '3.25rem',
      padding: '.5rem',
      textTransform: 'capitalize',
      width: '3.25rem',
    }}
  >
    <UserAvatar
      avatar={avatar}
      color={color}
      moderator={moderator}
    >
      {name.slice(0, 2)}
    </UserAvatar>
  </div>
);

User.propTypes = {
  avatar: PropTypes.string.isRequired,
  background: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
  moderator: PropTypes.bool.isRequired,
  name: PropTypes.string.isRequired,
};

export default User;
