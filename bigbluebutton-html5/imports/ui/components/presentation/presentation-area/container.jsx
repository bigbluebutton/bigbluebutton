import React from 'react';
import { layoutSelectOutput } from '../../layout/context';
import PresentationArea from './component';

const PresentationAreaContainer = () => {
  const presentation = layoutSelectOutput((i) => i.presentation);

  return <PresentationArea {...{ ...presentation }} />;
};

export default PresentationAreaContainer;
