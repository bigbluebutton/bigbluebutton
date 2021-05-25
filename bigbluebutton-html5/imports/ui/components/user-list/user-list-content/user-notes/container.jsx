import React, { useContext } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import NoteService from '/imports/ui/components/note/service';
import lockContextContainer from '/imports/ui/components/lock-viewers/context/container';
import UserNotes from './component';
import { NLayoutContext } from '../../../layout/context/context';

const UserNotesContainer = (props) => {
  const newLayoutContext = useContext(NLayoutContext);
  const { newLayoutContextState, newLayoutContextDispatch } = newLayoutContext;
  const { input } = newLayoutContextState;
  const { sidebarContent } = input;
  const { sidebarContentPanel } = sidebarContent;
  return <UserNotes {...{ newLayoutContextDispatch, sidebarContentPanel, ...props }} />;
};

export default lockContextContainer(withTracker(({ userLocks }) => {
  const shouldDisableNote = userLocks.userNote;
  return {
    revs: NoteService.getRevs(),
    disableNote: shouldDisableNote,
  };
})(UserNotesContainer));
