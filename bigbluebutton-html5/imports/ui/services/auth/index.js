import Storage from '/imports/ui/services/storage/session';
import { callServer } from '/imports/ui/services/api';

export const setCredentials = (meeting, user, token) => {
  Storage.setItem('meetingID', meeting);
  Storage.setItem('userID', user);
  Storage.setItem('authToken', token);
};

export const getCredentials = () => ({
  meetingId: Storage.getItem('meetingID'),
  requesterUserId: Storage.getItem('userID'),
  requesterToken: Storage.getItem('authToken'),
});

export const getMeeting = () => getCredentials().meetingId;

export const getUser = () => getCredentials().requesterUserId;

export const getToken = () => getCredentials().requesterToken;

export const clearCredentials = (callback)=> {
  Storage.setItem('meetingID', null);
  Storage.setItem('userID', null);
  Storage.setItem('authToken', null);
  Storage.setItem('logoutURL', null);

  if (callback != null) {
    return callback();
  }
};

export const setLogOut = () => {
  let request;
  let handleLogoutUrlError;

  handleLogoutUrlError = function () {
    console.log('Error : could not find the logoutURL');
    Storage.setItem('logoutURL', document.location.hostname);
  };

  // obtain the logoutURL
  request = $.ajax({
    dataType: 'json',
    url: '/bigbluebutton/api/enter',
  });

  request.done(data => {
    if (data.response.logoutURL != null) {
      Storage.setItem('logoutURL', data.response.logoutURL);
    } else {
      if (data.response.logoutUrl != null) {
        Storage.setItem('logoutURL', data.response.logoutUrl);
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
