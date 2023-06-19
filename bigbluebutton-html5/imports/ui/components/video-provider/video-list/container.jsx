import React, { useContext } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import VideoList from '/imports/ui/components/video-provider/video-list/component';
import VideoService from '/imports/ui/components/video-provider/service';
import { layoutSelect, layoutSelectOutput, layoutDispatch } from '../../layout/context';
import { UsersContext } from '/imports/ui/components/components-data/users-context/context';
import Auth from '/imports/ui/services/auth';
import Users from '/imports/api/users';

const VideoListContainer = ({ children, ...props }) => {
  const layoutType = layoutSelect((i) => i.layoutType);
  const cameraDock = layoutSelectOutput((i) => i.cameraDock);
  const layoutContextDispatch = layoutDispatch();
  const usingUsersContext = useContext(UsersContext);
  const { users: contextUsers } = usingUsersContext;
  const { streams, isGridEnabled } = props;

  const streamUsers = streams.map((stream) => stream.userId);

  const users = isGridEnabled && contextUsers
    ? Object.values(contextUsers[Auth.meetingID]).filter(
      (user) => !user.loggedOut && !user.left && !streamUsers.includes(user.userId)
    ) 
    : null;

  return (
    !streams.length && !isGridEnabled
      ? null
      : (
        <VideoList {...{
          layoutType,
          cameraDock,
          layoutContextDispatch,
          isGridEnabled,
          users,
          ...props,
        }}
        >
          {children}
        </VideoList>
      )
  );
};

export default withTracker((props) => {
  const { streams } = props;

  return {
    ...props,
    numberOfPages: VideoService.getNumberOfPages(),
    streams: streams.filter((stream) => Users.findOne({ userId: stream.userId },
      {
        fields: {
          userId: 1,
        },
      })),
  };
})(VideoListContainer);
