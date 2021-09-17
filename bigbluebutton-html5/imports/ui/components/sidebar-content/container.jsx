import React from 'react';
import SidebarContent from './component';
import { layoutSelectInput, layoutSelectOutput, layoutDispatch } from '../layout/context';

const SidebarContentContainer = () => {
  const sidebarContentInput = layoutSelectInput((i) => i.sidebarContent);
  const sidebarContentOutput = layoutSelectOutput((i) => i.sidebarContent);
  const layoutContextDispatch = layoutDispatch();
  const { sidebarContentPanel } = sidebarContentInput;

  if (sidebarContentOutput.display === false) return null;

  return (
    <SidebarContent
      {...sidebarContentOutput}
      contextDispatch={layoutContextDispatch}
      sidebarContentPanel={sidebarContentPanel}
    />
  );
};

export default SidebarContentContainer;
