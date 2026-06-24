import React from 'react';

function UserAvatar(props) {
  const {
    user,
  } = props;

  const {
    avatar,
    color,
    name,
    isDialIn,
  } = user;

  const content = (() => {
    if (isDialIn) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
          <path fillRule="evenodd" d="M1.5 4.5a3 3 0 0 1 3-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 0 1-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 0 0 6.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 0 1 1.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 0 1-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5Z" clipRule="evenodd" />
        </svg>
      );
    }

    if (avatar) {
      return (
        <img
          src={avatar}
          alt={name}
          className="w-full h-full object-cover"
        />
      );
    }

    return (
      <div className="capitalize leading-none font-normal select-none">
        {name.substring(0, 2).toLowerCase()}
      </div>
    );
  })();

  return (
    <div
      style={{
        backgroundColor: color,
      }}
      className={`${user.isModerator ? 'rounded-md' : 'rounded-full'} w-full h-full text-gray-100 flex items-center justify-center overflow-hidden`}
    >
      {content}
    </div>
  );
}

export default UserAvatar;
