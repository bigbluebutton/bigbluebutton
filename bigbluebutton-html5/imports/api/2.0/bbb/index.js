import AudioManager from '/imports/api/2.0/audio/client/manager';
import Auth from '/imports/ui/services/auth';
import Users from '/imports/api/2.0/users';
import Meetings from '/imports/api/2.0/meetings';

class BBB {

  getUserId() {
    const userID = Auth.userID;
    return userID;
  }

  getUsername() {
    return Users.findOne({ userId: this.getUserId() }).name;
  }

  getExtension() {
    const extension = Meetings.findOne().voiceProp.voiceConf;
    return extension;
  }

  getMyUserInfo(callback) {
    const result = {
      myUserID: this.getUserId(),
      myUsername: this.getUsername(),
      myInternalUserID: this.getUserId(),
      myAvatarURL: null,
      myRole: 'getMyRole',
      amIPresenter: 'false',
      voiceBridge: this.getExtension(),
      dialNumber: null,
    };
    return callback(result);
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
  if (window.BBB == undefined) {
    window.BBB = new BBB();
  }
};
