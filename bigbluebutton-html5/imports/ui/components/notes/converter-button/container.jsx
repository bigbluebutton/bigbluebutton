import React, { useContext } from 'react';
import ConverterButton from './component';
import { UsersContext } from '/imports/ui/components/components-data/users-context/context';
import Auth from '/imports/ui/services/auth';

const ConverterButtonContainer = ({ ...props }) => {
  const usingUsersContext = useContext(UsersContext);
  const { users } = usingUsersContext;
  const amIPresenter = users[Auth.meetingID][Auth.userID].presenter;

  return <ConverterButton {...{ amIPresenter, ...props }} />;
};

export default ConverterButtonContainer;
