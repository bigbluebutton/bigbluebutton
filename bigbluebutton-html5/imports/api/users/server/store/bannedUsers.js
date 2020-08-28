import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';

class BannedUsers {
  constructor() {
    Logger.debug('BannedUsers :: Initializing');
    this.store = new Mongo.Collection('users-banned');

    if (Meteor.isServer) {
      // types of queries for the users:
      // 1. meetingId
      // 2. meetingId, userId
      this.store._ensureIndex({ meetingId: 1, userId: 1 });
    }
  }

  init(meetingId) {
    Logger.debug('BannedUsers :: init', meetingId);

    //if (!this.store[meetingId]) this.store[meetingId] = new Set();
  }

  add(meetingId, externalId) {

    check(meetingId, String);
    check(externalId, String);

    Logger.debug('BannedUsers :: add', { meetingId, externalId });

    const selector = {
      meetingId,
      externalId: externalId,
    };

    const modifier = Object.assign(
      { meetingId },
      { externalId: externalId },
    );

    const cb = (err, numChanged) => {
      if (err != null) {
        return Logger.error(`Adding { meetingId, externalId } to BannedUsers  collection`);
      }

      const { insertedId } = numChanged;
      if (insertedId) {
        return Logger.info(`Added { meetingId, externalId } to BannedUsers  collection`);
      }

      return Logger.info(`Upserted { meetingId, externalId } to BannedUsers  collection`);
    };

    return this.store.upsert(selector, modifier, cb);

  }

  delete(meetingId) {

    check(meetingId, String);

    const selector = {
        meetingId: meetingId
    };

    const cb = (err) => {
      if (err) {
        return Logger.error(`Removing BannedUsers from collection: ${err}`);
      }

      return Logger.info(`Removed BannedUsers meetingId=${meetingId}`);
    };

    return this.store.remove(selector, cb);

  }

  has(meetingId, externalId) {

    check(meetingId, String);
    check(externalId, String);
    
    Logger.info('BannedUsers :: has', { meetingId, externalId });

    return this.store.findOne({ meetingId: meetingId, externalId: externalId })

  }
}

export default new BannedUsers();
