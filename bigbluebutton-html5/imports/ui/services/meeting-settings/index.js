import Auth from '/imports/ui/services/auth';
import Meetings from '/imports/ui/local-collections/meetings-collection/meetings';

export default function getFromMeetingSettings(setting, defaultValue) {
  const prop = Meetings.findOne(
    { meetingId: Auth.meetingID },
    { fields: { 'metadataProp': 1 } },
  ).metadataProp;
  const value = prop.metadata ? prop.metadata[setting] : undefined;

  return value || defaultValue;
}
