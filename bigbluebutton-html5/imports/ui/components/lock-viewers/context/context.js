import React from 'react';

export function DataStruct() {
  return ({
    isLocked: false,
    lockSettings: {
      disableCam: false,
      disableMic: false,
      disableNote: false,
      disablePrivateChat: false,
      disablePublicChat: false,
      lockOnJoin: true,
      lockOnJoinConfigurable: false,
      lockedLayout: false,
    },
    userLocks: {
      userWebcam: false,
      userMic: false,
      userNote: false,
      userPrivateChat: false,
      userPublicChat: false,
      userLockOnJoin: false,
      userOnJoinConfigurable: false,
      userLockedLayout: false,
    },
  });
}

const lockContext = React.createContext(new DataStruct());

export default lockContext;
