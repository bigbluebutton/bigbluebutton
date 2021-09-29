import React from 'react';
import PresentationPodsContainer from '../../presentation-pod/container';

const PresentationArea = ({
  width,
  height,
}) => {
  const presentationAreaSize = {
    presentationAreaWidth: width,
    presentationAreaHeight: height,
  };
  return (
    <PresentationPodsContainer {...{ presentationAreaSize }} />
  );
};

export default PresentationArea;
