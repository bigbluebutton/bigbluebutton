import React from 'react';
import { layoutSelectOutput } from '../../layout/context';
import PresentationArea from './component';

const PresentationAreaContainer = ({ presentationIsOpen }) => {
  const presentation = layoutSelectOutput((i) => i.presentation);

  return <PresentationArea {...{ ...presentation, presentationIsOpen }} />;
};

export default PresentationAreaContainer;
