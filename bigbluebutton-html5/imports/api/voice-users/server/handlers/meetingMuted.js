import changeMuteMeeting from '../modifiers/changeMuteMeeting';

export default async function handleMeetingMuted({ body }, meetingId) {
  await changeMuteMeeting(meetingId, body);
}
