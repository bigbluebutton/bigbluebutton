import { Meteor } from 'meteor/meteor';

const Chat = new Mongo.Collection('chat');

if (Meteor.isServer) {
  // types of queries for the chat:
  // 1. meetingId, toUsername (publishers)
  // 2. meetingId, fromUserId (publishers)
  // 3. meetingId, toUserId (publishers)
  // 4. meetingId, fromTime, fromUserId, toUserId (addChat)
  // 5. meetingId (clearChat)
  // 6. meetingId, fromUserId, toUserId (clearSystemMessages)

  Chat._ensureIndex({ meetingId: 1, toUsername: 1 });
  Chat._ensureIndex({ meetingId: 1, fromUserId: 1 });
  Chat._ensureIndex({ meetingId: 1, toUserId: 1 });
}

export default Chat;
