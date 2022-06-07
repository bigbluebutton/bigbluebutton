import { Meteor } from 'meteor/meteor';
import Logger from '/imports/startup/server/logger';
import Note from '/imports/api/note';
import AuthTokenValidation, { ValidationStates } from '/imports/api/auth-token-validation';

function note() {
  const tokenValidation = AuthTokenValidation.findOne({ connectionId: this.connection.id });

  if (!tokenValidation || tokenValidation.validationStatus !== ValidationStates.VALIDATED) {
    Logger.warn(`Publishing Note was requested by unauth connection ${this.connection.id}`);
    return Note.find({ meetingId: '' });
  }

  const { meetingId, userId } = tokenValidation;

  Logger.info(`Publishing Note for ${meetingId} ${userId}`);

  const options = {
    fields: {
      noteId: 0,
      readOnlyNoteId: 0,
    },
  };

  return Note.find({ meetingId }, options);
}

function publish(...args) {
  const boundNote = note.bind(this);
  return boundNote(...args);
}

Meteor.publish('note', publish);
