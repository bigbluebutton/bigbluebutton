import Storage from '/imports/ui/services/storage';
import { callServer } from '/imports/ui/services/api';

export const setCredentials = (meeting, user, token) => {
  Storage.setSession('meetingID', meeting);
  Storage.setSession('userID', user);
  Storage.setSession('authToken', token);
};

export const getCredentials = () => ({
  meetingId: Storage.getSession('meetingID'),
  requesterUserId: Storage.getSession('userID'),
  requesterToken: Storage.getSession('authToken'),
});

export const getMeeting = () => getCredentials().meetingId;

export const getUser = () => getCredentials().requesterUserId;

export const getToken = () => getCredentials().requesterToken;

export const clearCredentials = (callback)=> {
  Storage.set('meetingID', null);
  Storage.set('userID', null);
  Storage.set('authToken', null);
  Storage.set('logoutURL', null);

  if (callback != null) {
    return callback();
  }
};

export const setLogOut = () => {
  let request;
  let handleLogoutUrlError;

  handleLogoutUrlError = function () {
    console.log('Error : could not find the logoutURL');
    Storage.set('logoutURL', document.location.hostname);
  };

  // obtain the logoutURL
  request = $.ajax({
    dataType: 'json',
    url: '/bigbluebutton/api/enter',
  });

  request.done(data => {
    if (data.response.logoutURL != null) {
      Storage.set('logoutURL', data.response.logoutURL);
    } else {
      if (data.response.logoutUrl != null) {
        Storage.set('logoutURL', data.response.logoutUrl);
      } else {
        return handleLogoutUrlError();
      }
    }
  });

  return request.fail(function (data, textStatus, errorThrown) {
    return handleLogoutUrlError();
  });
};

export const completeLogout = () => {
  let logoutURL = Storage.get('logoutURL');
  callServer('userLogout');
  clearCredentials(() => {
    document.location.href = logoutURL;
  });
};

export default {
  setCredentials,
  getCredentials,
  getMeeting,
  getUser,
  getToken,
  clearCredentials,
  setLogOut,
  completeLogout,
};
