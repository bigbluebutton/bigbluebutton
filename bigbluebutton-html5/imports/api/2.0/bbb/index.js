import AudioManager from '/imports/api/2.0/audio/client/manager';
import Auth from '/imports/ui/services/auth';
import Users from '/imports/api/2.0/users';
import Meetings from '/imports/api/2.0/meetings';

class BBB {
  getUserId() {
    return Auth.userID;
  }

  getUsername() {
    return Users.findOne({ userId: this.getUserId() }).name;
  }

  getExtension() {
    return Meetings.findOne().voiceProp.voiceConf;
  }

  getMyRole() {
    return Users.findOne({ userId: this.getUserId() }).role;
  }

  amIPresenter() {
    return Users.findOne({ userId: this.getUserId() }).presenter;
  }

  getMyAvatarURL() {
    return Users.findOne({ userId: this.getUserId() }).avatar;
  }

  getMyUserInfo(callback) {
    return callback({
      myUserID: this.getUserId(),
      myUsername: this.getUsername(),
      myExternalUserID: this.getUserId(),
      myAvatarURL: this.getMyAvatarURL(),
      myRole: this.getMyRole(),
      amIPresenter: this.amIPresenter(),
      voiceBridge: this.getExtension(),
      dialNumber: null,
    });
  }

  webRTCCallFailed(inEchoTest, errorcode, cause) {
    AudioManager.webRTCCallFailed(inEchoTest, errorcode, cause);
  }

  webRTCCallStarted(inEchoTest) {
    AudioManager.webRTCCallStarted(inEchoTest);
  }

  getSessionToken(callback) {
    callback(Auth.sessionToken);
  }
}

export const initBBB = () => {
  if (!window.BBB) {
    window.BBB = new BBB();
  }
};
