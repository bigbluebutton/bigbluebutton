import React, { useContext } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import VideoList from '/imports/ui/components/video-provider/video-list/component';
import VideoService from '/imports/ui/components/video-provider/service';
import { NLayoutContext } from '../../layout/context/context';
import { WebcamDraggableContext } from '../../media/webcam-draggable-overlay/context';

const VideoListContainer = ({ children, ...props }) => {
  const newLayoutContext = useContext(NLayoutContext);
  const webcamDraggableContext = useContext(WebcamDraggableContext);
  const { webcamDraggableDispatch } = webcamDraggableContext;
  const { newLayoutContextState, newLayoutContextDispatch } = newLayoutContext;
  const { layoutLoaded, layoutType, output } = newLayoutContextState;
  const { cameraDock } = output;

  const { streams } = props;
  return (
    !streams.length
      ? null
      : (
        <VideoList {...{
          layoutLoaded,
          layoutType,
          cameraDock,
          webcamDraggableDispatch,
          newLayoutContextDispatch,
          ...props,
        }}
        >
          {children}
        </VideoList>
      )
  );
};

export default withTracker((props) => ({
  numberOfPages: VideoService.getNumberOfPages(),
  ...props,
}))(VideoListContainer);
