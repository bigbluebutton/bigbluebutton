import Screenshare from '/imports/api/screenshare';
import KurentoBridge from '/imports/api/screenshare/client/bridge';
import BridgeService from '/imports/api/screenshare/client/bridge/service';
import Settings from '/imports/ui/services/settings';
import logger from '/imports/startup/client/logger';
import { tryGenerateIceCandidates } from '/imports/utils/safari-webrtc';
import { stopWatching } from '/imports/ui/components/external-video-player/service';
import Meetings from '/imports/api/meetings';
import Auth from '/imports/ui/services/auth';
import UserListService from '/imports/ui/components/user-list/service';
import AudioService from '/imports/ui/components/audio/service';

// when the meeting information has been updated check to see if it was
// screensharing. If it has changed either trigger a call to receive video
// and display it, or end the call and hide the video
const isVideoBroadcasting = () => {
  const screenshareEntry = Screenshare.findOne({ meetingId: Auth.meetingID },
    { fields: { 'screenshare.stream': 1 } });

  if (!screenshareEntry) {
    return false;
  }

  return !!screenshareEntry.screenshare.stream;
};

// if remote screenshare has been ended disconnect and hide the video stream
const presenterScreenshareHasEnded = () => {
  // references a function in the global namespace inside kurento-extension.js
  // that we load dynamically
  KurentoBridge.kurentoExitVideo();
};

const viewScreenshare = () => {
  const amIPresenter = UserListService.isUserPresenter(Auth.userID);
  if (!amIPresenter) {
    KurentoBridge.kurentoViewScreen();
  } else {
    KurentoBridge.kurentoViewLocalPreview();
  }
};

// if remote screenshare has been started connect and display the video stream
const presenterScreenshareHasStarted = () => {
  // WebRTC restrictions may need a capture device permission to release
  // useful ICE candidates on recvonly/no-gUM peers
  tryGenerateIceCandidates().then(() => {
    viewScreenshare();
  }).catch((error) => {
    logger.error({
      logCode: 'screenshare_no_valid_candidate_gum_failure',
      extraInfo: {
        errorName: error.name,
        errorMessage: error.message,
      },
    }, `Forced gUM to release additional ICE candidates failed due to ${error.name}.`);
    // The fallback gUM failed. Try it anyways and hope for the best.
    viewScreenshare();
  });
};

const shareScreen = (onFail) => {
  // stop external video share if running
  const meeting = Meetings.findOne({ meetingId: Auth.meetingID });
  if (meeting && meeting.externalVideoUrl) {
    stopWatching();
  }

  BridgeService.getScreenStream().then(stream => {
    KurentoBridge.kurentoShareScreen(onFail, stream);
  }).catch(onFail);
};

const screenShareEndAlert = () => AudioService
  .playAlertSound(`${Meteor.settings.public.app.cdn
    + Meteor.settings.public.app.basename}`
    + '/resources/sounds/ScreenshareOff.mp3');

const unshareScreen = () => {
  KurentoBridge.kurentoExitScreenShare();
  screenShareEndAlert();
};

const dataSavingSetting = () => Settings.dataSaving.viewScreenshare;

export {
  isVideoBroadcasting,
  presenterScreenshareHasEnded,
  presenterScreenshareHasStarted,
  shareScreen,
  screenShareEndAlert,
  unshareScreen,
  dataSavingSetting,
};
