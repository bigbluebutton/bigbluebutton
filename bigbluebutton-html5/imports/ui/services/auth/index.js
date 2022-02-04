/* eslint prefer-promise-reject-errors: 0 */
import { Tracker } from 'meteor/tracker';

import Storage from '/imports/ui/services/storage/session';

import { makeCall } from '/imports/ui/services/api';
import { initAnnotationsStreamListener } from '/imports/ui/components/whiteboard/service';
import allowRedirectToLogoutURL from '/imports/ui/components/meeting-ended/service';
import { initCursorStreamListener } from '/imports/ui/components/cursor/service';
import AuthTokenValidation, { ValidationStates } from '/imports/api/auth-token-validation';

const CONNECTION_TIMEOUT = Meteor.settings.public.app.connectionTimeout;

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
    this._sessionToken = Storage.getItem('sessionToken');
    this._logoutURL = Storage.getItem('logoutURL');
    this._confname = Storage.getItem('confname');
    this._externUserID = Storage.getItem('externUserID');
    this._fullname = Storage.getItem('fullname');
  }

  get meetingID() {
    return this._meetingID;
  }

  set meetingID(meetingID) {
    this._meetingID = meetingID;
    Storage.setItem('meetingID', this._meetingID);
  }

  set sessionToken(sessionToken) {
    this._sessionToken = sessionToken;
    Storage.setItem('sessionToken', this._sessionToken);
  }

  get sessionToken() {
    return this._sessionToken;
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

  authenticate(force) {
    if (this.loggedIn && !force) {
      return Promise.resolve();
    }

    if (!(this.meetingID && this.userID && this.token)) {
      return Promise.reject({
        error: 401,
        description: Session.get('errorMessageDescription') ? Session.get('errorMessageDescription') : 'Authentication failed due to missing credentials',
      });
    }

    this.loggedIn = false;
    return this.validateAuthToken()
      .then(() => {
        this.loggedIn = true;
        this.uniqueClientSession = `${this.sessionToken}-${Math.random().toString(36).substring(6)}`;
      });
  }

  validateAuthToken() {
    return new Promise(async (resolve, reject) => {
      let computation = null;

      const validationTimeout = setTimeout(() => {
        computation.stop();
        reject({
          error: 408,
          description: 'Authentication timeout',
        });
      }, CONNECTION_TIMEOUT);

      makeCall('validateAuthToken', this.meetingID, this.userID, this.token, this.externUserID);

      const authTokenSubscription = Meteor.subscribe('auth-token-validation', { meetingId: this.meetingID, userId: this.userID });
      Meteor.subscribe('current-user');

      Tracker.autorun((c) => {
        computation = c;

        if (!authTokenSubscription.ready()) {
          return;
        }

        const selector = {
          connectionId: Meteor.connection._lastSessionId,
        };

        const authenticationTokenValidation = AuthTokenValidation.findOne(selector);

        if (!authenticationTokenValidation) return;

        switch (authenticationTokenValidation.validationStatus) {
          case ValidationStates.INVALID:
            c.stop();
            reject({ error: 403, description: authenticationTokenValidation.reason });
            break;
          case ValidationStates.VALIDATED:
            initCursorStreamListener();
            initAnnotationsStreamListener();
            c.stop();
            clearTimeout(validationTimeout);
            setTimeout(() => resolve(true), 100);
            break;
          case ValidationStates.VALIDATING:
            break;
          case ValidationStates.NOT_VALIDATED:
            break;
          default:
        }
      });
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
