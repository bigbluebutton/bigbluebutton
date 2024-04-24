import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import NotesService from '/imports/ui/components/notes/service';
import lockContextContainer from '/imports/ui/components/lock-viewers/context/container';
import { useSubscription } from '@apollo/client';
import UserNotes from './component';
import { layoutSelectInput, layoutDispatch } from '../../../layout/context';
import UserNotesContainerGraphql from '../../user-list-graphql/user-list-content/user-notes/component';
import { PINNED_PAD_SUBSCRIPTION } from '../../../notes/notes-graphql/queries';

const NOTES_CONFIG = window.meetingClientSettings.public.notes;

const UserNotesContainer = (props) => {
  const sidebarContent = layoutSelectInput((i) => i.sidebarContent);
  const { sidebarContentPanel } = sidebarContent;
  const layoutContextDispatch = layoutDispatch();
  const { data: pinnedPadData } = useSubscription(PINNED_PAD_SUBSCRIPTION);
  const isPinned = !!pinnedPadData
    && pinnedPadData.sharedNotes[0]?.sharedNotesExtId === NOTES_CONFIG.id;
  return <UserNotes {...{ isPinned, layoutContextDispatch, sidebarContentPanel, ...props }} />;
};

lockContextContainer(withTracker(({ userLocks }) => {
  const shouldDisableNotes = userLocks.userNotes;
  return {
    unread: NotesService.hasUnreadNotes(),
    disableNotes: shouldDisableNotes,
  };
})(UserNotesContainer));

export default UserNotesContainerGraphql;
