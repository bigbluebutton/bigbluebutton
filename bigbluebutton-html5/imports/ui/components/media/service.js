import Presentations from '/imports/api/presentations';
import { isVideoBroadcasting } from '/imports/ui/components/screenshare/service';
import { getVideoId } from '/imports/ui/components/external-video-player/service';
import Auth from '/imports/ui/services/auth';
import Users from '/imports/api/users';
import Settings from '/imports/ui/services/settings';
import VideoService from '/imports/ui/components/video-provider/service';
import PollingService from '/imports/ui/components/polling/service';
import getFromUserSettings from '/imports/ui/services/users-settings';

const LAYOUT_CONFIG = Meteor.settings.public.layout;
const KURENTO_CONFIG = Meteor.settings.public.kurento;

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
  return isVideoBroadcasting() && getFromUserSettings('enableScreensharing', KURENTO_CONFIG.enableScreensharing);
}

function shouldShowExternalVideo() {
  return getVideoId() && Meteor.settings.public.app.enableExternalVideo;
}

function shouldShowOverlay() {
  return getFromUserSettings('enableVideo', KURENTO_CONFIG.enableVideo);
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
  const autoSwapLayout = getFromUserSettings('autoSwapLayout', LAYOUT_CONFIG.autoSwapLayout);
  return autoSwapLayout || (swapLayout.value && shouldEnableSwapLayout());
};

export default {
  getPresentationInfo,
  shouldShowWhiteboard,
  shouldShowScreenshare,
  shouldShowExternalVideo,
  shouldShowOverlay,
  isUserPresenter,
  isVideoBroadcasting,
  toggleSwapLayout,
  shouldEnableSwapLayout,
  getSwapLayout,
};
