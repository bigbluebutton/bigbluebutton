import Deskshare from '/imports/api/deskshare';
import Users from '/imports/api/users';
import Meetings from '/imports/api/meetings';
import {joinVertoAudio, watchVertoVideo} from '/imports/api/verto';
import {getInStorage} from '/imports/ui/components/app/service';

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
    if (ds.startedBy != getInStorage('userID')) {
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
  let extension = null;
  if (options.extension) {
    extension = options.extension;
  } else {
    extension = Meetings.findOne().voiceConf;
  }

  const uid = getInStorage('userID');
  const uName = Users.findOne({ userId: uid }).user.name;
  conferenceUsername = 'FreeSWITCH User - ' + encodeURIComponent(uName);
  conferenceIdNumber = '1009';
  watchVertoVideo({ extension, conferenceUsername, conferenceIdNumber,
    watchOnly: true });
}

// if remote deskshare has been ended disconnect and hide the video stream
function presenterDeskshareHasEnded() {
  // exitVoiceCall();
};

// if remote deskshare has been started connect and display the video stream
function presenterDeskshareHasStarted() {
  const voiceBridge = Deskshare.findOne().deskshare.voiceBridge;
  // const voiceBridge = '3500';
  watchDeskshare({
    watchOnly: true,
    extension: voiceBridge,
  });
};

export { videoIsBroadcasting, watchDeskshare, presenterDeskshareHasEnded,
  presenterDeskshareHasStarted
};
