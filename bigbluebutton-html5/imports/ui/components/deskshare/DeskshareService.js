import {Deskshare} from '../../api/deskshare/deskshare';

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
    if (ds.startedBy != getInSession('userId')) {
      console.log('deskshare wasn\'t initiated by me');
      presenterDeskshareHasStarted();
      return true;
    } else {
      presenterDeskshareHasEnded();
      return false;
    }
  }
}

function watchDeskshare(event, options) {
  let extension = null;
  if (options.extension) {
    extension = options.extension;
  } else {
    extension = Meteor.Meetings.findOne().voiceConf;
  }

  const uName = Meteor.Users.findOne({ userId: getInSession('userId') }).user.name;
  conferenceUsername = 'FreeSWITCH User - ' + encodeURIComponent(uName);
  conferenceIdNumber = '1009';

  // vertoService.watchVideo();
}

// if remote deskshare has been ended disconnect and hide the video stream
function presenterDeskshareHasEnded() {
  // exitVoiceCall();
};

// if remote deskshare has been started connect and display the video stream
function presenterDeskshareHasStarted() {
  // const voiceBridge = Deskshare.findOne().deskshare.voice_bridge;
  // watchDeskshare({
  //   watchOnly: true
  //   extension: voiceBridge
  // });
};

export { videoIsBroadcasting, watchDeskshare, presenterDeskshareHasEnded,
  presenterDeskshareHasStarted
};
