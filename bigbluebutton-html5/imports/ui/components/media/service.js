import Presentations from '/imports/api/presentations';
import Slides from '/imports/api/slides';
import {isVideoBroadcasting} from '../deskshare/service';

let getPresentationInfo = () => {
  let currentPresentation;
  currentPresentation = Presentations.findOne({
      'presentation.current': true,
    });

  return {
    current_presentation: (currentPresentation != null ? true : false),

  };
};

function shouldShowWhiteboard() {
  return true;
}

function shouldShowDeskshare() {
  return isVideoBroadcasting();
}

function shouldShowOverlay() {
}


export default {
  getPresentationInfo,
  shouldShowWhiteboard,
  shouldShowDeskshare,
  shouldShowOverlay,
};
