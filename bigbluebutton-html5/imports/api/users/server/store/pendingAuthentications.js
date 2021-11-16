import Logger from '/imports/startup/server/logger';

class PendingAuthentitcations {
  constructor() {
    Logger.debug('PendingAuthentitcations :: constructor');
    this.store = [];
  }

  generateKey(meetingId, userId, authToken) {
    // Protect against separator injection
    meetingId = meetingId.replace(/ /g, '');
    userId = userId.replace(/ /g, '');
    authToken = authToken.replace(/ /g, '');

    // Space separated key
    return `${meetingId} ${userId} ${authToken}`;
  }

  add(meetingId, userId, authToken, methodInvocationObject) {
    Logger.debug('PendingAuthentitcations :: add', { meetingId, userId, authToken });
    this.store.push({
      key: this.generateKey(meetingId, userId, authToken),
      meetingId,
      userId,
      authToken,
      methodInvocationObject,
    });
  }

  take(meetingId, userId, authToken) {
    const key = this.generateKey(meetingId, userId, authToken);
    Logger.debug('PendingAuthentitcations :: take', {
      key, meetingId, userId, authToken,
    });

    // find matches
    const matches = this.store.filter(e => e.key === key);
    // remove matches (if any)
    if (matches.length) {
      this.store = this.store.filter(e => e.key !== key);
    }

    // return matches
    return matches;
  }
}
export default new PendingAuthentitcations();
