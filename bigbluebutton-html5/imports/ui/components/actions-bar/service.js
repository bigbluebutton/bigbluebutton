import Auth from '/imports/ui/services/auth';
import Users from '/imports/api/users';
import { makeCall } from '/imports/ui/services/api';
import { EMOJI_STATUSES } from '/imports/utils/statuses';
import Meetings from '/imports/api/meetings';

const recordSettings = () => Meetings.findOne({ meetingId: Auth.meetingID }).recordProp;

export default {
  isUserPresenter: () => Users.findOne({ userId: Auth.userID }).presenter,
  getEmoji: () => Users.findOne({ userId: Auth.userID }).emoji,
  setEmoji: status => makeCall('setEmojiStatus', Auth.userID, status),
  getEmojiList: () => EMOJI_STATUSES,
  isUserModerator: () => Users.findOne({ userId: Auth.userID }).moderator,
  recordSettingsList: () => recordSettings(),
  toggleRecording: () => makeCall('toggleRecording'),
};
