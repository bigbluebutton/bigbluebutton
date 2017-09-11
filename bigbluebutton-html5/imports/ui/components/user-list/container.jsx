import React from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import { meetingIsBreakout } from '/imports/ui/components/app/service';
import { makeCall } from '/imports/ui/services/api';
import Meetings from '/imports/api/1.1/meetings';
import Service from './service';
import UserList from './component';

const UserListContainer = (props) => {
  const {
    users,
    currentUser,
    openChats,
    openChat,
    userActions,
    isBreakoutRoom,
    children,
    meeting,
    } = props;

  return (
    <UserList
      users={users}
      meeting={meeting}
      currentUser={currentUser}
      openChats={openChats}
      openChat={openChat}
      isBreakoutRoom={isBreakoutRoom}
      makeCall={makeCall}
      userActions={userActions}
    >
      {children}
    </UserList>
  );
};

export default createContainer(({ params }) => ({
  users: Service.getUsers(),
  meeting: Meetings.findOne({}),
  currentUser: Service.getCurrentUser(),
  openChats: Service.getOpenChats(params.chatID),
  openChat: params.chatID,
  userActions: Service.userActions,
  isBreakoutRoom: meetingIsBreakout(),
}), UserListContainer);
