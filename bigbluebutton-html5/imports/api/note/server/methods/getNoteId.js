import Note from '/imports/api/note';
import Users from '/imports/api/users';
import Meetings from '/imports/api/meetings';
import { extractCredentials } from '/imports/api/common/server/helpers';

const ROLE_VIEWER = Meteor.settings.public.user.role_viewer;

const hasNoteAccess = (meetingId, userId) => {
  const user = Users.findOne(
    { meetingId, userId },
    {
      fields: {
        role: 1,
        locked: 1,
      },
    }
  );

  if (!user) return false;

  if (user.role === ROLE_VIEWER && user.locked) {
    const meeting = Meetings.findOne(
      { meetingId },
      { fields: { 'lockSettingsProps.disableNote': 1 } }
    );

    if (!meeting) return false;

    const { lockSettingsProps } = meeting;
    if (lockSettingsProps) {
      if (lockSettingsProps.disableNote) return false;
    } else {
      return false;
    }
  }

  return true;
};

export default function getNoteId() {
  try {
    const { meetingId, requesterUserId } = extractCredentials(this.userId);

    const note = Note.findOne(
      { meetingId },
      {
        fields: {
          noteId: 1,
          readOnlyNoteId: 1,
        },
      }
    );

    if (note) {
      if (hasNoteAccess(meetingId, requesterUserId)) {
        return note.noteId;
      }
      return note.readOnlyNoteId;
    }

    return null;
  } catch (err) {
    return null;
  }
}
