import React, { useContext } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import VideoList from '/imports/ui/components/video-provider/video-list/component';
import VideoService from '/imports/ui/components/video-provider/service';
import LayoutContext from '../../layout/context';

const VideoListContainer = ({ children, ...props }) => {
  const layoutContext = useContext(LayoutContext);
  const { layoutContextState, layoutContextDispatch } = layoutContext;
  const { layoutType, output } = layoutContextState;
  const { cameraDock } = output;

  const { streams } = props;
  return (
    !streams.length
      ? null
      : (
        <VideoList {...{
          layoutType,
          cameraDock,
          layoutContextDispatch,
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
