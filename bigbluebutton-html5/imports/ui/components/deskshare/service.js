import Deskshare from '/imports/api/deskshare';
import {conferenceUsername, joinVertoAudio, watchVertoVideo} from '/imports/api/verto';
import Auth from '/imports/ui/services/auth';
import {getVoiceBridge} from '/imports/api/phone';
import {createVertoUserName} from '/imports/api/verto';

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
    if (ds.startedBy != Auth.getUser()) {
      console.log('deskshare wasn\'t initiated by me');
      presenterDeskshareHasStarted();
      return true;
    } else {
      presenterDeskshareHasEnded();
      return false;
    }
  }
}

function watchDeskshare(options) {
  const extension = options.extension || getVoiceBridge();
  const conferenceUsername = createVertoUserName();
  conferenceIdNumber = '1009';
  watchVertoVideo({ extension, conferenceUsername, conferenceIdNumber,
    watchOnly: true, });
}

// if remote deskshare has been ended disconnect and hide the video stream
function presenterDeskshareHasEnded() {
  // exitVoiceCall();
};

// if remote deskshare has been started connect and display the video stream
function presenterDeskshareHasStarted() {
  const voiceBridge = Deskshare.findOne().deskshare.voiceBridge;
  watchDeskshare({
    watchOnly: true,
    extension: voiceBridge,
  });
};

export {
  videoIsBroadcasting, presenterDeskshareHasEnded, presenterDeskshareHasStarted
};
