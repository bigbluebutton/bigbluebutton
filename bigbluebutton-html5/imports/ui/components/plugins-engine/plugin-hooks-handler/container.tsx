import React from 'react';
import CurrentPresentationHookContainer from './use-current-presentation/container'
import LoadedUserListContainer from './use-loaded-user-list/container'

const PluginHooksHandlerContainer = () => {
  
  return (
    <>
      <CurrentPresentationHookContainer />
      <LoadedUserListContainer />
    </>
  );
};

export default PluginHooksHandlerContainer
