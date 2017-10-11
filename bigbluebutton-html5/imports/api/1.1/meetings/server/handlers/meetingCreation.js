import { check } from 'meteor/check';
import addMeeting from '../modifiers/addMeeting';

export default function handleMeetingCreation({ body }) {
  const meeting = body.props;
  check(meeting, Object);

  return addMeeting(meeting);
}
