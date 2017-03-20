import Auth from '/imports/ui/services/auth/index.js';
import Users from '/imports/api/users';
import { callServer } from '/imports/ui/services/api/index.js';

let getEmojiData = () => {

  // Get userId and meetingId
  const credentials = Auth.credentials;
  const { requesterUserId: userId, meetingId } = credentials;

  // Find the Emoji Status of this specific meeting and userid
  const userEmojiStatus = Users.findOne({
    meetingId: Auth.meetingID,
    userId: Auth.userID,
  }).user.emoji_status;

  return {
    userEmojiStatus: userEmojiStatus,
    credentials: credentials,
  };
};

// Below doesn't even need to receieve credentials
const setEmoji = (toRaiseUserId, status) => {
  callServer('setEmojiStatus', toRaiseUserId, status);
};

export default {
  getEmojiData,
  setEmoji,
};
