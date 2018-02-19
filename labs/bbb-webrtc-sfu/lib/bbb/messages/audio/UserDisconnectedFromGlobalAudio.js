var inherits = require('inherits');
var OutMessage = require('../OutMessage');

module.exports = function(Constants) {
  function UserDisconnectedFromGlobalAudio(voiceConf, userId, name) {
    UserDisconnectedFromGlobalAudio.super_.call(this, Constants.GLOBAL_AUDIO_DISCONNECTED);

    this.payload = {};
    this.payload[Constants.VOICE_CONF] = voiceConf;
    this.payload[Constants.USERID] = userId;
    this.payload[Constants.NAME] = name;
  };

  inherits(UserDisconnectedFromGlobalAudio, OutMessage);
  return UserDisconnectedFromGlobalAudio;
}
