/* eslint prefer-promise-reject-errors: 0 */
import { Tracker } from 'meteor/tracker';

import Storage from '/imports/ui/services/storage/session';

import { initAnnotationsStreamListener } from '/imports/ui/components/whiteboard/service';
import allowRedirectToLogoutURL from '/imports/ui/components/meeting-ended/service';
import { initCursorStreamListener } from '/imports/ui/components/whiteboard/cursors/service';
import SubscriptionRegistry from '/imports/ui/services/subscription-registry/subscriptionRegistry';
import { ValidationStates } from '/imports/api/auth-token-validation';
import logger from '/imports/startup/client/logger';

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
    return this._sessionToken;
  }

  set sessionToken(sessionToken) {
    this._sessionToken = sessionToken;
    Storage.setItem('sessionToken', this._sessionToken);
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
    this.isAuthenticating = true;

    return this.validateAuthToken()
      .then(() => {
        this.loggedIn = true;
        this.uniqueClientSession = `${this.sessionToken}-${Math.random().toString(36).substring(6)}`;
      })
      .catch((err) => {
        logger.error(`Failed to validate token: ${err.description}`);
        Session.set('codeError', err.error);
        Session.set('errorMessageDescription', err.description);
      })
      .finally(() => {
        this.isAuthenticating = false;
      });
  }

  validateAuthToken() {
    return new Promise((resolve, reject) => {
      SubscriptionRegistry.createSubscription('current-user');
      const validationTimeout = setTimeout(() => {
        reject({
          error: 408,
          description: 'Authentication timeout',
        });
      }, CONNECTION_TIMEOUT);
      Meteor.callAsync('validateAuthToken', this.meetingID, this.userID, this.token, this.externUserID)
        .then((result) => {
          const authenticationTokenValidation = result;
          if (!authenticationTokenValidation) return;

          switch (authenticationTokenValidation.validationStatus) {
            case ValidationStates.INVALID:
              reject({ error: 403, description: authenticationTokenValidation.reason });
              break;
            case ValidationStates.VALIDATED:
              initCursorStreamListener();
              initAnnotationsStreamListener();
              clearTimeout(validationTimeout);
              this.connectionID = authenticationTokenValidation.connectionId;
              this.connectionAuthTime = new Date().getTime();
              Session.set('userWillAuth', false);
              setTimeout(() => resolve(true), 100);
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
