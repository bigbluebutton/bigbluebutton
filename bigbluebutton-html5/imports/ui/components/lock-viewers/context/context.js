import React from 'react';

export function LockStruct() {
  return ({
    isLocked: false,
    lockSettings: {
      disableCam: false,
      disableMic: false,
      disableNotes: false,
      disablePrivateChat: false,
      disablePublicChat: false,
      hideViewersCursor: false,
      hideViewersAnnotation: false,
      hideViewersScreenshare: false,
      disableMultiScreenshare: false,
    },
    userLocks: {
      userWebcam: false,
      userMic: false,
      userNotes: false,
      userPrivateChat: false,
      userPublicChat: false,
      hideViewersCursor: false,
      hideViewersAnnotation: false,
      userScreenshare: false,
    },
  });
}

const lockContext = React.createContext(new LockStruct());

export default lockContext;
