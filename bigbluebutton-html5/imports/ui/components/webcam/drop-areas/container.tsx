import React from 'react';
import { layoutSelectOutput } from '/imports/ui/components/layout/context';
import { Output } from '/imports/ui/components/layout/layoutTypes';
import DropArea from './component';

const DropAreaContainer = () => {
  const dropZoneAreas = layoutSelectOutput((i: Output) => i.dropZoneAreas);

  return (
    Object.keys(dropZoneAreas).map((objectKey) => (
      <DropArea
        dataTest={`dropArea-${objectKey}`}
        key={objectKey}
        id={objectKey}
        style={dropZoneAreas[objectKey]}
      />
    ))
  );
};

export default DropAreaContainer;
