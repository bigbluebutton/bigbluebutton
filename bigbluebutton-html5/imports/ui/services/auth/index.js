/* eslint prefer-promise-reject-errors: 0 */
import { Tracker } from 'meteor/tracker';

import Storage from '/imports/ui/services/storage/session';

import Users from '/imports/api/users';
import logger from '/imports/startup/client/logger';
import { makeCall } from '/imports/ui/services/api';
import { initAnnotationsStreamListener } from '/imports/ui/components/whiteboard/service';
import allowRedirectToLogoutURL from '/imports/ui/components/meeting-ended/service';
import { initCursorStreamListener } from '/imports/ui/components/cursor/service';

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

      const result = await makeCall('validateAuthToken', this.meetingID, this.userID, this.token, this.externUserID);

      if (result && result.invalid) {
        clearTimeout(validationTimeout);
        reject({
          error: 403,
          description: result.reason,
          type: result.error_type,
        });
        return;
      }

      Meteor.subscribe('current-user');

      Tracker.autorun((c) => {
        computation = c;

        const selector = { meetingId: this.meetingID, userId: this.userID };
        const fields = {
          intId: 1, ejected: 1, validated: 1, connectionStatus: 1, userId: 1,
        };
        const User = Users.findOne(selector, { fields });
        // Skip in case the user is not in the collection yet or is a dummy user
        if (!User || !('intId' in User)) {
          logger.info({ logCode: 'auth_service_resend_validateauthtoken' }, 're-send validateAuthToken for delayed authentication');
          makeCall('validateAuthToken', this.meetingID, this.userID, this.token);

          return;
        }

        if (User.ejected) {
          computation.stop();
          reject({
            error: 403,
            description: 'User has been ejected.',
          });
          return;
        }

        if (User.validated === true && User.connectionStatus === 'online') {
          logger.info({ logCode: 'auth_service_init_streamers', extraInfo: { userId: User.userId } }, 'Calling init streamers functions');
          initCursorStreamListener();
          initAnnotationsStreamListener();
          computation.stop();
          clearTimeout(validationTimeout);
          // setTimeout to prevent race-conditions with subscription
          setTimeout(() => resolve(true), 100);
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
