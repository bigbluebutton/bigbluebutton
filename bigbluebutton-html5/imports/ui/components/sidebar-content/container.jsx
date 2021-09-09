import React from 'react';
import SidebarContent from './component';
import { LayoutContextFunc } from '../layout/context';

const SidebarContentContainer = () => {
  const { layoutContextSelector } = LayoutContextFunc;

  const sidebarContentInput = layoutContextSelector.selectInput((i) => i.sidebarContent);
  const sidebarContentOutput = layoutContextSelector.selectOutput((i) => i.sidebarContent);
  const layoutDispatch = layoutContextSelector.layoutDispatch();
  const { sidebarContentPanel } = sidebarContentInput;

  if (sidebarContentOutput.display === false) return null;

  return (
    <SidebarContent
      {...sidebarContentOutput}
      contextDispatch={layoutDispatch}
      sidebarContentPanel={sidebarContentPanel}
    />
  );
};

export default SidebarContentContainer;
