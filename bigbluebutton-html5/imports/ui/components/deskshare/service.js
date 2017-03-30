import Deskshare from '/imports/api/deskshare';
import VertoAPI from '/imports/api/audio/client/bridge/verto';
import Auth from '/imports/ui/services/auth';

const vertoAPI = new VertoAPI();

// when the meeting information has been updated check to see if it was
// desksharing. If it has changed either trigger a call to receive video
// and display it, or end the call and hide the video
function videoIsBroadcasting() {
  const ds = Deskshare.findOne({});
  if (ds == null || !ds.broadcasting) {
    console.log('Deskshare broadcasting has ended');
    presenterDeskshareHasEnded();
    return false;
  }

  if (ds.broadcasting) {
    console.log('Deskshare is now broadcasting');
    if (ds.startedBy != Auth.userID) {
      console.log('deskshare wasn\'t initiated by me');
      presenterDeskshareHasStarted();
      return true;
    } else {
      presenterDeskshareHasEnded();
      return false;
    }
  }
}

// if remote deskshare has been ended disconnect and hide the video stream
function presenterDeskshareHasEnded() {
  // vertoAPI.exitVoiceCall();
};

// if remote deskshare has been started connect and display the video stream
function presenterDeskshareHasStarted() {
  vertoAPI.vertoWatchVideo();
};

export {
  videoIsBroadcasting, presenterDeskshareHasEnded, presenterDeskshareHasStarted
};
