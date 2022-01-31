import React from 'react';
import Translations from './component';
import { layoutDispatch } from '/imports/ui/components/layout/context';

const TranslationsContainer = (props) => {
  const layoutContextDispatch = layoutDispatch();

  return <Translations {...{ layoutContextDispatch, ...props }} />;
};

export default TranslationsContainer;
