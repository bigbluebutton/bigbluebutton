import Presentations from '/imports/api/2.0/presentations';
import { isVideoBroadcasting } from '../deskshare/service';

const getPresentationInfo = () => {
  const currentPresentation = Presentations.findOne({
    current: true,
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
