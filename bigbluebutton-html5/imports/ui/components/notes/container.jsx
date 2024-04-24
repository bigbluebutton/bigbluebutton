import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Notes from './component';
import Service from './service';
import { layoutSelectInput, layoutDispatch, layoutSelectOutput } from '../layout/context';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import NotesContainerGraphql from './notes-graphql/component';
import { useSubscription } from '@apollo/client';
import { PINNED_PAD_SUBSCRIPTION } from './notes-graphql/queries';

const NOTES_CONFIG = window.meetingClientSettings.public.notes;

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

  const { data: pinnedPadData } = useSubscription(PINNED_PAD_SUBSCRIPTION);
  const shouldShowSharedNotesOnPresentationArea = !!pinnedPadData
    && pinnedPadData.sharedNotes[0]?.sharedNotesExtId === NOTES_CONFIG.id;

  return <Notes {...{
    layoutContextDispatch,
    isResizing,
    sidebarContent,
    sharedNotesOutput,
    amIPresenter,
    shouldShowSharedNotesOnPresentationArea,
    ...props
  }} />;
};

withTracker(() => {
  const hasPermission = Service.hasPermission();
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';
  return {
    hasPermission,
    isRTL,
    isGridEnabled: Session.get('isGridEnabled') || false,
  };
})(Container);

export default NotesContainerGraphql;
