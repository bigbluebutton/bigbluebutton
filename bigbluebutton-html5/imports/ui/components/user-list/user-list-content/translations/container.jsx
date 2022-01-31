import React from 'react';
import Translations from './component';
import { 
  layoutSelectInput, 
  layoutDispatch,
} from '/imports/ui/components/layout/context';

const TranslationsContainer = (props) => {
  const layoutContextDispatch = layoutDispatch();
  const sidebarContent = layoutSelectInput((i) => i.sidebarContent);
  const { sidebarContentPanel } = sidebarContent;

  return <Translations {...{ layoutContextDispatch, sidebarContentPanel, ...props }} />;
};

export default TranslationsContainer;
