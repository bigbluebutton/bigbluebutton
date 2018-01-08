import React from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import { meetingIsBreakout } from '/imports/ui/components/app/service';
import Meetings from '/imports/api/meetings';
import Service from './service';
import UserList from './component';

const propTypes = {
  openChats: PropTypes.arrayOf(String).isRequired,
  openChat: PropTypes.string.isRequired,
  users: PropTypes.arrayOf(Object).isRequired,
  currentUser: PropTypes.shape({}).isRequired,
  meeting: PropTypes.shape({}).isRequired,
  isBreakoutRoom: PropTypes.bool.isRequired,
  getAvailableActions: PropTypes.func.isRequired,
  normalizeEmojiName: PropTypes.func.isRequired,
  isMeetingLocked: PropTypes.func.isRequired,
  isPublicChat: PropTypes.func.isRequired,
  setEmojiStatus: PropTypes.func.isRequired,
  assignPresenter: PropTypes.func.isRequired,
  kickUser: PropTypes.func.isRequired,
  toggleVoice: PropTypes.func.isRequired,
  changeRole: PropTypes.func.isRequired,
  roving: PropTypes.func.isRequired,
  userActions: PropTypes.func.isRequired,
  children: PropTypes.Object,
};

const defaultProps = {
  children: {},
};

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

UserListContainer.propTypes = propTypes;
UserListContainer.defaultProps = defaultProps;

export default withTracker(({ params }) => ({
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
}))(UserListContainer);
