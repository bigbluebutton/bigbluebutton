import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import VideoList from '/imports/ui/components/video-provider/video-list/component';
import VideoService from '/imports/ui/components/video-provider/service';
import { LayoutContextFunc } from '../../layout/context';

const VideoListContainer = ({ children, ...props }) => {
  const { layoutContextSelector } = LayoutContextFunc;

  const layoutType = layoutContextSelector.select((i) => i.layoutType);
  const cameraDock = layoutContextSelector.selectOutput((i) => i.cameraDock);
  const layoutContextDispatch = layoutContextSelector.layoutDispatch();

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
