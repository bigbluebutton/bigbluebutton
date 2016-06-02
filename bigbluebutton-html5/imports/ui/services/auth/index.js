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

export default {
  setCredentials,
  getCredentials,
  getMeeting,
  getUser,
  getToken,
};
