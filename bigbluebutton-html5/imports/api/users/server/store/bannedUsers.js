import Logger from '/imports/startup/server/logger';

class BannedUsers {
  constructor() {
    Logger.debug('BannedUsers :: Initializing');
    this.store = {};
  }

  init(meetingId) {
    Logger.debug('BannedUsers :: init', { meetingId });

    if (!this.store[meetingId]) this.store[meetingId] = new Set();
  }

  add(meetingId, externalId) {
    Logger.debug('BannedUsers :: add', { meetingId, externalId });
    if (!this.store[meetingId]) this.store[meetingId] = new Set();

    this.store[meetingId].add(externalId);
  }

  delete(meetingId) {
    Logger.debug('BannedUsers :: delete', { meetingId });
    delete this.store[meetingId];
  }

  has(meetingId, externalId) {
    Logger.debug('BannedUsers :: has', { meetingId, externalId });
    if (!this.store[meetingId]) this.store[meetingId] = new Set();

    return this.store[meetingId].has(externalId);
  }
}

export default new BannedUsers();
