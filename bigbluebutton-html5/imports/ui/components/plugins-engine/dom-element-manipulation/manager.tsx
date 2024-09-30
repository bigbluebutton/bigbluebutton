import React from 'react';

import ChatMessageDomElementManipulationHookManager from './chat/message/hook-manager';
import UserCameraDomElementManipulationHookManager from './user-camera/hook-manager';

const PluginDomElementManipulationManager: React.FC = () => {
  return (
    <>
      <ChatMessageDomElementManipulationHookManager />
      <UserCameraDomElementManipulationHookManager />
    </>
  );
};

export default PluginDomElementManipulationManager;
