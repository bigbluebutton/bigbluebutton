import React, { useContext } from 'react';
import { NLayoutContext } from '../../layout/context/context';
import PresentationArea from './component';

const PresentationAreaContainer = () => {
  const NewLayoutManager = useContext(NLayoutContext);
  const { newLayoutContextState } = NewLayoutManager;
  const { output } = newLayoutContextState;
  const { presentation } = output;

  return <PresentationArea {...{ ...presentation }} />;
};

export default PresentationAreaContainer;
