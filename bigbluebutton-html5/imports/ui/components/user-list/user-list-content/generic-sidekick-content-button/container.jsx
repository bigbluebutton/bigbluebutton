import React from 'react';
import GenericSidekickContentNavButton from './component';
import { layoutSelectInput, layoutDispatch } from '/imports/ui/components/layout/context';

const GenericSidekickContentNavButtonContainer = (props) => {
  const sidebarContent = layoutSelectInput((i) => i.sidebarContent);
  const { sidebarContentPanel } = sidebarContent;
  const layoutContextDispatch = layoutDispatch();

  return (
    <GenericSidekickContentNavButton {
    ...{
      layoutContextDispatch,
      sidebarContentPanel,
      ...props,
    }
    }
    />
  );
};

export default GenericSidekickContentNavButtonContainer;
