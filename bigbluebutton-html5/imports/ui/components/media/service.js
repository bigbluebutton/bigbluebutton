import { Session } from 'meteor/session';
import Presentations from '/imports/api/presentations';
import { isVideoBroadcasting } from '/imports/ui/components/screenshare/service';
import Auth from '/imports/ui/services/auth';
import Users from '/imports/api/users';
import Settings from '/imports/ui/services/settings';
import VideoService from '/imports/ui/components/video-provider/service';
import PollingService from '/imports/ui/components/polling/service';

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

const swapLayout = {
  value: false,
  tracker: new Tracker.Dependency(),
};

const toggleSwapLayout = () => {
  swapLayout.value = !swapLayout.value;
  swapLayout.tracker.changed();
};

export const shouldEnableSwapLayout = () => {
  const { viewParticipantsWebcams } = Settings.dataSaving;
  const usersVideo = VideoService.getAllUsersVideo();
  const poll = PollingService.mapPolls();

  return usersVideo.length > 0 // prevent swap without any webcams
  && viewParticipantsWebcams // prevent swap when dataSaving for webcams is enabled
  && !poll.pollExists; // prevent swap when there is a poll running
};

export const getSwapLayout = () => {
  swapLayout.tracker.depend();
  const metaAutoSwapLayout = Session.get('meta.html5autoswaplayout') || false;
  return metaAutoSwapLayout || (swapLayout.value && shouldEnableSwapLayout());
};

export default {
  getPresentationInfo,
  shouldShowWhiteboard,
  shouldShowScreenshare,
  shouldShowOverlay,
  isUserPresenter,
  isVideoBroadcasting,
  toggleSwapLayout,
  shouldEnableSwapLayout,
};
