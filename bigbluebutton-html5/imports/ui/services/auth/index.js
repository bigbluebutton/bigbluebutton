import Storage from '/imports/ui/services/storage';

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

export default {
  setCredentials,
  getCredentials,
  getMeeting,
  getUser,
  getToken,
};
