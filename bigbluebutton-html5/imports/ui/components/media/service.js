import Presentations from '/imports/api/presentations';
import Slides from '/imports/api/slides';
import { isVideoBroadcasting } from '../deskshare/service';

const getPresentationInfo = () => {
  let currentPresentation;
  currentPresentation = Presentations.findOne({
    'presentation.current': true,
  });

  return {
    current_presentation: (currentPresentation != null),

  };
};

function shouldShowWhiteboard() {
  return true;
}

function shouldShowDeskshare() {
  return isVideoBroadcasting();
}

function shouldShowOverlay() {
  return false;
}

export default {
  getPresentationInfo,
  shouldShowWhiteboard,
  shouldShowDeskshare,
  shouldShowOverlay,
};
