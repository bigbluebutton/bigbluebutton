import { check } from 'meteor/check';

import removeUser from '../modifiers/removeUser';

/*{
  "envelope": {
    "name": "UserLeftVoiceConfToClientEvtMsg",
    "routing": {
      "msgType": "BROADCAST_TO_MEETING",
      "meetingId": "183f0bf3a0982a127bdb8161e0c44eb696b3e75c-1498049295768",
      "userId": "w_dteh79snr8s4"
    }
  },
  "core": {
    "header": {
      "name": "UserLeftVoiceConfToClientEvtMsg",
      "meetingId": "183f0bf3a0982a127bdb8161e0c44eb696b3e75c-1498049295768",
      "userId": "w_dteh79snr8s4"
    },
    "body": {
      "intId": "w_dteh79snr8s4",
      "voiceUserId": "w_dteh79snr8s4"
    }
  }
}*/
export default function handleRemoveUser({ header, body }) {
  const meetingId = header.meetingId;
  const userId = body.intId;

  check(meetingId, String);
  check(userId, String);

  return removeUser(meetingId, userId);
}
