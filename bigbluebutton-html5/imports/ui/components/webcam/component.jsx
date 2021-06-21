import React from 'react';
import VideoProviderContainer from '/imports/ui/components/video-provider/container';

const WebcamComponent = ({
  cameraDockBounds,
  swapLayout,
}) => (
  <div
    style={{
      position: 'absolute',
      top: cameraDockBounds.top,
      left: cameraDockBounds.left,
      width: cameraDockBounds.width,
      height: cameraDockBounds.height,
    }}
  >
    <VideoProviderContainer
      {...{
        swapLayout,
        cameraDockBounds,
      }}
    />
  </div>
);

export default WebcamComponent;
