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
