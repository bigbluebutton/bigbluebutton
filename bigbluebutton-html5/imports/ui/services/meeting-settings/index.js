import Auth from '/imports/ui/services/auth';
import Meetings from '/imports/api/meetings';

export default function getFromMeetingSettings(setting, defaultValue) {
  const meeting = Meetings.findOne(
    { meetingId: Auth.meetingID },
    { fields: { metadataProp: 1 } },
  );

  return meeting?.metadataProp?.metadata?.[setting] ?? defaultValue;
}
