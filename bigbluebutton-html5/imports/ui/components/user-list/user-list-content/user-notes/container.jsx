import React, { useContext } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import NoteService from '/imports/ui/components/note/service';
import lockContextContainer from '/imports/ui/components/lock-viewers/context/container';
import UserNotes from './component';
import LayoutContext from '../../../layout/context';

const UserNotesContainer = (props) => {
  const layoutContext = useContext(LayoutContext);
  const { layoutContextState, layoutContextDispatch } = layoutContext;
  const { input } = layoutContextState;
  const { sidebarContent } = input;
  const { sidebarContentPanel } = sidebarContent;
  return <UserNotes {...{ layoutContextDispatch, sidebarContentPanel, ...props }} />;
};

export default lockContextContainer(withTracker(({ userLocks }) => {
  const shouldDisableNote = userLocks.userNote;
  return {
    revs: NoteService.getRevs(),
    disableNote: shouldDisableNote,
  };
})(UserNotesContainer));
