import React from 'react';

const UserAvatar = ({ color, children }) => {
  const style = {
    backgroundColor: color,
  };
  return (
    <div
      className="w-full h-full inline-flex justify-center items-center rounded-md text-white text-2xl font-semibold"
      style={style}
    >
      {children}
    </div>
  );
};

export default UserAvatar;
