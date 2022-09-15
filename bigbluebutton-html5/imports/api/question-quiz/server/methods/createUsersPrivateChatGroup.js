import GroupChat from '/imports/api/group-chat';
import createGroupChat from '/imports/api/group-chat/server/methods/createGroupChat';
import Logger from '/imports/startup/server/logger';
import { extractCredentials } from '/imports/api/common/server/helpers';
import { check } from 'meteor/check';

export default function createUsersPrivateChatGroup(meetingViewers) {

  try {
    const { meetingId, requesterUserId } = extractCredentials(this.userId);

    check(meetingId, String);
    check(requesterUserId, String);
    check(meetingViewers, Array)
    
    meetingViewers.forEach((res) => {
      const receiverId = res.userId
      const receiver = {
          userId: receiverId
      }
      const hasPrivateChatBetweenUsers = GroupChat
          .findOne({ users: { $all: [receiverId, requesterUserId] } })
      if (!hasPrivateChatBetweenUsers) {
          createGroupChat(receiver, this.userId)
      }
    })
    return true
  } catch (err) {
    Logger.error(`Exception while invoking method createUsersPrivateChatGroup ${err.stack}`);
  }
}
