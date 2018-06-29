var inherits = require('inherits');
var OutMessage = require('../OutMessage');

module.exports = function(Constants) {
  function UserConnectedToGlobalAudio(voiceConf, userId, name) {
    UserConnectedToGlobalAudio.super_.call(this, Constants.GLOBAL_AUDIO_CONNECTED);

    this.payload = {};
    this.payload[Constants.VOICE_CONF] = voiceConf;
    this.payload[Constants.USERID] = userId;
    this.payload[Constants.NAME] = name;
  };

  inherits(UserConnectedToGlobalAudio, OutMessage);
  return UserConnectedToGlobalAudio;
}
