import React from 'react';

const WebcamComponent = ({ cameraDockBounds }) => (
  <div
    style={{
      position: 'absolute',
      top: cameraDockBounds.top,
      left: cameraDockBounds.left,
      width: cameraDockBounds.width,
      height: cameraDockBounds.height,
      backgroundColor: 'red',
    }}
  >
    Round 2
  </div>
);

export default WebcamComponent;
