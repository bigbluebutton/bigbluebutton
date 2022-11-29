import React from 'react';
import { layoutDispatch, layoutSelectInput, layoutSelectOutput } from '../layout/context';
import SidebarNavigation from './component';

const SidebarNavigationContainer = () => {
  const sidebarNavigation = layoutSelectOutput((i) => i.sidebarNavigation);
  const sidebarNavigationInput = layoutSelectInput((i) => i.sidebarNavigation);
  const { isCompact } = sidebarNavigationInput;
  const layoutContextDispatch = layoutDispatch();

  if (sidebarNavigation.display === false) return null;

  return (
    <SidebarNavigation
      {...sidebarNavigation}
      isCompact={isCompact}
      contextDispatch={layoutContextDispatch}
    />
  );
};

export default SidebarNavigationContainer;
