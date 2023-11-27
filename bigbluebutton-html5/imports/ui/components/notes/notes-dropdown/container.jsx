import React, { useContext } from 'react';
import NotesDropdown from './component';
import { UsersContext } from '/imports/ui/components/components-data/users-context/context';
import Auth from '/imports/ui/services/auth';
import { layoutSelect } from '/imports/ui/components/layout/context';
import { useSubscription } from '@apollo/client';
import {
  PROCESSED_PRESENTATIONS_SUBSCRIPTION,
} from '/imports/ui/components/whiteboard/queries';

const NotesDropdownContainer = ({ ...props }) => {
  const usingUsersContext = useContext(UsersContext);
  const { users } = usingUsersContext;
  const amIPresenter = users[Auth.meetingID][Auth.userID].presenter;
  const isRTL = layoutSelect((i) => i.isRTL);

  const { data: presentationData } = useSubscription(PROCESSED_PRESENTATIONS_SUBSCRIPTION);
  const presentations = presentationData?.pres_presentation || [];

  return <NotesDropdown {...{ amIPresenter, isRTL, presentations, ...props }} />;
};

export default NotesDropdownContainer;
