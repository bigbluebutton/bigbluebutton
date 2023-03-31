import React, { useContext } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Notes from './component';
import Service from './service';
import Auth from '/imports/ui/services/auth';
import MediaService from '/imports/ui/components/media/service';
import { layoutSelectInput, layoutDispatch, layoutSelectOutput } from '../layout/context';
import { UsersContext } from '../components-data/users-context/context';

const Container = ({ ...props }) => {
  const cameraDock = layoutSelectInput((i) => i.cameraDock);
  const sharedNotesOutput = layoutSelectOutput((i) => i.sharedNotes);
  const sidebarContent = layoutSelectInput((i) => i.sidebarContent);
  const { isResizing } = cameraDock;
  const layoutContextDispatch = layoutDispatch();
  const usingUsersContext = useContext(UsersContext);
  const { users } = usingUsersContext;
  const amIPresenter = users[Auth.meetingID][Auth.userID].presenter;

  return <Notes {...{
    layoutContextDispatch,
    isResizing,
    sidebarContent,
    sharedNotesOutput,
    amIPresenter,
    ...props
  }} />;
};

export default withTracker(() => {
  const hasPermission = Service.hasPermission();
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';
  const shouldShowSharedNotesOnPresentationArea = MediaService.shouldShowSharedNotes();
  return {
    hasPermission,
    isRTL,
    shouldShowSharedNotesOnPresentationArea,
  };
})(Container);
