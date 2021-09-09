import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import NoteService from '/imports/ui/components/note/service';
import lockContextContainer from '/imports/ui/components/lock-viewers/context/container';
import UserNotes from './component';
import { LayoutContextFunc } from '../../../layout/context';

const UserNotesContainer = (props) => {
  const { layoutContextSelector } = LayoutContextFunc;

  const sidebarContent = layoutContextSelector.selectInput((i) => i.sidebarContent);
  const { sidebarContentPanel } = sidebarContent;
  const layoutContextDispatch = layoutContextSelector.layoutDispatch();
  return <UserNotes {...{ layoutContextDispatch, sidebarContentPanel, ...props }} />;
};

export default lockContextContainer(withTracker(({ userLocks }) => {
  const shouldDisableNote = userLocks.userNote;
  return {
    revs: NoteService.getRevs(),
    disableNote: shouldDisableNote,
  };
})(UserNotesContainer));
