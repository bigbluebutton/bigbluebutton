import Storage from '/imports/ui/services/storage';

export const setCredentials = (meeting, user, token) => {
  Storage.set('meetingID', meeting);
  Storage.set('userID', user);
  Storage.set('authToken', token);
};

export const getCredentials = () => ({
  meetingId: Storage.get('meetingID'),
  requesterUserId: Storage.get('userID'),
  requesterToken: Storage.get('authToken'),
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

export default {
  setCredentials,
  getCredentials,
  getMeeting,
  getUser,
  getToken,
  clearCredentials,
  setLogOut,
};
