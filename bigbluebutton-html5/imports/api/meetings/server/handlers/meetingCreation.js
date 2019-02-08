import { check } from 'meteor/check';
import addMeeting from '../modifiers/addMeeting';

export default function handleMeetingCreation({ body }) {
  const meeting = body.props;
  const durationInSecods = (meeting.durationProps.duration * 60);
  meeting.durationProps.timeRemaining = durationInSecods;
  check(meeting, Object);

  return addMeeting(meeting);
}
