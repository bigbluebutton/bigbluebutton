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
  return getDisabledFeatures().indexOf('screensharing') === -1 && Meteor.settings.public.kurento.enableScreensharing;
}
