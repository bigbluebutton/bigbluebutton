import React from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import JoinVideoOptions from './component';
import VideoMenuService from './service';

const JoinVideoOptionsContainer = props => (<JoinVideoOptions {...props} />);

export default createContainer((params) => {
  const isSharingVideo = VideoMenuService.isSharingVideo();
  return {
    isSharingVideo,
    handleJoinVideo: params.handleJoinVideo,
    handleCloseVideo: params.handleCloseVideo,
  };
}, JoinVideoOptionsContainer);
