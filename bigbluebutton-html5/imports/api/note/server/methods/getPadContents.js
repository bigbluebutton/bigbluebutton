import RedisPubSub from '/imports/startup/server/redis';
import Note from '/imports/api/note';
import Users from '/imports/api/users';
import Meetings from '/imports/api/meetings';
import Logger from '/imports/startup/server/logger';
import { extractCredentials } from '/imports/api/common/server/helpers';
import { getNoteText, getNotePdf } from '/imports/api/common/server/etherpad';

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

export default function getPadContents() {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'ConvertAndUploadSharedNotesReqMsg';
  
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
        const sharedNotesData = getNotePdf(note.noteId)
        const payload = {
          sharedNotesData,
        }

        return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
      }
    }

    return null;

  } catch (err) {
      Logger.error(`Exception while invoking method getPdf ${err.stack}`);
  }
}
