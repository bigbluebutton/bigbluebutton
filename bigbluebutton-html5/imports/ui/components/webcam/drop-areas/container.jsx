import React from 'react';
import { LayoutContextFunc } from '../../layout/context';
import DropArea from './component';

const DropAreaContainer = () => {
  const { layoutContextSelector } = LayoutContextFunc;

  const dropZoneAreas = layoutContextSelector.selectOutput((i) => i.dropZoneAreas);

  return (
    Object.keys(dropZoneAreas).map((objectKey) => (
      <DropArea key={objectKey} id={objectKey} style={dropZoneAreas[objectKey]} />
    ))
  );
};

export default DropAreaContainer;
