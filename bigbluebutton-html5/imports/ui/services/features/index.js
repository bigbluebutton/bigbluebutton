import Auth from '/imports/ui/services/auth';
import Meetings from '/imports/api/meetings';

export function getDisabledFeatures() {
  const selector = {
    meetingId: Auth.meetingID,
  };

  const meetingData = Meetings.findOne(selector, { fields: { 'meetingProp.disabledFeatures': 1 } });
  const disabledFeatures = ((meetingData || {}).meetingProp || {}).disabledFeatures || [];

  return disabledFeatures;
}

export function isScreenSharingEnabled() {
  return getDisabledFeatures().indexOf('screenshare') === -1 && Meteor.settings.public.kurento.enableScreensharing;
}

export function isLearningDashboardEnabled() {
  return getDisabledFeatures().indexOf('learningDashboard') === -1;
}

export function isPollingEnabled() {
  return getDisabledFeatures().indexOf('polls') === -1 && Meteor.settings.public.poll.enabled;
}

export function isExternalVideoEnabled() {
  return getDisabledFeatures().indexOf('externalVideos') === -1 && Meteor.settings.public.externalVideoPlayer.enabled;
}

export function isChatEnabled() {
  return getDisabledFeatures().indexOf('chat') === -1 && Meteor.settings.public.chat.enabled;
}

export function isSharedNotesEnabled() {
  return getDisabledFeatures().indexOf('sharedNotes') === -1 && Meteor.settings.public.notes.enabled;
}

export function isCaptionsEnabled() {
  return getDisabledFeatures().indexOf('captions') === -1 && Meteor.settings.public.captions.enabled;
}

export function isLiveTranscriptionEnabled() {
  return getDisabledFeatures().indexOf('liveTranscription') === -1 && Meteor.settings.public.app.audioCaptions.enabled;
}

export function isBreakoutRoomsEnabled() {
  return getDisabledFeatures().indexOf('breakoutRooms') === -1;
}

export function isLayoutsEnabled() {
  return getDisabledFeatures().indexOf('layouts') === -1;
}

export function isVirtualBackgroundsEnabled() {
  return getDisabledFeatures().indexOf('virtualBackgrounds') === -1 && Meteor.settings.public.virtualBackgrounds.enabled;
}

export function isCustomVirtualBackgroundsEnabled() {
  return getDisabledFeatures().indexOf('customVirtualBackgrounds') === -1;
}

export function isDownloadPresentationWithAnnotationsEnabled() {
  return getDisabledFeatures().indexOf('downloadPresentationWithAnnotations') === -1 && Meteor.settings.public.presentation.allowDownloadable;
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
  return getDisabledFeatures().indexOf('reactions') === -1;
}
