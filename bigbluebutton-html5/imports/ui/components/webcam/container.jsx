import React, { useContext } from 'react';
import { NLayoutContext } from '../layout/context/context';
import WebcamComponent from './component';

const WebcamContainer = () => {
  const LayoutContext = useContext(NLayoutContext);
  const { newLayoutContextState } = LayoutContext;
  const { output } = newLayoutContextState;
  const { cameraDock } = output;
  return (
    <WebcamComponent
      cameraDockBounds={cameraDock}
    />
  );
};

export default WebcamContainer;
