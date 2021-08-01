import React, { useContext } from 'react';
import { NLayoutContext } from '../../layout/context/context';
import DropArea from './component';

const DropAreaContainer = () => {
  const LayoutContext = useContext(NLayoutContext);
  const { newLayoutContextState } = LayoutContext;
  const { output } = newLayoutContextState;
  const { dropZoneAreas } = output;

  return (
    Object.keys(dropZoneAreas).map((objectKey) => (
      <DropArea key={objectKey} id={objectKey} style={dropZoneAreas[objectKey]} />
    ))
  );
};

export default DropAreaContainer;
