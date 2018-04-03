import Presentations from '/imports/api/presentations';
import { isVideoBroadcasting } from '/imports/ui/components/screenshare/service';
import Auth from '/imports/ui/services/auth';
import Users from '/imports/api/users';

const getPresentationInfo = () => {
  const currentPresentation = Presentations.findOne({
    current: true,
  });

  return {
    current_presentation: (currentPresentation != null),

  };
};

const isUserPresenter = () => Users.findOne({ userId: Auth.userID }).presenter;

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
  isUserPresenter,
  isVideoBroadcasting,
};
