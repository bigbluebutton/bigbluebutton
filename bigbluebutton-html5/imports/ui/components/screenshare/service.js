import Screenshare from '/imports/api/screenshare';
import VertoBridge from '/imports/api/screenshare/client/bridge';
import KurentoBridge from '/imports/api/screenshare/client/bridge';
import PresentationService from '/imports/ui/components/presentation/service';

// when the meeting information has been updated check to see if it was
// screensharing. If it has changed either trigger a call to receive video
// and display it, or end the call and hide the video
const isVideoBroadcasting = () => {
  const ds = Screenshare.findOne({});

  if (!ds) {
    return false;
  }

  // TODO commented out isPresenter to enable screen viewing to the presenter
  return ds.screenshare.stream; // && !PresentationService.isPresenter();
}

// if remote screenshare has been ended disconnect and hide the video stream
const presenterScreenshareHasEnded = () => {
  // references a function in the global namespace inside kurento-extension.js
  // that we load dynamically
  KurentoBridge.kurentoExitVideo();
}

// if remote screenshare has been started connect and display the video stream
const presenterScreenshareHasStarted = () => {
  // references a function in the global namespace inside kurento-extension.js
  // that we load dynamically
  //VertoBridge.vertoWatchVideo();
  KurentoBridge.kurentoWatchVideo();
}

const shareScreen = () => {
  KurentoBridge.kurentoShareScreen();
}

const unshareScreen = () => {
  console.log("Exiting screenshare");
  KurentoBridge.kurentoExitScreenShare();
}

export {
  isVideoBroadcasting, presenterScreenshareHasEnded, presenterScreenshareHasStarted, shareScreen, unshareScreen,
};
