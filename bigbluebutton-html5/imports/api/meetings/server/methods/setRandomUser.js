import { extractCredentials } from '/imports/api/common/server/helpers';
import updateRandomUser from '../modifiers/updateRandomUser';

export default function setRandomUser(userId) {
  const { meetingId, requesterUserId } = extractCredentials(this.userId);
  updateRandomUser(meetingId, userId, requesterUserId);
}
