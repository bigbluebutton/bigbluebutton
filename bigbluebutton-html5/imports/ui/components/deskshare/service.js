import Deskshare from '/imports/api/deskshare';
import {createVertoUserName, vertoWatchVideo} from '/imports/api/verto';
import Auth from '/imports/ui/services/auth';
import {getVoiceBridge} from '/imports/api/phone';

// when the meeting information has been updated check to see if it was
// desksharing. If it has changed either trigger a call to receive video
// and display it, or end the call and hide the video
function videoIsBroadcasting() {
  console.log("inside ds:: videoIsBroadcasting");
  const ds = Deskshare.findOne({});
  if (ds == null || !ds.broadcasting) {
    console.log('Deskshare broadcasting has ended');
    presenterDeskshareHasEnded();
    return false;
  } else {
    console.log("DS isnt empty");
  }

  if (ds.broadcasting) {
    console.log('Deskshare is now broadcasting');
    if (ds.startedBy != Auth.userID) {
      console.log('deskshare wasn\'t initiated by me');
      presenterDeskshareHasStarted();
      return true;
    } else {
      console.log("ending DS");
      presenterDeskshareHasEnded();
      return false;
    }
  } else {
    console.log("DS int broadcasting");
  }
}

// if remote deskshare has been ended disconnect and hide the video stream
function presenterDeskshareHasEnded() {
  // exitVoiceCall();
  console.log("presenterDeskshareHasEnded");
};

// if remote deskshare has been started connect and display the video stream
function presenterDeskshareHasStarted() {
  vertoWatchVideo();
  console.log("presenterDeskshareHasStarted");
};

export {
  videoIsBroadcasting, presenterDeskshareHasEnded, presenterDeskshareHasStarted
};

