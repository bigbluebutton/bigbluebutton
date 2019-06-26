import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import NoteService from '/imports/ui/components/note/service';
import UserNotes from './component';

const UserNotesContainer = props => <UserNotes {...props} />;

export default withTracker(() => ({
  isPanelOpened: NoteService.isPanelOpened(),
  revs: NoteService.getRevs(),
}))(UserNotesContainer);
