/* eslint prefer-promise-reject-errors: 0 */
import { Tracker } from 'meteor/tracker';

import Storage from '/imports/ui/services/storage/session';

import allowRedirectToLogoutURL from '/imports/ui/components/meeting-ended/service';
import logger from '/imports/startup/client/logger';
import { makeVar } from '@apollo/client';

const CONNECTION_TIMEOUT = window.meetingClientSettings.public.app.connectionTimeout;
class Auth {
  constructor() {
    this._loggedIn = {
      value: false,
      tracker: new Tracker.Dependency(),
    };

    const queryParams = new URLSearchParams(document.location.search);
    if (queryParams.has('sessionToken')
      && queryParams.get('sessionToken') !== Session.get('sessionToken')) {
      return;
    }


    this._meetingID = Storage.getItem('meetingID');
    this._userID = Storage.getItem('userID');
    this._authToken = Storage.getItem('authToken');
    this._sessionToken = makeVar(Storage.getItem('sessionToken'));
    this._logoutURL = Storage.getItem('logoutURL');
    this._confname = Storage.getItem('confname');
    this._externUserID = Storage.getItem('externUserID');
    this._fullname = Storage.getItem('fullname');
    this._connectionID = Storage.getItem('connectionID');
  }

  get meetingID() {
    return this._meetingID;
  }

  set meetingID(meetingID) {
    this._meetingID = meetingID;
    Storage.setItem('meetingID', this._meetingID);
  }

  set _connectionID(connectionId) {
    this._connectionID = connectionId;
    Storage.setItem('sessionToken', this._connectionID);
  }

  get sessionToken() {
    try {
      return this._sessionToken();
    } catch {
      return null;
    }
  }

  set sessionToken(sessionToken) {
    if (this._sessionToken) {
      this._sessionToken(sessionToken);
    } else {
      this._sessionToken = makeVar(sessionToken);
    }
    Storage.setItem('sessionToken', this._sessionToken());
  }

  get userID() {
    return this._userID;
  }

  set userID(userID) {
    this._userID = userID;
    Storage.setItem('userID', this._userID);
  }

  get token() {
    return this._authToken;
  }

  set token(authToken) {
    this._authToken = authToken;
    Storage.setItem('authToken', this._authToken);
  }

  set logoutURL(logoutURL) {
    this._logoutURL = logoutURL;
    Storage.setItem('logoutURL', this._logoutURL);
  }

  get logoutURL() {
    return this._logoutURL;
  }

  set confname(confname) {
    this._confname = confname;
    Storage.setItem('confname', this._confname);
  }

  get confname() {
    return this._confname;
  }

  set externUserID(externUserID) {
    this._externUserID = externUserID;
    Storage.setItem('externUserID', this._externUserID);
  }

  get externUserID() {
    return this._externUserID;
  }

  set fullname(fullname) {
    this._fullname = fullname;
    Storage.setItem('fullname', this._fullname);
  }

  get fullname() {
    return this._fullname;
  }

  get loggedIn() {
    this._loggedIn.tracker.depend();
    return this._loggedIn.value;
  }

  set loggedIn(value) {
    this._loggedIn.value = value;
    this._loggedIn.tracker.changed();
  }

  get credentials() {
    return {
      meetingId: this.meetingID,
      requesterUserId: this.userID,
      requesterToken: this.token,
      logoutURL: this.logoutURL,
      sessionToken: this.sessionToken,
      fullname: this.fullname,
      externUserID: this.externUserID,
      confname: this.confname,
    };
  }

  get fullInfo() {
    return {
      sessionToken: this.sessionToken,
      meetingId: this.meetingID,
      requesterUserId: this.userID,
      fullname: this.fullname,
      confname: this.confname,
      externUserID: this.externUserID,
      uniqueClientSession: this.uniqueClientSession,
    };
  }

  set(
    meetingId,
    requesterUserId,
    requesterToken,
    logoutURL,
    sessionToken,
    fullname,
    externUserID,
    confname,
  ) {
    this.meetingID = meetingId;
    this.userID = requesterUserId;
    this.token = requesterToken;
    this.logoutURL = logoutURL;
    this.sessionToken = sessionToken;
    this.fullname = fullname;
    this.externUserID = externUserID;
    this.confname = confname;
  }

  clearCredentials(...args) {
    this.meetingID = null;
    this.userID = null;
    this.token = null;
    this.loggedIn = false;
    this.logoutURL = null;
    this.sessionToken = null;
    this.fullname = null;
    this.externUserID = null;
    this.confname = null;
    this.uniqueClientSession = null;
    return Promise.resolve(...args);
  }

  logout() {
    if (!this.loggedIn) {
      if (allowRedirectToLogoutURL()) {
        return Promise.resolve(this._logoutURL);
      }
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      if (allowRedirectToLogoutURL()) {
        resolve(this._logoutURL);
      }

      // do not redirect
      resolve();
    });
  }

  authenticateURL(url) {
    let authURL = url;
    if (authURL.indexOf('sessionToken=') === -1) {
      if (authURL.indexOf('?') !== -1) {
        authURL = `${authURL}&sessionToken=${this.sessionToken}`;
      } else {
        authURL = `${authURL}?sessionToken=${this.sessionToken}`;
      }
    }
    return authURL;
  }
}

const AuthSingleton = new Auth();
export default AuthSingleton;
