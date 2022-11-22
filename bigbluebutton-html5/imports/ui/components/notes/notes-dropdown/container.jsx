import React, { useContext } from 'react';
import NotesDropdown from './component';
import { UsersContext } from '/imports/ui/components/components-data/users-context/context';
import Auth from '/imports/ui/services/auth';
import { layoutSelect } from '/imports/ui/components/layout/context';

const NotesDropdownContainer = ({ ...props }) => {
  const usingUsersContext = useContext(UsersContext);
  const { users } = usingUsersContext;
  const amIPresenter = users[Auth.meetingID][Auth.userID].presenter;
  const isRTL = layoutSelect((i) => i.isRTL);

  return <NotesDropdown {...{ amIPresenter, isRTL, ...props }} />;
};

export default NotesDropdownContainer;
