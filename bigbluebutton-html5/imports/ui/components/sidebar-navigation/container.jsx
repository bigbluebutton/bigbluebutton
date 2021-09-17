import React from 'react';
import { layoutDispatch, layoutSelectOutput } from '../layout/context';
import SidebarNavigation from './component';

const SidebarNavigationContainer = () => {
  const sidebarNavigation = layoutSelectOutput((i) => i.sidebarNavigation);
  const layoutContextDispatch = layoutDispatch();

  if (sidebarNavigation.display === false) return null;

  return (
    <SidebarNavigation
      {...sidebarNavigation}
      contextDispatch={layoutContextDispatch}
    />
  );
};

export default SidebarNavigationContainer;
