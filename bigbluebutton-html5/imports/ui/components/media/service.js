import Presentations from '/imports/api/presentations';
import { isVideoBroadcasting } from '/imports/ui/components/screenshare/service';
import { getVideoUrl } from '/imports/ui/components/external-video-player/service';
import Settings from '/imports/ui/services/settings';
import getFromUserSettings from '/imports/ui/services/users-settings';
import { isExternalVideoEnabled, isScreenSharingEnabled } from '/imports/ui/services/features';
import { ACTIONS } from '../layout/enums';

const LAYOUT_CONFIG = Meteor.settings.public.layout;
const KURENTO_CONFIG = Meteor.settings.public.kurento;
const PRESENTATION_CONFIG = Meteor.settings.public.presentation;

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
  const { viewScreenshare } = Settings.dataSaving;
  return isScreenSharingEnabled() && viewScreenshare && isVideoBroadcasting();
}

function shouldShowExternalVideo() {
  return isExternalVideoEnabled() && getVideoUrl();
}

function shouldShowOverlay() {
  return getFromUserSettings('bbb_enable_video', KURENTO_CONFIG.enableVideo);
}

const swapLayout = {
  value: getFromUserSettings('bbb_auto_swap_layout', LAYOUT_CONFIG.autoSwapLayout),
  tracker: new Tracker.Dependency(),
};

const setSwapLayout = (layoutContextDispatch) => {
  const hidePresentation = getFromUserSettings('bbb_hide_presentation', LAYOUT_CONFIG.hidePresentation);

  swapLayout.value = getFromUserSettings('bbb_auto_swap_layout', LAYOUT_CONFIG.autoSwapLayout) || hidePresentation;
  swapLayout.tracker.changed();

  if (!hidePresentation) {
    layoutContextDispatch({
      type: ACTIONS.SET_PRESENTATION_IS_OPEN,
      value: !swapLayout.value,
    });
  }
};

const toggleSwapLayout = (layoutContextDispatch) => {
  window.dispatchEvent(new Event('togglePresentationHide'));
  swapLayout.value = !swapLayout.value;
  swapLayout.tracker.changed();

  layoutContextDispatch({
    type: ACTIONS.SET_PRESENTATION_IS_OPEN,
    value: !swapLayout.value,
  });
};

export const shouldEnableSwapLayout = () => {
  if (!PRESENTATION_CONFIG.oldMinimizeButton) {
    return true;
  }
  return !shouldShowScreenshare() && !shouldShowExternalVideo();
};

export const getSwapLayout = () => {
  swapLayout.tracker.depend();
  return swapLayout.value;
};

export default {
  getPresentationInfo,
  shouldShowWhiteboard,
  shouldShowScreenshare,
  shouldShowExternalVideo,
  shouldShowOverlay,
  isVideoBroadcasting,
  toggleSwapLayout,
  shouldEnableSwapLayout,
  getSwapLayout,
  setSwapLayout,
};
