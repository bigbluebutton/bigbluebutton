import React from 'react';
import { layoutSelectInput, layoutSelectOutput } from '../layout/context';
import SidebarNavigation from './component';
import { Input, Output } from '../layout/layoutTypes';

const SidebarNavigationContainer = () => {
  const sidebarNavigationInput = layoutSelectInput((i: Input) => i.sidebarNavigation);
  const sidebarNavigation = layoutSelectOutput((i: Output) => i.sidebarNavigation);
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
      sidebarNavigationInput={sidebarNavigationInput}
    />
  );
};

export default SidebarNavigationContainer;
