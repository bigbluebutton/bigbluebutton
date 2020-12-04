import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import NoteService from '/imports/ui/components/note/service';
import Meetings from '/imports/api/meetings';
import Users from '/imports/api/users';
import Auth from '/imports/ui/services/auth';
import UserNotes from './component';

const ROLE_VIEWER = Meteor.settings.public.user.role_viewer;

const UserNotesContainer = props => <UserNotes {...props} />;

export default withTracker(() => {
  const Meeting = Meetings.findOne({ meetingId: Auth.meetingID },
    { fields: { 'lockSettingsProps.disableNote': 1 } });
  const isViewer = Users.findOne({ meetingId: Auth.meetingID, userId: Auth.userID }, {
    fields: {
      role: 1,
    },
  }).role === ROLE_VIEWER;
  const shouldDisableNote = (Meeting.lockSettingsProps.disableNote) && isViewer;

  return {
    isPanelOpened: NoteService.isPanelOpened(),
    revs: NoteService.getRevs(),
    disableNote: shouldDisableNote,
  };
})(UserNotesContainer);
