import Auth from '/imports/ui/services/auth';
import Meetings from '/imports/api/meetings';

export default function getFromMeetingSettings(setting, defaultValue) {
  const prop = Meetings.findOne(
    { meetingId: Auth.meetingID },
    { fields: { 'metadata': 1 } },
  ).metadata;
  const value = prop.metadata ? prop.metadata[setting] : undefined;

  return value || defaultValue;
}
