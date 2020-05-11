import { Meteor } from 'meteor/meteor';
import Logger from '/imports/startup/server/logger';
import Note from '/imports/api/note';
import { extractCredentials } from '/imports/api/common/server/helpers';

function note() {
  if (!this.userId) {
    return Note.find({ meetingId: '' });
  }
  const { meetingId, requesterUserId } = extractCredentials(this.userId);

  Logger.info(`Publishing note for ${meetingId} ${requesterUserId}`);

  return Note.find({ meetingId });
}

function publish(...args) {
  const boundNote = note.bind(this);
  return boundNote(...args);
}

Meteor.publish('note', publish);
