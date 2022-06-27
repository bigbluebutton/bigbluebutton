import React from 'react';
import PresentationPodsContainer from '../../presentation-pod/container';

const PresentationArea = ({
  width,
  height,
  presentationIsOpen,
}) => {
  const presentationAreaSize = {
    presentationAreaWidth: width,
    presentationAreaHeight: height,
  };
  return (
    <PresentationPodsContainer {...{ presentationAreaSize, presentationIsOpen }} />
  );
};

export default PresentationArea;
