import React from 'react';
import PropsType from 'prop-types';

const UserAvatar = ({ color, children }) => {
  const style = {
    backgroundColor: color,
    minWidth: '87px',
    minHeight: '87px',
  };
  return (
    <div
      className="w-1/6 mr-4 inline-flex rounded-md justify-center items-center text-white text-2xl font-semibold"
      style={style}
    >
      {children}
    </div>
  );
};

UserAvatar.defaultProps = {
  color: '',
};

UserAvatar.propTypes = {
  color: PropsType.string,
};

export default UserAvatar;
