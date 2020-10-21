import React from 'react';
import PropsType from 'prop-types';


const defaultAvatar = '';

const UserAvatar = ({ avatar }) => (
  <div className="w-1/6 mr-4">
    <img src={avatar} className="fill-current" alt="" />
  </div>
);

UserAvatar.defaultProps = {
  avatar: defaultAvatar,
};

UserAvatar.propTypes = {
  avatar: PropsType.string,
};

export default UserAvatar;
