import { Tracker } from 'meteor/tracker';

import Storage from '/imports/ui/services/storage/session';

import Users from '/imports/api/users';
import { callServer } from '/imports/ui/services/api';

class Auth {
  constructor() {
    this._meetingID = Storage.getItem('meetingID');
    this._userID = Storage.getItem('userID');
    this._authToken = Storage.getItem('authToken');
    this._logoutURL = Storage.getItem('logoutURL');
    this._loggedIn = {
      value: false,
      tracker: new Tracker.Dependency,
    };
  }

  get meetingID() {
    return this._meetingID;
  }

  set meetingID(meetingID) {
    this._meetingID = meetingID;
    Storage.setItem('meetingID', this._meetingID);
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

  get logoutURL() {
    return this._logoutURL;
  }

  set logoutURL(logoutURL) {
    this._logoutURL = logoutURL;
    Storage.setItem('logoutURL', this._logoutURL);
  }

  get loggedIn() {
    this._loggedIn.tracker.depend();
    return this._loggedIn.value;
  }

  set loggedIn(value) {
    this._loggedIn.value = value;
    this._loggedIn.tracker.changed();
  }

  authenticate(meetingID, userID, token) {
    if (arguments.length) {
      this.meetingID = meetingID;
      this.userID = userID;
      this.token = token;
    }

    return this._subscribeToCurrentUser()
      .then(this._addObserverToValidatedField.bind(this));
  }

  _subscribeToCurrentUser() {
    const credentials = this.getCredentials();

    return new Promise((resolve, reject) => {
      Tracker.autorun((c) => {
        setTimeout(() => {
          c.stop();
          reject('Authentication subscription timeout.');
        }, 2000);

        const subscription = Meteor.subscribe('current-user', credentials);
        if (!subscription.ready()) return;

        resolve(c);
      });
    });
  }

  _addObserverToValidatedField(prevComp) {
    return new Promise((resolve, reject) => {
      const validationTimeout = setTimeout(() => {
        this.clearCredentials();
        reject('Authentication timeout.');
      }, 2500);

      const didValidate = () => {
        this.loggedIn = true;
        clearTimeout(validationTimeout);
        prevComp.stop();
        resolve();
      };

      Tracker.autorun((c) => {
        const selector = { meetingId: this.meetingID, userId: this.userID };
        const query = Users.find(selector);

        if (query.count() && query.fetch()[0].validated) {
          c.stop();
          didValidate();
        }

        const handle = query.observeChanges({
          changed: (id, fields) => {
            if (id !== this.userID) return;

            if (fields.validated === true) {
              c.stop();
              didValidate();
            }

            if (fields.validated === false) {
              c.stop();
              this.clearCredentials();
              reject('Authentication failed.');
            }
          },
        });
      });

      const credentials = this.getCredentials();
      callServer('validateAuthToken', credentials);
    });
  }

  getCredentials() {
    return {
      meetingId: this.meetingID,
      requesterUserId: this.userID,
      requesterToken: this.token,
    };
  }

  clearCredentials() {
    this.meetingID = null;
    this.userID = null;
    this.token = null;
    this.loggedIn = false;

    return Promise.resolve();
  };

  completeLogout() {
    let logoutURL = this.logoutURL;
    callServer('userLogout');

    this.clearCredentials()
      .then(() => {
        document.location.href = logoutURL;
      });
  };

  _setLogOut() {
    let request;
    let handleLogoutUrlError;

    handleLogoutUrlError = function () {
      console.log('Error : could not find the logoutURL');
      this.logoutURL = document.location.hostname;
    };

    // obtain the logoutURL
    request = $.ajax({
      dataType: 'json',
      url: '/bigbluebutton/api/enter',
    });

    request.done(data => {
      if (data.response.logoutURL != null) {
        this.logoutURL = data.response.logoutURL;
      } else {
        return handleLogoutUrlError();
      }
    });

    return request.fail(() => handleLogoutUrlError());
  }
};

let AuthSingleton = new Auth();
export default AuthSingleton;
