import React from 'react';
import PresentationPodsContainer from '../../presentation-pod/container';

const PresentationArea = ({
  top,
  left,
  width,
  height,
}) => {
  const presentationAreaSize = {
    presentationAreaWidth: width,
    presentationAreaHeight: height,
  };
  return (
    <div
      style={{
        top,
        left,
        width,
        height,
      }}
    >
      <PresentationPodsContainer {...{ presentationAreaSize }} />
    </div>
  );
};

export default PresentationArea;
