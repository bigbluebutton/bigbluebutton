import React from 'react';
import PresentationPodsContainer from '../../presentation-pod/container';

const PresentationArea = ({
  width,
  height,
  presentationIsOpen,
  darkTheme,
}) => {
  const presentationAreaSize = {
    presentationAreaWidth: width,
    presentationAreaHeight: height,
  };
  return (
    <PresentationPodsContainer {...{ presentationAreaSize, presentationIsOpen, darkTheme }} />
  );
};

export default PresentationArea;
