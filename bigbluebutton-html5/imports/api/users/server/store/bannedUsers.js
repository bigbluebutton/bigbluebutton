import {check} from 'meteor/check';
import Logger from '/imports/startup/server/logger';

class BannedUsers {
  constructor() {
    Logger.debug('BannedUsers :: Initializing');
    this.store = new Mongo.Collection('users-banned');

    if (Meteor.isServer) {
      // types of queries for the users:
      // 1. meetingId
      // 2. meetingId, userId
      this.store._ensureIndex({meetingId: 1, userId: 1});
    }
  }

  init(meetingId) {
    Logger.debug('BannedUsers :: init', {meetingId});

    // if (!this.store[meetingId]) this.store[meetingId] = new Set();
  }

  add(meetingId, externalId) {
    check(meetingId, String);
    check(externalId, String);

    Logger.debug('BannedUsers :: add', {meetingId, externalId});

    const selector = {
      meetingId,
      externalId,
    };

    const modifier = Object.assign( // TODO
      {meetingId},
      {externalId},
    );

    try {
      const insertedId = this.store.upsert(selector, modifier);

      if (insertedId) {
        Logger.info('BannedUsers :: Added to BannedUsers collection', {meetingId, externalId});
      }
    } catch (err) {
      Logger.error('BannedUsers :: Error on adding to BannedUsers collection', {meetingId, externalId, err});
    }
  }

  delete(meetingId) {
    check(meetingId, String);

    const selector = {
      meetingId,
    };

    try {
      this.store.remove(selector);
      Logger.info('BannedUsers :: Removed meeting', {meetingId});
    } catch (err) {
      Logger.error('BannedUsers :: Removing from collection', {err});
    }
  }

  has(meetingId, externalId) {
    check(meetingId, String);
    check(externalId, String);

    Logger.info('BannedUsers :: has', {meetingId, externalId});

    return this.store.findOne({meetingId, externalId});
  }
}

export default new BannedUsers();
