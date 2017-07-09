import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import Meetings from '/imports/api/1.1/meetings';
import addMeeting from '../modifiers/addMeeting';
import removeMeeting from '../modifiers/removeMeeting';

export default function handleGetAllMeetings({ payload }) {
  let meetings = payload.meetings;

  check(meetings, Array);

  // We need to map the meetings payload because for some reason this payload
  // is different than the `meeting_created_message` one
  meetings = meetings.map(m => ({
    meeting_id: m.meetingID,
    name: m.meetingName,
    recorded: m.recorded,
    voice_conf: m.voiceBridge,
    duration: m.duration,
  }));

  const meetingsIds = meetings.map(m => m.meeting_id);

  const meetingsToRemove = Meetings.find({
    meetingId: { $nin: meetingsIds },
  }).fetch();

  meetingsToRemove.forEach(meeting => removeMeeting(meeting.meetingId));

  const meetingsAdded = [];
  meetings.forEach((meeting) => {
    meetingsAdded.push(addMeeting(meeting));
  });

  return meetingsAdded;
}
