// @ts-nocheck
/* eslint-disable */
import React from 'react';
import { layoutSelectOutput } from '/imports/ui/components/layout/context';
import DropArea from './component';

const DropAreaContainer = () => {
  const dropZoneAreas = layoutSelectOutput((i) => i.dropZoneAreas);

  return (
    Object.keys(dropZoneAreas).map((objectKey) => (
      <DropArea dataTest={`dropArea-${objectKey}`} key={objectKey} id={objectKey} style={dropZoneAreas[objectKey]} />
    ))
  );
};

export default DropAreaContainer;
