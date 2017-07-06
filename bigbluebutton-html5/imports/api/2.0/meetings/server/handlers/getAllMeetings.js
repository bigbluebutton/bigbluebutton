import handleMeetingCreation from './meetingCreation';

export default function handleGetAllMeetings({ body }) {
  return handleMeetingCreation({ body });
}
