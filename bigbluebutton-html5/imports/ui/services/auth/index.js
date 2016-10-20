import Storage from '/imports/ui/services/storage/session';
import { callServer } from '/imports/ui/services/api';

class Auth {
  constructor() {
    this._meetingID = Storage.getItem('meetingID');
    this._userID = Storage.getItem('userID');
    this._authToken = Storage.getItem('authToken');
    this._logoutURL = Storage.getItem('logoutURL');

    if (!this._logoutURL) {
      this._setLogOut();
    }
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

  setCredentials(meeting, user, token) {
    this.meetingID = meeting;
    this.userID = user;
    this.token = token;
  }

  getCredentials() {
    return {
      meetingId: this.meetingID,
      requesterUserId: this.userID,
      requesterToken: this.token,
    };
  }

  clearCredentials(callback) {
    this.meetingID = null;
    this.userID = null;
    this.token = null;

    if (typeof callback === 'function') {
      return callback();
    }
  };

  completeLogout() {
    let logoutURL = this.logoutURL;
    callServer('userLogout');

    this.clearCredentials(() => {
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
