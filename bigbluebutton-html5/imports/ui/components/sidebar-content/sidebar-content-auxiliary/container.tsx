import React from 'react';
import SidebarContentAuxiliary from './component';
import { layoutSelectInput, layoutDispatch } from '/imports/ui/components/layout/context';
import { Input } from '/imports/ui/components/layout/layoutTypes';

const SidebarContentAuxiliaryContainer = () => {
  const sidebarContentAuxiliaryInput = layoutSelectInput((i: Input) => i.sidebarContentAuxiliary);
  const layoutContextDispatch = layoutDispatch();
  const { sidebarContentPanel } = sidebarContentAuxiliaryInput;

  if (!sidebarContentAuxiliaryInput.isOpen) return null;

  return (
    <SidebarContentAuxiliary
      contextDispatch={layoutContextDispatch}
      sidebarContentPanel={sidebarContentPanel}
      isSharedNotesPinned={false}
    />
  );
};

export default SidebarContentAuxiliaryContainer;
