var inherits = require('inherits');
var OutMessage2x = require('../OutMessage2x');

// TODO: Check if this is correct!
module.exports = function(Constants) {
  function UserConnectedToGlobalAudio2x(voiceConf, userId, name) {
    UserConnectedToGlobalAudio2x.super_.call(
        this,
        Constants.GLOBAL_AUDIO_CONNECTED_2x,
        {voiceConf: voiceConf},
        {voiceConf: voiceConf}
    );

    this.core.body = {};
    this.core.body[Constants.USER_ID_2x] = userId;
    this.core.body[Constants.NAME] = name;
  };

  inherits(UserConnectedToGlobalAudio2x, OutMessage2x);
  return UserConnectedToGlobalAudio2x;
};
