/**
  BigBlueButton Flash <===>  Javascript API hooks.

**/

// https://code.google.com/p/swfobject/wiki/api
var bbbSwfObj = swfobject.getObjectById("BigBlueButton");
  
function joinVoiceConference() {
  console.log("Calling the swf file");
  if (bbbSwfObj) {
    bbbSwfObj.joinVoice(); 
  }
}

function userHasJoinedVoiceConference() {
  console.log("User has joined voice conference.");
}


function shareVideoCamera() {
  console.log("Calling the swf file");
  if (bbbSwfObj) {
    obj.shareVideoCamera(); 
  }
}
