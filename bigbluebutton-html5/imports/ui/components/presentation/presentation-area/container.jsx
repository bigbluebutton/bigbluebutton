import React, { useContext } from 'react';
import LayoutContext from '../../layout/context';
import PresentationArea from './component';

const PresentationAreaContainer = () => {
  const layoutManager = useContext(LayoutContext);
  const { layoutContextState } = layoutManager;
  const { output } = layoutContextState;
  const { presentation } = output;

  return <PresentationArea {...{ ...presentation }} />;
};

export default PresentationAreaContainer;
