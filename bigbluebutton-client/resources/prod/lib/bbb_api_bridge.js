/**
  BigBlueButton Flash <===>  Javascript API hooks.

**/

function joinVoiceConference() {
  console.log("Calling the swf file");
  
  // https://code.google.com/p/swfobject/wiki/api
  var obj = swfobject.getObjectById("BigBlueButton");
  if (obj) {
    obj.joinVoice(); 
  }
}

function userHasJoinedVoiceConference() {
  console.log("User has joined voice conference.");
}
