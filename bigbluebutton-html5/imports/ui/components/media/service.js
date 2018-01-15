import Presentations from '/imports/api/presentations';
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
  return isVideoBroadcasting() && Meteor.settings.public.kurento.enableScreensharing;
}

function shouldShowOverlay() {
  return Meteor.settings.public.kurento.enableVideo;
}

export default {
  getPresentationInfo,
  shouldShowWhiteboard,
  shouldShowScreenshare,
  shouldShowOverlay,
};
