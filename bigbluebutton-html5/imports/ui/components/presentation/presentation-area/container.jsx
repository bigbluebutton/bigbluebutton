import React from 'react';
import { LayoutContextFunc } from '../../layout/context';
import PresentationArea from './component';

const PresentationAreaContainer = () => {
  const { layoutContextSelector } = LayoutContextFunc;

  const presentation = layoutContextSelector.selectOutput((i) => i.presentation);

  return <PresentationArea {...{ ...presentation }} />;
};

export default PresentationAreaContainer;
