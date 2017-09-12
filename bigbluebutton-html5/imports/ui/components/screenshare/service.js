import Screenshare from '/imports/api/2.0/screenshare';
//import VertoBridge from '/imports/api/2.0/screenshare/client/bridge';
import KurentoBridge from '/imports/api/2.0/screenshare/client/bridge';
import PresentationService from '/imports/ui/components/presentation/service';

// when the meeting information has been updated check to see if it was
// screensharing. If it has changed either trigger a call to receive video
// and display it, or end the call and hide the video
function isVideoBroadcasting() {
  const ds = Screenshare.findOne({});

  if (!ds) {
    return false;
  }

  return ds.screenshare.stream && !PresentationService.isPresenter();
}

// if remote screenshare has been ended disconnect and hide the video stream
function presenterScreenshareHasEnded() {
  // references a function in the global namespace inside kurento-extension.js
  // that we load dynamically
  //VertoBridge.vertoExitVideo();
  KurentoBridge.kurentoExitVideo();
}

// if remote screenshare has been started connect and display the video stream
function presenterScreenshareHasStarted() {
  // references a function in the global namespace inside kurento-extension.js
  // that we load dynamically
  //VertoBridge.vertoWatchVideo();
  KurentoBridge.kurentoWatchVideo();
}

const shareScreen = () => {
  KurentoBridge.kurentoShareScreen();
}

export {
  isVideoBroadcasting, presenterScreenshareHasEnded, presenterScreenshareHasStarted, shareScreen,
};
