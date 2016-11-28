import Users from '/imports/api/users';

// when new lock settings including disableMic are set,
// all viewers that are in the audio bridge with a mic should be muted and locked
export default function handleLockingMic(meetingId, newSettings) {
  // send mute requests for the viewer users joined with mic
  let userObject;
  let results = [];
  const userObjects = Users.find({
    meetingId: meetingId,
    'user.role': 'VIEWER',
    'user.listenOnly': false,
    'user.locked': true,
    'user.voiceUser.joined': true,
    'user.voiceUser.muted': false,
  }).fetch();
  const _userObjectsLength = userObjects.length;

  for (let i = 0; i < _userObjectsLength; i++) {
    userObject = userObjects[i];
    results.push(Meteor.call('muteUser', meetingId, userObject.userId, userObject.userId,
        userObject.authToken, true)); //true for muted
  }

  return results;
};
