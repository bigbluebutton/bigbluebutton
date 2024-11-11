import React from 'react';
import { layoutSelectOutput } from '../layout/context';
import SidebarNavigation from './component';
import { Input } from '../layout/layoutTypes';

const SidebarNavigationContainer = () => {
  const sidebarNavigation = layoutSelectOutput((i: Input) => i.sidebarNavigation);
  const {
    top,
    left,
    right,
    zIndex,
    width,
    height,
  } = sidebarNavigation;

  if (sidebarNavigation.display === false) return null;

  return (
    <SidebarNavigation
      top={top}
      left={left}
      right={right}
      zIndex={zIndex}
      width={width}
      height={height}
    />
  );
};

export default SidebarNavigationContainer;
