import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import NoteService from '/imports/ui/components/note/service';
import lockContextContainer from '/imports/ui/components/lock-viewers/context/container';
import UserNotes from './component';

const UserNotesContainer = props => <UserNotes {...props} />;

export default lockContextContainer(withTracker(({ userLocks }) => {
  const shouldDisableNote = userLocks.userNote;
  return {
    isPanelOpened: NoteService.isPanelOpened(),
    revs: NoteService.getRevs(),
    disableNote: shouldDisableNote,
  };
})(UserNotesContainer));
