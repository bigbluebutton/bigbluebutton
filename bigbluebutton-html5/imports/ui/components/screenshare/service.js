import Screenshare from '/imports/api/screenshare';
import KurentoBridge from '/imports/api/screenshare/client/bridge';
import Settings from '/imports/ui/services/settings';

// when the meeting information has been updated check to see if it was
// screensharing. If it has changed either trigger a call to receive video
// and display it, or end the call and hide the video
const isVideoBroadcasting = () => {
  const ds = Screenshare.findOne({});

  if (!ds) {
    return false;
  }

  return !!ds.screenshare.stream;
};

// if remote screenshare has been ended disconnect and hide the video stream
const presenterScreenshareHasEnded = () => {
  // references a function in the global namespace inside kurento-extension.js
  // that we load dynamically
  KurentoBridge.kurentoExitVideo();
};

// if remote screenshare has been started connect and display the video stream
const presenterScreenshareHasStarted = () => {
  // references a function in the global namespace inside kurento-extension.js
  // that we load dynamically
  KurentoBridge.kurentoWatchVideo();
};

const shareScreen = (onFail) => {
  KurentoBridge.kurentoShareScreen(onFail);
};

const screenShareEndAlert = () => new Audio(`${Meteor.settings.public.app.cdn + Meteor.settings.public.app.basename}/resources/sounds/ScreenshareOff.mp3`).play();

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
