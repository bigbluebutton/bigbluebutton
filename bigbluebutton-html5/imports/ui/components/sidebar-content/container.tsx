import React from 'react';
import SidebarContent from './component';
import { layoutSelectInput, layoutDispatch } from '../layout/context';
import { Input } from '/imports/ui/components/layout/layoutTypes';
import { SidebarContentContanerProps } from './types';

const SidebarContentContainer = ({ isSharedNotesPinned }: SidebarContentContanerProps) => {
  const sidebarContentInput = layoutSelectInput((i: Input) => i.sidebarContent);
  const layoutContextDispatch = layoutDispatch();
  const { sidebarContentPanel, isOpen } = sidebarContentInput;

  if (!isOpen) return null;

  return (
    <SidebarContent
      contextDispatch={layoutContextDispatch}
      sidebarContentPanel={sidebarContentPanel}
      isSharedNotesPinned={isSharedNotesPinned}
    />
  );
};

export default SidebarContentContainer;
