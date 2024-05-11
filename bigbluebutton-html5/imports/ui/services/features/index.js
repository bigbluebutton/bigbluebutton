import Auth from '/imports/ui/services/auth';
import Meetings from '/imports/api/meetings';

export function getDisabledFeatures() {
  const selector = {
    meetingId: Auth.meetingID,
  };

  const meetingData = Meetings.findOne(selector, { fields: { disabledFeatures: 1 } });
  const disabledFeatures = (meetingData || {}).disabledFeatures || [];

  return disabledFeatures;
}

export function isScreenSharingEnabled() {
  return getDisabledFeatures().indexOf('screenshare') === -1 && window.meetingClientSettings.public.kurento.enableScreensharing;
}

export function isLearningDashboardEnabled() {
  return getDisabledFeatures().indexOf('learningDashboard') === -1;
}

export function isPollingEnabled() {
  return getDisabledFeatures().indexOf('polls') === -1 && window.meetingClientSettings.public.poll.enabled;
}

export function isExternalVideoEnabled() {
  return getDisabledFeatures().indexOf('externalVideos') === -1 && window.meetingClientSettings.public.externalVideoPlayer.enabled;
}

export function isChatEnabled() {
  return getDisabledFeatures().indexOf('chat') === -1 && window.meetingClientSettings.public.chat.enabled;
}

export function isSharedNotesEnabled() {
  return getDisabledFeatures().indexOf('sharedNotes') === -1 && window.meetingClientSettings.public.notes.enabled;
}

export function isCaptionsEnabled() {
  return getDisabledFeatures().indexOf('captions') === -1 && window.meetingClientSettings.public.captions.enabled;
}

export function isLiveTranscriptionEnabled() {
  return getDisabledFeatures().indexOf('liveTranscription') === -1 && window.meetingClientSettings.public.app.audioCaptions.enabled;
}

export function isBreakoutRoomsEnabled() {
  return getDisabledFeatures().indexOf('breakoutRooms') === -1;
}

export function isLayoutsEnabled() {
  return getDisabledFeatures().indexOf('layouts') === -1;
}

export function isVirtualBackgroundsEnabled() {
  return getDisabledFeatures().indexOf('virtualBackgrounds') === -1 && window.meetingClientSettings.public.virtualBackgrounds.enabled;
}

export function isCustomVirtualBackgroundsEnabled() {
  return getDisabledFeatures().indexOf('customVirtualBackgrounds') === -1;
}

export function isDownloadPresentationWithAnnotationsEnabled() {
  return getDisabledFeatures().indexOf('downloadPresentationWithAnnotations') === -1 && window.meetingClientSettings.public.presentation.allowDownloadWithAnnotations;
}

export function isDownloadPresentationConvertedToPdfEnabled() {
  return getDisabledFeatures().indexOf('downloadPresentationConvertedToPdf') === -1;
}

export function isDownloadPresentationOriginalFileEnabled() {
  return getDisabledFeatures().indexOf('downloadPresentationOriginalFile') === -1 && window.meetingClientSettings.public.presentation.allowDownloadOriginal;
}

export function isSnapshotOfCurrentSlideEnabled() {
  return getDisabledFeatures().indexOf('snapshotOfCurrentSlide') === -1 && window.meetingClientSettings.public.presentation.allowSnapshotOfCurrentSlide;
}

export function isImportPresentationWithAnnotationsFromBreakoutRoomsEnabled() {
  return getDisabledFeatures().indexOf('importPresentationWithAnnotationsFromBreakoutRooms') === -1;
}

export function isImportSharedNotesFromBreakoutRoomsEnabled() {
  return getDisabledFeatures().indexOf('importSharedNotesFromBreakoutRooms') === -1;
}

export function isPresentationEnabled() {
  return getDisabledFeatures().indexOf('presentation') === -1;
}

export function isReactionsEnabled() {
  const USER_REACTIONS_ENABLED = window.meetingClientSettings.public.userReaction.enabled;
  const REACTIONS_BUTTON_ENABLED = window.meetingClientSettings.public.app.reactionsButton.enabled;

  return getDisabledFeatures().indexOf('reactions') === -1 && USER_REACTIONS_ENABLED && REACTIONS_BUTTON_ENABLED;
}

export function isTimerFeatureEnabled() {
  return getDisabledFeatures().indexOf('timer') === -1 && window.meetingClientSettings.public.timer.enabled;
}

export function isCameraAsContentEnabled() {
  return (
    getDisabledFeatures().indexOf('cameraAsContent') === -1
    && window.meetingClientSettings.public.app.enableCameraAsContent
  );
}
