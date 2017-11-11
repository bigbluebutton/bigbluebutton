import React from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import Users from '/imports/api/users';
import Auth from '/imports/ui/services/auth/index';
import JoinVideoOptions from './component';

const JoinVideoOptionsContainer = props => (<JoinVideoOptions {...props} />);

export default createContainer((params) => {
  const userId = Auth.userID;
  const user = Users.findOne({ userId: userId });

  const isSharingVideo = user.has_stream ? true : false;
 
  return {
    isSharingVideo,
    handleJoinVideo: params.handleJoinVideo,
    handleCloseVideo: params.handleCloseVideo,
  };
}, JoinVideoOptionsContainer);
