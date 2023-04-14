import handleMeetingCreation from './meetingCreation';

export default async function handleGetAllMeetings({ body }) {
  const result = await handleMeetingCreation({ body });
  return result;
}
