import React from 'react';
import { layoutSelectOutput } from '../../layout/context';
import PresentationArea from './component';

const PresentationAreaContainer = ({ presentationIsOpen, darkTheme }) => {
  const presentation = layoutSelectOutput((i) => i.presentation);

  return <PresentationArea {...{ ...presentation, presentationIsOpen, darkTheme }} />;
};

export default PresentationAreaContainer;
