import changeMuteMeeting from '../modifiers/changeMuteMeeting';

export default function handleMeetingMuted({ body }, meetingId) {
  changeMuteMeeting(meetingId, body);
}
