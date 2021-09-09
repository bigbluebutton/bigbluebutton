import React from 'react';
import { LayoutContextFunc } from '../layout/context';
import SidebarNavigation from './component';

const SidebarNavigationContainer = () => {
  const { layoutContextSelector } = LayoutContextFunc;

  const sidebarNavigation = layoutContextSelector.selectOutput((i) => i.sidebarNavigation);
  const layoutDispatch = layoutContextSelector.layoutDispatch();

  if (sidebarNavigation.display === false) return null;

  return (
    <SidebarNavigation
      {...sidebarNavigation}
      contextDispatch={layoutDispatch}
    />
  );
};

export default SidebarNavigationContainer;
