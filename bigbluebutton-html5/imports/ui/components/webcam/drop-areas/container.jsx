import React, { useContext } from 'react';
import LayoutContext from '../../layout/context';
import DropArea from './component';

const DropAreaContainer = () => {
  const layoutContext = useContext(LayoutContext);
  const { layoutContextState } = layoutContext;
  const { output } = layoutContextState;
  const { dropZoneAreas } = output;

  return (
    Object.keys(dropZoneAreas).map((objectKey) => (
      <DropArea key={objectKey} id={objectKey} style={dropZoneAreas[objectKey]} />
    ))
  );
};

export default DropAreaContainer;
