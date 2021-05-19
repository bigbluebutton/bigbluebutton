import React from 'react';
import SidebarContent from './component';
import NewLayoutContext from '../layout/context/context';

const SidebarContentContainer = (props) => {
  const { newLayoutContextState, newLayoutContextDispatch } = props;
  const {
    output, input,
  } = newLayoutContextState;
  const { sidebarContent: sidebarContentInput } = input;
  const { sidebarContentPanel } = sidebarContentInput;
  const { sidebarContent } = output;

  if (sidebarContent.display === false) return null;

  return (
    <SidebarContent
      {...sidebarContent}
      contextDispatch={newLayoutContextDispatch}
      sidebarContentPanel={sidebarContentPanel}
    />
  );
};

export default NewLayoutContext.withConsumer(SidebarContentContainer);
