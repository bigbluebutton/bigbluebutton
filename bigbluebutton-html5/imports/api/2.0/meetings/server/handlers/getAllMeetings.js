import { inReplyToHTML5Client } from '/imports/api/common/server/helpers';
import handleMeetingCreation from './meetingCreation';

export default function handleGetAllMeetings({ envelope, body }) {
  if (!inReplyToHTML5Client(envelope)) {
    return;
  }

  return handleMeetingCreation({ body });
}
