import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import Note from '/imports/api/note';

function note(credentials) {
  const { meetingId, requesterUserId, requesterToken } = credentials;

  check(meetingId, String);
  check(requesterUserId, String);
  check(requesterToken, String);

  Logger.info(`Publishing note for ${meetingId} ${requesterUserId} ${requesterToken}`);

  return Note.find({ meetingId });
}

function publish(...args) {
  const boundNote = note.bind(this);
  return boundNote(...args);
}

Meteor.publish('note', publish);
