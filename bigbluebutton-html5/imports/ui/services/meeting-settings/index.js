import Auth from '/imports/ui/services/auth';
import Meetings from '/imports/api/meetings';

export default function getFromMeetingSettings(setting, defaultValue = null) {
  const prop = Meetings.findOne(
    { meetingId: Auth.meetingID },
    { fields: { 'metadataProp': 1 } },
  ).metadataProp;
  const value = prop.metadata ? prop.metadata[setting] : null;

  return value || defaultValue;
}
