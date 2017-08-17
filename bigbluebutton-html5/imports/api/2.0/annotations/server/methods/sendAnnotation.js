import RedisPubSub from '/imports/startup/server/redis2x';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
// import { isAllowedTo } from '/imports/startup/server/userPermissions';
import Logger from '/imports/startup/server/logger';

export default function sendAnnotation(credentials, payload) {
  const REDIS_CONFIG = Meteor.settings.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'SendWhiteboardAnnotationPubMsg';

  const { meetingId, requesterUserId, requesterToken } = credentials;

  check(meetingId, String);
  check(requesterUserId, String);
  check(requesterToken, String);
  // check(payload, {
  //   annotation: {
  //     type: String,
  //     points: [Number],
  //     color: Number,
  //     transparency: Boolean,
  //     status: String,
  //     thickness: Number,
  //     id: String,
  //     whiteboardId: String,
  //   },
  //   whiteboard_id: String,
  // });

  // if (!isAllowedTo('sendAnnotation', credentials)) {
  //   throw new Meteor.Error('not-allowed', `You are not allowed to send the annotation`);
  // }


  /* NEW ANNOTATION STRUCTURE :

  "core":{
      "header":{
         "name":"SendWhiteboardAnnotationEvtMsg",
         "meetingId":"183f0bf3a0982a127bdb8161e0c44eb696b3e75c-1501258206821",
         "userId":"w_ergiymaqlcrj"
      },
      "body":{
         "annotation":{
            "id":"w_ergiymaqlcrj-4-1501294138835",
            "status":"DRAW_START",
            "annotationType":"rectangle",
            "annotationInfo":{
               "color":0,
               "thickness":0.1201923076923077,
               "points":[
                  45.673077,
                  15.384615,
                  57.451923,
                  27.083334
               ],
               "id":"w_ergiymaqlcrj-4-1501294138835",
               "whiteboardId":"d2d9a672040fbde2a47a10bf6c37b6a4b5ae187f-1501258206856/1",
               "status":"DRAW_START",
               "transparency":false,
               "type":"rectangle"
            },
            "wbId":"d2d9a672040fbde2a47a10bf6c37b6a4b5ae187f-1501258206856/1",
            "userId":"w_ergiymaqlcrj",
            "position":4
         }
      }
   }
   */


  const header = {
    name: EVENT_NAME,
    meetingId,
    userId: requesterUserId,
  };


  payload.annotation.id = `${requesterUserId}-${payload.annotation.id}`;
  payload.requester_id = requesterUserId;
  payload.meeting_id = meetingId;

  return RedisPubSub.publish(CHANNEL, EVENT_NAME, payload);
}
