import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import JoinVideoOptions from './component';
import VideoMenuService from './service';

const JoinVideoOptionsContainer = props => (<JoinVideoOptions {...props} />);

export default withTracker((params) => {
  const isSharingVideo = VideoMenuService.isSharingVideo();
  return {
    isSharingVideo,
    handleJoinVideo: params.handleJoinVideo,
    handleCloseVideo: params.handleCloseVideo,
  };
})(JoinVideoOptionsContainer);
