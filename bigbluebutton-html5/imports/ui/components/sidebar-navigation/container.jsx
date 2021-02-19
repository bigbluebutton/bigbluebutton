import React from 'react';
import NewLayoutContext from '../layout/context/context';
import SidebarNavigation from './component';

const SidebarNavigationContainer = (props) => {
  const { newLayoutContextState, newLayoutContextDispatch, openPanel } = props;
  const { output } = newLayoutContextState;
  const { sidebarNavigation } = output;

  if (sidebarNavigation.display === false) return null;

  return (
    <SidebarNavigation
      {...sidebarNavigation}
      openPanel={openPanel}
      contextDispatch={newLayoutContextDispatch}
    />
  );
};

export default NewLayoutContext.withConsumer(SidebarNavigationContainer);
