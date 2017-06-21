import { check } from 'meteor/check';
import addUser from '../modifiers/addUser';

/*{
  "envelope": {
    "name": "UserJoinedMeetingEvtMsg",
    "routing": {
      "msgType": "BROADCAST_TO_MEETING",
      "meetingId": "183f0bf3a0982a127bdb8161e0c44eb696b3e75c-1498049295768",
      "userId": "w_sbqdhyjw7a2w"
    }
  },
  "core": {
    "header": {
      "name": "UserJoinedMeetingEvtMsg",
      "meetingId": "183f0bf3a0982a127bdb8161e0c44eb696b3e75c-1498049295768",
      "userId": "w_sbqdhyjw7a2w"
    },
    "body": {
      "intId": "w_sbqdhyjw7a2w",
      "extId": "w_sbqdhyjw7a2w",
      "name": "user2",
      "role": "MODERATOR",
      "guest": false,
      "authed": false,
      "waitingForAcceptance": false,
      "emoji": "none",
      "presenter": false,
      "locked": false,
      "avatar": "http://10.30.10.214/client/avatar.png"
    }
  }
}*/
export default function handleUserJoined({ header, body }) {
  const meetingId = header.meetingId;
  const user = body;
  
  check(meetingId, String);
  check(user, Object);

  return addUser(meetingId, user);
}
