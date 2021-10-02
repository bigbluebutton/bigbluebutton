import React from 'react';

function UserAvatar(props) {
  const {
    user,
  } = props;

  return (
    <div className={`border-2 border-gray-800 items-center ${user.isModerator ? 'rounded-md' : 'rounded-full'}`}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full p-1"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        {user.isDialIn
          ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
            />
          )
          : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          )}
      </svg>
    </div>
  );
}

export default UserAvatar;
