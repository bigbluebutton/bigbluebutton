import React from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import { meetingIsBreakout } from '/imports/ui/components/app/service';
import Meetings from '/imports/api/meetings';
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
    getAvailableActions,
    normalizeEmojiName,
    isMeetingLocked,
    isPublicChat,
    setEmojiStatus,
    assignPresenter,
    kickUser,
    toggleVoice,
    changeRole,
    roving,
    } = props;

  return (
    <UserList
      users={users}
      meeting={meeting}
      currentUser={currentUser}
      openChats={openChats}
      openChat={openChat}
      isBreakoutRoom={isBreakoutRoom}
      setEmojiStatus={setEmojiStatus}
      assignPresenter={assignPresenter}
      kickUser={kickUser}
      toggleVoice={toggleVoice}
      changeRole={changeRole}
      userActions={userActions}
      getAvailableActions={getAvailableActions}
      normalizeEmojiName={normalizeEmojiName}
      isMeetingLocked={isMeetingLocked}
      isPublicChat={isPublicChat}
      roving={roving}
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
  getAvailableActions: Service.getAvailableActions,
  normalizeEmojiName: Service.normalizeEmojiName,
  isMeetingLocked: Service.isMeetingLocked,
  isPublicChat: Service.isPublicChat,
  setEmojiStatus: Service.setEmojiStatus,
  assignPresenter: Service.assignPresenter,
  kickUser: Service.kickUser,
  toggleVoice: Service.toggleVoice,
  changeRole: Service.changeRole,
  roving: Service.roving,
}), UserListContainer);
