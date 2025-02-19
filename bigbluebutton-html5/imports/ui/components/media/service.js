import getFromUserSettings from '/imports/ui/services/users-settings';
import { ACTIONS } from '../layout/enums';
import { debounce } from '/imports/utils/debounce';

function shouldShowWhiteboard() {
  return true;
}

function shouldShowOverlay() {
  const KURENTO_CONFIG = window.meetingClientSettings.public.kurento;
  return getFromUserSettings('bbb_enable_video', KURENTO_CONFIG.enableVideo);
}

const setPresentationIsOpen = debounce((layoutContextDispatch, value) => {
  layoutContextDispatch({
    type: ACTIONS.SET_PRESENTATION_IS_OPEN,
    value,
  });
}, 500, { leading: true, trailing: false });

const buildLayoutWhenPresentationAreaIsDisabled = (
  layoutContextDispatch,
  isSharingVideo,
  isSharedNotesPinned,
  isThereWebcam,
  isScreenSharingEnabled,
  isPresentationEnabled,
) => {
  const hasScreenshare = isScreenSharingEnabled;
  const isGeneralMediaOff = !hasScreenshare && !isSharedNotesPinned && !isSharingVideo;
  const webcamIsOnlyContent = isThereWebcam && isGeneralMediaOff;
  const isThereNoMedia = !isThereWebcam && isGeneralMediaOff;
  const isPresentationDisabled = !isPresentationEnabled;

  if (isPresentationDisabled && (webcamIsOnlyContent || isThereNoMedia)) {
    setPresentationIsOpen(layoutContextDispatch, false);
  }
};

export default {
  buildLayoutWhenPresentationAreaIsDisabled,
  shouldShowWhiteboard,
  shouldShowOverlay,
  setPresentationIsOpen,
};
