import Presentations from '/imports/api/2.0/presentations';
import { isVideoBroadcasting } from '/imports/ui/components/screenshare/service';

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

function shouldShowScreenshare() {
  return isVideoBroadcasting();
}

function shouldShowOverlay() {
  return false;
}

export default {
  getPresentationInfo,
  shouldShowWhiteboard,
  shouldShowScreenshare,
  shouldShowOverlay,
};
