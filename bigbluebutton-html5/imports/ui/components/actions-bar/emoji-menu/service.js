import Auth from '/imports/ui/services/auth/index.js';
import Users from '/imports/api/users';
import { callServer } from '/imports/ui/services/api/index.js';

let getEmojiData = () => {

  // Get userId and meetingId
  const credentials = Auth.getCredentials();
  const { requesterUserId: userId, meetingId } = credentials;

  let user = Users.findOne({
    meetingId,
    userId,
  });

  let userEmojiStatus = 'none';
  if (user != null && user.user != null) {
    userEmojiStatus = user.user.emoji_status;
  }

  return {
    userEmojiStatus,
    credentials,
  };
};

// Below doesn't even need to receieve credentials
const setEmoji = (toRaiseUserId, status) => {
  callServer('userSetEmoji', toRaiseUserId, status);
};

export default {
  getEmojiData,
  setEmoji,
};
