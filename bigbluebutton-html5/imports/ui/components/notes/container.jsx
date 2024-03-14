import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Notes from './component';
import Service from './service';
import MediaService from '/imports/ui/components/media/service';
import { layoutSelectInput, layoutDispatch, layoutSelectOutput } from '../layout/context';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';

const Container = ({ ...props }) => {
  const cameraDock = layoutSelectInput((i) => i.cameraDock);
  const sharedNotesOutput = layoutSelectOutput((i) => i.sharedNotes);
  const sidebarContent = layoutSelectInput((i) => i.sidebarContent);
  const { isResizing } = cameraDock;
  const layoutContextDispatch = layoutDispatch();
  const { data: currentUserData } = useCurrentUser((user) => ({
    presenter: user.presenter,
  }));
  const amIPresenter = currentUserData?.presenter;

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
    isGridEnabled: Session.get('isGridEnabled') || false,
  };
})(Container);
